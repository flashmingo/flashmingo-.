-- ═══════════════════════════════════════════════════════════════════════════
-- DEMO SEED — makes the dashboard look alive for a presentation.
--
-- HOW TO USE
--   1. Sign in to FlashMingo once with the Google account you'll demo with
--   2. Find your user id:  select id, full_name from public.profiles;
--   3. Replace YOUR-USER-ID-HERE below (one place)
--   4. Run this whole file in the Supabase SQL editor
--
-- WHAT IT CREATES for that account:
--   • 2 polished decks (Biology, Spanish) with 6 cards each + SM-2 progress
--     (a few cards due now, so the review forecast shows work to do)
--   • 18 days of study sessions across the last 21 days (streak of 5,
--     filled heatmap, varied intensity)
--   • Matching XP ledger (~level 4) — achievements & quests then unlock
--     automatically the first time the dashboard loads
--
-- Safe to re-run: deletes only the rows it created (tagged deck names).
-- ═══════════════════════════════════════════════════════════════════════════

do $$
declare
  demo_user uuid := 'YOUR-USER-ID-HERE';
  deck_bio  uuid;
  deck_spa  uuid;
  card_ids  uuid[];
  cid       uuid;
  d         integer;
  sess_date timestamptz;
  cards_n   integer;
begin
  -- ── Clean previous runs ────────────────────────────────────────────────
  delete from public.decks where owner_id = demo_user and name in ('AP Biology — Cell Structure', 'Spanish 2 — Irregular Verbs');
  delete from public.study_sessions where user_id = demo_user and deck_id not in (select id from public.decks);
  delete from public.xp_events where user_id = demo_user and metadata->>'seed' = 'demo';

  -- ── Decks ──────────────────────────────────────────────────────────────
  insert into public.decks (owner_id, name, description, is_public)
  values (demo_user, 'AP Biology — Cell Structure', 'Organelles, membranes, and transport for the AP Bio midterm.', false)
  returning id into deck_bio;

  insert into public.decks (owner_id, name, description, is_public)
  values (demo_user, 'Spanish 2 — Irregular Verbs', 'Preterite and present-tense irregulars: ser, ir, tener, estar.', false)
  returning id into deck_spa;

  -- ── Cards ──────────────────────────────────────────────────────────────
  insert into public.flashcards (deck_id, front_text, back_text, sort_order) values
    (deck_bio, 'What is the function of the mitochondria?', 'Generates ATP through cellular respiration — the cell''s primary energy source.', 0),
    (deck_bio, 'Why is the cell membrane described as a fluid mosaic?', 'Proteins float in a flexible phospholipid bilayer, so the pattern shifts like a mosaic in motion.', 1),
    (deck_bio, 'What happens to a cell in a hypertonic solution?', 'Water moves out by osmosis and the cell shrinks (crenation).', 2),
    (deck_bio, 'Which organelle packages and ships proteins?', 'The Golgi apparatus — it modifies, sorts, and packages proteins for secretion or delivery.', 3),
    (deck_bio, 'How do ribosomes differ from other organelles?', 'They are not membrane-bound; they assemble proteins and are found free or on the rough ER.', 4),
    (deck_bio, 'What distinguishes active transport from diffusion?', 'Active transport moves molecules against the concentration gradient and requires ATP.', 5),
    (deck_spa, '¿Cómo se conjuga "ser" en yo (presente)?', 'soy — Yo soy estudiante.', 0),
    (deck_spa, '"Ir" in the preterite — ellos form?', 'fueron — Ellos fueron al mercado.', 1),
    (deck_spa, 'What does "tener que + infinitive" mean?', 'To have to do something — Tengo que estudiar (I have to study).', 2),
    (deck_spa, '"Estar" — nosotros (presente)?', 'estamos — Estamos en clase.', 3),
    (deck_spa, 'When do you use "ser" vs "estar" for location?', 'Estar for location of people/things; ser for where events take place.', 4),
    (deck_spa, '"Tener" — tú form (presente)?', 'tienes — ¿Tienes tiempo?', 5);

  -- ── SM-2 progress: most cards learned, a few due now ───────────────────
  select array_agg(id) into card_ids from public.flashcards where deck_id in (deck_bio, deck_spa);
  d := 0;
  foreach cid in array card_ids loop
    insert into public.user_card_progress
      (user_id, flashcard_id, ease_factor, interval_days, repetitions,
       last_reviewed_at, next_review_at, total_reviews, correct_reviews, last_confidence)
    values
      (demo_user, cid,
       2.3 + (d % 4) * 0.1,
       case when d % 4 = 0 then 1 else 3 + (d % 5) end,
       2 + (d % 4),
       now() - interval '1 day',
       case when d % 3 = 0 then now() - interval '2 hours'          -- due now
            when d % 3 = 1 then now() + interval '20 hours'         -- due today
            else now() + interval '3 days' end,                     -- this week
       3 + (d % 4), 2 + (d % 3), 3 + (d % 3))
    on conflict (user_id, flashcard_id) do nothing;
    d := d + 1;
  end loop;

  -- ── 18 study days across the last 21 (current 5-day streak) ───────────
  for d in 0..20 loop
    if d <= 4 or d not in (5, 9, 13) then     -- gaps on days 5/9/13 back
      sess_date := now() - (d || ' days')::interval - interval '3 hours';
      cards_n := 8 + ((d * 7) % 17);          -- varied 8–24 cards
      insert into public.study_sessions
        (user_id, deck_id, started_at, ended_at, cards_reviewed, correct_count, total_time_seconds)
      values
        (demo_user, case when d % 2 = 0 then deck_bio else deck_spa end,
         sess_date, sess_date + interval '11 minutes',
         cards_n, cards_n - (d % 4), 660);
      -- Matching XP: ~10 XP per card + 15 session bonus
      insert into public.xp_events (user_id, amount, reason, metadata, created_at)
      values (demo_user, cards_n * 10 + 15, 'session_complete',
              jsonb_build_object('seed', 'demo'), sess_date + interval '11 minutes');
    end if;
  end loop;

  raise notice 'Demo data seeded for %', demo_user;
end $$;
