begin;

create table if not exists public.attendance_record_images (
  id uuid primary key default gen_random_uuid(),
  attendance_record_id uuid not null references public.attendance_records(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('photo', 'ticket')),
  storage_path text not null unique,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now()
);

create index if not exists attendance_record_images_record_order_idx
  on public.attendance_record_images (attendance_record_id, type, sort_order, created_at);

alter table public.attendance_record_images enable row level security;
revoke all on table public.attendance_record_images from anon, authenticated;
grant select, insert, delete on table public.attendance_record_images to authenticated;

drop policy if exists "Users can view own record images" on public.attendance_record_images;
create policy "Users can view own record images"
  on public.attendance_record_images for select to authenticated
  using (
    (select auth.uid()) = user_id
    and split_part(storage_path, '/', 1) = (select auth.uid())::text
    and split_part(storage_path, '/', 2) = attendance_record_id::text
    and exists (
      select 1 from public.attendance_records
      where attendance_records.id = attendance_record_images.attendance_record_id
        and attendance_records.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can add images to own records" on public.attendance_record_images;
create policy "Users can add images to own records"
  on public.attendance_record_images for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and split_part(storage_path, '/', 1) = (select auth.uid())::text
    and split_part(storage_path, '/', 2) = attendance_record_id::text
    and exists (
      select 1 from public.attendance_records
      where attendance_records.id = attendance_record_images.attendance_record_id
        and attendance_records.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can delete own record images" on public.attendance_record_images;
create policy "Users can delete own record images"
  on public.attendance_record_images for delete to authenticated
  using (
    (select auth.uid()) = user_id
    and split_part(storage_path, '/', 1) = (select auth.uid())::text
    and split_part(storage_path, '/', 2) = attendance_record_id::text
    and exists (
      select 1 from public.attendance_records
      where attendance_records.id = attendance_record_images.attendance_record_id
        and attendance_records.user_id = (select auth.uid())
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'attendance-record-images',
  'attendance-record-images',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can read own record image objects" on storage.objects;
create policy "Users can read own record image objects"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'attendance-record-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can upload own record image objects" on storage.objects;
create policy "Users can upload own record image objects"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'attendance-record-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete own record image objects" on storage.objects;
create policy "Users can delete own record image objects"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'attendance-record-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

commit;
