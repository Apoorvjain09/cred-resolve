create table if not exists public.exam_helper_latest_message (
  id text primary key,
  message text not null,
  updated_at timestamptz not null default now()
);
