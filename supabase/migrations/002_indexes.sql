-- ============================================================
-- FlashMingo — Migration 002: Indexes
-- ============================================================
-- Strategy:
--   - Single-column indexes for FK lookups and filter columns
--   - Composite indexes for the exact queries the app issues
--   - GIN indexes for full-text search (tsvector columns)
--   - GIN trigram indexes for ILIKE / autocomplete
--   - Partial indexes where cardinality is low (e.g. is_public)
-- ============================================================

BEGIN;

-- ============================================================
-- DISTRICTS
-- ============================================================

CREATE INDEX districts_domain_idx ON public.districts(domain)
  WHERE domain IS NOT NULL;

CREATE INDEX districts_status_idx ON public.districts(status);

-- ============================================================
-- PROFILES
-- ============================================================

CREATE INDEX profiles_district_id_idx ON public.profiles(district_id)
  WHERE district_id IS NOT NULL;

CREATE INDEX profiles_role_idx ON public.profiles(role);

CREATE INDEX profiles_account_status_idx ON public.profiles(account_status);

-- Trigram index for admin user search by name
CREATE INDEX profiles_full_name_trgm_idx
  ON public.profiles USING gin(full_name gin_trgm_ops)
  WHERE full_name IS NOT NULL;

-- ============================================================
-- FOLDERS
-- ============================================================

CREATE INDEX folders_owner_id_idx ON public.folders(owner_id);

-- ============================================================
-- TAGS
-- ============================================================

CREATE INDEX tags_owner_id_idx ON public.tags(owner_id);

CREATE INDEX tags_district_id_idx ON public.tags(district_id)
  WHERE district_id IS NOT NULL;

-- ============================================================
-- DECKS
-- ============================================================

-- Primary list query: owner's decks ordered by last update
CREATE INDEX decks_owner_updated_idx
  ON public.decks(owner_id, updated_at DESC);

-- Browse public decks
CREATE INDEX decks_public_idx ON public.decks(is_public, updated_at DESC)
  WHERE is_public = true;

CREATE INDEX decks_folder_id_idx ON public.decks(folder_id)
  WHERE folder_id IS NOT NULL;

-- Full-text search on decks
CREATE INDEX decks_search_vector_idx
  ON public.decks USING gin(search_vector);

-- Trigram for autocomplete / partial-name search
CREATE INDEX decks_name_trgm_idx
  ON public.decks USING gin(name gin_trgm_ops);

-- ============================================================
-- DECK_TAGS
-- ============================================================

CREATE INDEX deck_tags_deck_id_idx ON public.deck_tags(deck_id);
CREATE INDEX deck_tags_tag_id_idx  ON public.deck_tags(tag_id);

-- ============================================================
-- FLASHCARDS
-- ============================================================

-- Ordered card list within a deck (the most common query)
CREATE INDEX flashcards_deck_sort_idx
  ON public.flashcards(deck_id, sort_order ASC);

-- Full-text search on flashcard content
CREATE INDEX flashcards_search_vector_idx
  ON public.flashcards USING gin(search_vector);

-- ============================================================
-- USER_CARD_PROGRESS (SM-2 queries — highest traffic table)
-- ============================================================

-- "Which cards are due for review right now?"
-- This is the primary SM-2 study query — critical path
CREATE INDEX user_card_progress_due_idx
  ON public.user_card_progress(user_id, next_review_at ASC);

-- "What is my progress on all cards in this deck?"
-- Used on the deck detail / study summary page
CREATE INDEX user_card_progress_user_flashcard_idx
  ON public.user_card_progress(user_id, flashcard_id);

-- "Dashboard stats: how many cards reviewed today?"
CREATE INDEX user_card_progress_last_reviewed_idx
  ON public.user_card_progress(user_id, last_reviewed_at DESC)
  WHERE last_reviewed_at IS NOT NULL;

-- ============================================================
-- CLASSROOMS
-- ============================================================

CREATE INDEX classrooms_teacher_id_idx ON public.classrooms(teacher_id);

CREATE INDEX classrooms_district_id_idx ON public.classrooms(district_id)
  WHERE district_id IS NOT NULL;

-- Unique join code lookup (already UNIQUE, index implicit — explicit for clarity)
CREATE INDEX classrooms_code_idx ON public.classrooms(classroom_code);

-- Active classrooms only (most queries filter out archived)
CREATE INDEX classrooms_active_teacher_idx
  ON public.classrooms(teacher_id, created_at DESC)
  WHERE is_archived = false;

-- ============================================================
-- STUDENT_CLASSROOM_MEMBERSHIPS
-- ============================================================

CREATE INDEX scm_student_id_idx   ON public.student_classroom_memberships(student_id);
CREATE INDEX scm_classroom_id_idx ON public.student_classroom_memberships(classroom_id);

-- ============================================================
-- CLASSROOM_DECK_SHARES
-- ============================================================

CREATE INDEX cds_classroom_id_idx ON public.classroom_deck_shares(classroom_id);
CREATE INDEX cds_deck_id_idx      ON public.classroom_deck_shares(deck_id);

-- ============================================================
-- STUDY_SESSIONS
-- ============================================================

-- User's study history ordered by recency
CREATE INDEX study_sessions_user_started_idx
  ON public.study_sessions(user_id, started_at DESC);

CREATE INDEX study_sessions_deck_id_idx ON public.study_sessions(deck_id);

-- Teacher dashboard: sessions within a classroom (via user_id IN subquery)
CREATE INDEX study_sessions_user_deck_idx
  ON public.study_sessions(user_id, deck_id, started_at DESC);

-- ============================================================
-- AUDIT_LOGS
-- ============================================================

CREATE INDEX audit_logs_user_id_idx   ON public.audit_logs(user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX audit_logs_timestamp_idx ON public.audit_logs(timestamp DESC);

CREATE INDEX audit_logs_action_idx    ON public.audit_logs(action_type, timestamp DESC);

-- Compliance drill-down: find all events affecting a resource
CREATE INDEX audit_logs_resource_idx
  ON public.audit_logs(resource_type, resource_id)
  WHERE resource_type IS NOT NULL;

COMMIT;
