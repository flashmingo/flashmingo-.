-- ═══════════════════════════════════════════════════════════════════════════
-- 005: Gamification — XP, levels, achievements, quests
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── XP ledger ────────────────────────────────────────────────────────────
-- Append-only. Total XP = sum(amount). Level is derived in application code
-- from total XP (see src/lib/gamification.ts) rather than stored, so the
-- levelling curve can be tuned without a migration.
create table if not exists public.xp_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  amount      integer not null check (amount > 0),
  reason      text not null check (reason in (
                'card_review', 'perfect_review', 'session_complete',
                'quest_daily', 'quest_weekly', 'achievement_unlock'
              )),
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

alter table public.xp_events enable row level security;

create policy "Users can view their own xp events"
  on public.xp_events for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert their own xp events"
  on public.xp_events for insert
  to authenticated
  with check (user_id = auth.uid());

create index if not exists xp_events_user_created_idx
  on public.xp_events (user_id, created_at desc);

-- ── Achievement catalog ─────────────────────────────────────────────────
create table if not exists public.achievements (
  id             text primary key,
  title          text not null,
  description    text not null,
  icon           text not null,        -- lucide-react icon name
  tier           text not null check (tier in ('bronze', 'silver', 'gold')),
  criteria_type  text not null check (criteria_type in ('streak', 'total_cards', 'total_sessions', 'level')),
  criteria_value integer not null,
  xp_reward      integer not null default 50,
  sort_order     integer not null default 0
);

alter table public.achievements enable row level security;

create policy "Anyone authenticated can read the achievement catalog"
  on public.achievements for select
  to authenticated
  using (true);

insert into public.achievements (id, title, description, icon, tier, criteria_type, criteria_value, xp_reward, sort_order) values
  ('first_steps',      'First Steps',        'Review your first flashcard',           'Sparkles',    'bronze', 'total_cards',    1,    25,  1),
  ('century',          'Century Club',       'Review 100 cards',                      'Layers',      'bronze', 'total_cards',    100,  75,  2),
  ('thousand_cards',   'Card Master',        'Review 1,000 cards',                    'Trophy',      'gold',   'total_cards',    1000, 250, 3),
  ('first_session',    'Getting Started',    'Complete your first study session',     'Rocket',      'bronze', 'total_sessions', 1,    25,  4),
  ('dedicated',        'Dedicated Learner',  'Complete 25 study sessions',             'GraduationCap','silver','total_sessions', 25,   100, 5),
  ('three_day_streak', 'Warming Up',         'Study 3 days in a row',                  'Flame',       'bronze', 'streak',         3,    30,  6),
  ('week_streak',      'On Fire',            'Study 7 days in a row',                  'Flame',       'silver', 'streak',         7,    100, 7),
  ('month_streak',     'Unstoppable',        'Study 30 days in a row',                 'Flame',       'gold',   'streak',         30,   400, 8),
  ('level_5',          'Rising Star',        'Reach level 5',                          'Star',        'silver', 'level',          5,    100, 9),
  ('level_10',         'Scholar',            'Reach level 10',                         'Award',       'gold',   'level',          10,   250, 10)
on conflict (id) do nothing;

-- ── User achievement unlocks ─────────────────────────────────────────────
create table if not exists public.user_achievements (
  user_id        uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete cascade,
  unlocked_at    timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

create policy "Users can view their own achievement unlocks"
  on public.user_achievements for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can unlock their own achievements"
  on public.user_achievements for insert
  to authenticated
  with check (user_id = auth.uid());

-- ── Quest catalog ────────────────────────────────────────────────────────
-- Quest progress is computed live from study_sessions / xp_events for the
-- current period — nothing to keep in sync. Only the *claim* (has the XP
-- reward been paid out for this period) is persisted, in user_quest_claims.
create table if not exists public.quest_templates (
  id          text primary key,
  title       text not null,
  description text not null,
  icon        text not null,
  period      text not null check (period in ('daily', 'weekly')),
  goal_type   text not null check (goal_type in ('cards_reviewed', 'sessions_completed', 'study_days')),
  goal_value  integer not null,
  xp_reward   integer not null,
  sort_order  integer not null default 0
);

alter table public.quest_templates enable row level security;

create policy "Anyone authenticated can read the quest catalog"
  on public.quest_templates for select
  to authenticated
  using (true);

insert into public.quest_templates (id, title, description, icon, period, goal_type, goal_value, xp_reward, sort_order) values
  ('daily_review_20',  'Daily Review',    'Review 20 cards today',        'Brain',    'daily',  'cards_reviewed',    20, 30,  1),
  ('daily_session',    'Show Up',         'Complete a study session today','CheckCircle2','daily','sessions_completed',1, 20,  2),
  ('weekly_review_150','Weekly Grind',    'Review 150 cards this week',   'BarChart2','weekly', 'cards_reviewed',    150,120, 3),
  ('weekly_consistency','Stay Consistent','Study on 4 different days this week','CalendarCheck','weekly','study_days',4,100, 4)
on conflict (id) do nothing;

-- ── Quest claims ─────────────────────────────────────────────────────────
-- period_key: 'YYYY-MM-DD' for daily quests, 'YYYY-Www' (ISO week) for weekly.
create table if not exists public.user_quest_claims (
  user_id             uuid not null references public.profiles(id) on delete cascade,
  quest_template_id   text not null references public.quest_templates(id) on delete cascade,
  period_key          text not null,
  claimed_at          timestamptz not null default now(),
  primary key (user_id, quest_template_id, period_key)
);

alter table public.user_quest_claims enable row level security;

create policy "Users can view their own quest claims"
  on public.user_quest_claims for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can claim their own quests"
  on public.user_quest_claims for insert
  to authenticated
  with check (user_id = auth.uid());
