-- Adds shared KBO games without changing attendance record snapshots.

begin;

create extension if not exists pgcrypto;

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

alter table public.attendance_records
  add column if not exists game_id uuid null;

do $$
begin
  if exists (
    select 1
    from public.attendance_records as attendance_record
    left join public.games as game on game.id = attendance_record.game_id
    where attendance_record.game_id is not null
      and game.id is null
  ) then
    raise exception 'attendance_records.game_id contains values that do not exist in public.games';
  end if;

  if not exists (
    select 1
    from pg_constraint as constraint_definition
    join pg_attribute as constrained_column
      on constrained_column.attrelid = constraint_definition.conrelid
      and constrained_column.attnum = any (constraint_definition.conkey)
    where constraint_definition.contype = 'f'
      and constraint_definition.conrelid = 'public.attendance_records'::regclass
      and constraint_definition.confrelid = 'public.games'::regclass
      and constrained_column.attname = 'game_id'
  ) then
    alter table public.attendance_records
      add constraint attendance_records_game_id_fkey
      foreign key (game_id) references public.games(id) on delete set null;
  end if;
end
$$;

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

drop trigger if exists games_set_updated_at on public.games;
create trigger games_set_updated_at
  before update on public.games
  for each row execute function public.set_updated_at();

alter table public.games enable row level security;
revoke all on table public.games from anon, authenticated;
grant select on table public.games to authenticated;
grant all on table public.games to service_role;

drop policy if exists "Authenticated users can view games" on public.games;
create policy "Authenticated users can view games"
  on public.games for select
  to authenticated
  using (true);

commit;
