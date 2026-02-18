create extension if not exists pgcrypto;

create table if not exists public.poll_rooms (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.poll_room_options (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.poll_rooms(id) on delete cascade,
  option_text text not null,
  option_order int not null,
  created_at timestamptz not null default now()
);

create table if not exists public.poll_room_votes (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.poll_rooms(id) on delete cascade,
  option_id uuid not null references public.poll_room_options(id) on delete cascade,
  voter_hash text not null,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists poll_room_votes_room_voter_unique
  on public.poll_room_votes(room_id, voter_hash);

create unique index if not exists poll_room_votes_room_ip_unique
  on public.poll_room_votes(room_id, ip_hash);

create index if not exists poll_room_options_room_order_idx
  on public.poll_room_options(room_id, option_order);

create index if not exists poll_room_votes_room_idx
  on public.poll_room_votes(room_id);
