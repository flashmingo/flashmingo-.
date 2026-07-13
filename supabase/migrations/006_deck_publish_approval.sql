-- ═══════════════════════════════════════════════════════════════════════════
-- 006: Deck publish approval
-- Making a deck public now requires review by an admin or by a teacher who
-- shares a classroom with the deck owner. Teachers/admins publishing their
-- own decks are auto-approved (they are the approvers).
--
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- ═══════════════════════════════════════════════════════════════════════════

-- publish_status tracks the request lifecycle; is_public stays the single
-- source of truth for "is this deck actually visible in Browse" and only
-- becomes true once approved.
alter table public.decks
  add column if not exists publish_status text not null default 'private'
    check (publish_status in ('private', 'pending', 'approved', 'rejected')),
  add column if not exists publish_requested_at timestamptz,
  add column if not exists publish_reviewed_by  uuid references public.profiles(id) on delete set null,
  add column if not exists publish_reviewed_at  timestamptz;

comment on column public.decks.publish_status is
  'Lifecycle of a public-visibility request: private → pending → approved/rejected.';

-- Backfill: any deck already public counts as approved so nothing disappears
-- from Browse when this ships.
update public.decks
set publish_status = 'approved'
where is_public = true and publish_status = 'private';

create index if not exists decks_publish_status_idx
  on public.decks (publish_status)
  where publish_status = 'pending';
