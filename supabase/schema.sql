-- Ballog initial schema. Run this file once in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 20),
  favorite_team text null check (favorite_team in ('doosan', 'lg', 'hanwha', 'kia', 'samsung', 'lotte', 'ssg', 'nc', 'kt', 'kiwoom')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  external_game_id text unique,
  season integer not null,
  date date not null,
  start_time time,
  home_team text not null check (home_team in ('doosan', 'lg', 'hanwha', 'kia', 'samsung', 'lotte', 'ssg', 'nc', 'kt', 'kiwoom')),
  away_team text not null check (away_team in ('doosan', 'lg', 'hanwha', 'kia', 'samsung', 'lotte', 'ssg', 'nc', 'kt', 'kiwoom')),
  stadium text,
  status text,
  home_score integer check (home_score is null or home_score >= 0),
  away_score integer check (away_score is null or away_score >= 0),
  source text not null default 'KBO',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (home_team <> away_team)
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id uuid null references public.games(id) on delete set null,
  date date not null,
  home_team text not null check (home_team in ('doosan', 'lg', 'hanwha', 'kia', 'samsung', 'lotte', 'ssg', 'nc', 'kt', 'kiwoom')),
  away_team text not null check (away_team in ('doosan', 'lg', 'hanwha', 'kia', 'samsung', 'lotte', 'ssg', 'nc', 'kt', 'kiwoom')),
  stadium text not null,
  start_time time not null,
  home_score integer not null check (home_score >= 0),
  away_score integer not null check (away_score >= 0),
  seat text,
  companion text,
  memo text check (char_length(memo) <= 100),
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (home_team <> away_team)
);

create index if not exists attendance_records_user_date_idx
  on public.attendance_records (user_id, date desc);

create index if not exists games_date_idx on public.games (date, start_time);
create index if not exists games_home_team_date_idx on public.games (home_team, date desc);
create index if not exists games_away_team_date_idx on public.games (away_team, date desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists attendance_records_set_updated_at on public.attendance_records;
create trigger attendance_records_set_updated_at
  before update on public.attendance_records
  for each row execute function public.set_updated_at();

drop trigger if exists games_set_updated_at on public.games;
create trigger games_set_updated_at
  before update on public.games
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''), split_part(new.email, '@', 1)), 20)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.attendance_records enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.games from anon, authenticated;
revoke all on table public.attendance_records from anon, authenticated;
grant select, update on table public.profiles to authenticated;
grant select on table public.games to authenticated;
grant all on table public.games to service_role;
grant select, insert, update, delete on table public.attendance_records to authenticated;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Authenticated users can view games" on public.games;
create policy "Authenticated users can view games"
  on public.games for select
  to authenticated
  using (true);

drop policy if exists "Users can view own attendance records" on public.attendance_records;
create policy "Users can view own attendance records"
  on public.attendance_records for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create own attendance records" on public.attendance_records;
create policy "Users can create own attendance records"
  on public.attendance_records for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own attendance records" on public.attendance_records;
create policy "Users can update own attendance records"
  on public.attendance_records for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own attendance records" on public.attendance_records;
create policy "Users can delete own attendance records"
  on public.attendance_records for delete
  to authenticated
  using ((select auth.uid()) = user_id);
