-- ═══════════════════════════════════════════════════════════════════════════
-- 004: Demo requests
-- Stores landing-page demo form submissions so district leads are never lost.
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.demo_requests (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  school      text not null,
  use_case    text,
  status      text not null default 'new'
              check (status in ('new', 'contacted', 'closed')),
  created_at  timestamptz not null default now()
);

comment on table public.demo_requests is
  'Demo requests from the public landing page form.';

-- RLS: anonymous visitors may INSERT (submit the form) but never read.
-- Administrators review submissions in the Supabase dashboard.
alter table public.demo_requests enable row level security;

create policy "Anyone can submit a demo request"
  on public.demo_requests
  for insert
  to anon, authenticated
  with check (true);

create policy "Admins can view demo requests"
  on public.demo_requests
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'administrator'
    )
  );

create index if not exists demo_requests_created_at_idx
  on public.demo_requests (created_at desc);
