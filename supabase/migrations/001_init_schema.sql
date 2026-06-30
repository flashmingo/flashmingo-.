-- ============================================================
-- FlashMingo — Migration 001: Core Schema
-- ============================================================
-- Designed for Google Workspace for Education OAuth.
-- No username/password — identity comes from auth.users.
-- Multi-tenant: district_id is the tenant boundary.
-- ============================================================

BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- trigram for fuzzy search
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- accent-insensitive search

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE public.user_role AS ENUM ('student', 'teacher', 'administrator');
CREATE TYPE public.account_status AS ENUM ('pending', 'approved', 'suspended');
CREATE TYPE public.district_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================================
-- SHARED TRIGGER FUNCTION: updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- DISTRICTS
-- Tenant root. Every school is part of a district.
-- ============================================================

CREATE TABLE public.districts (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  domain      text,           -- e.g. "clevelandmetroschools.org" — used to auto-assign users
  status      public.district_status NOT NULL DEFAULT 'pending',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER districts_updated_at
  BEFORE UPDATE ON public.districts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- PROFILES
-- One row per auth.users entry. Created automatically by
-- handle_new_user() trigger on first Google login.
-- ============================================================

CREATE TABLE public.profiles (
  id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           text CHECK (char_length(full_name) <= 200),
  avatar_url          text,
  role                public.user_role NOT NULL DEFAULT 'student',
  district_id         uuid REFERENCES public.districts(id) ON DELETE SET NULL,
  account_status      public.account_status NOT NULL DEFAULT 'pending',
  leaderboard_opt_in  boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  last_login_at       timestamptz
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON GOOGLE SIGN-IN
-- Pulls full_name + avatar_url from Google OAuth metadata.
-- Auto-assigns district based on email domain if one matches.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _district_id uuid;
  _email_domain text;
BEGIN
  -- Extract domain from email to auto-assign district
  _email_domain := split_part(NEW.email, '@', 2);

  SELECT id INTO _district_id
  FROM public.districts
  WHERE domain = _email_domain AND status = 'approved'
  LIMIT 1;

  INSERT INTO public.profiles (
    id,
    full_name,
    avatar_url,
    district_id,
    account_status,
    last_login_at
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    _district_id,
    -- Auto-approve if domain matched a known district; else pending
    CASE WHEN _district_id IS NOT NULL THEN 'approved' ELSE 'pending' END,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name     = EXCLUDED.full_name,
    avatar_url    = EXCLUDED.avatar_url,
    last_login_at = now(),
    updated_at    = now();

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FOLDERS
-- Users organize decks into folders. Top-level only for MVP.
-- ============================================================

CREATE TABLE public.folders (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  color       text CHECK (color ~ '^#[0-9a-fA-F]{6}$'),  -- hex color
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER folders_updated_at
  BEFORE UPDATE ON public.folders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TAGS
-- Flat taxonomy scoped to a user. Teachers/admins can create
-- district-level tags (district_id set, owner_id = creator).
-- ============================================================

CREATE TABLE public.tags (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  district_id uuid REFERENCES public.districts(id) ON DELETE CASCADE,
  name        text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 50),
  color       text CHECK (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at  timestamptz NOT NULL DEFAULT now(),
  -- Unique tag name per user (and per district for district-level tags)
  UNIQUE (owner_id, name)
);

-- ============================================================
-- DECKS
-- A flashcard collection owned by a user.
-- card_count is denormalized and maintained by trigger.
-- search_vector enables full-text search.
-- ============================================================

CREATE TABLE public.decks (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  folder_id       uuid REFERENCES public.folders(id) ON DELETE SET NULL,
  name            text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description     text CHECK (char_length(description) <= 500),
  is_public       boolean NOT NULL DEFAULT false,
  card_count      integer NOT NULL DEFAULT 0 CHECK (card_count >= 0),
  -- Full-text search vector (name + description)
  search_vector   tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER decks_updated_at
  BEFORE UPDATE ON public.decks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- DECK ↔ TAG junction
-- ============================================================

CREATE TABLE public.deck_tags (
  deck_id     uuid NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  tag_id      uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (deck_id, tag_id)
);

-- ============================================================
-- FLASHCARDS
-- Individual Q/A cards in a deck.
-- sort_order controls display order within a deck.
-- front/back support plain text for MVP; rich content in Phase 4.
-- ============================================================

CREATE TABLE public.flashcards (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id          uuid NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  front_text       text NOT NULL CHECK (char_length(front_text) BETWEEN 1 AND 2000),
  front_image_url  text,
  back_text        text NOT NULL CHECK (char_length(back_text) BETWEEN 1 AND 2000),
  back_image_url   text,
  sort_order       integer NOT NULL DEFAULT 0,
  -- Full-text search vector (front + back text)
  search_vector    tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(front_text, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(back_text, '')), 'B')
  ) STORED,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER flashcards_updated_at
  BEFORE UPDATE ON public.flashcards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- CARD COUNT TRIGGER
-- Keeps decks.card_count accurate without COUNT(*) on reads.
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_deck_card_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.decks SET card_count = card_count + 1 WHERE id = NEW.deck_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.decks SET card_count = card_count - 1 WHERE id = OLD.deck_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.deck_id <> NEW.deck_id THEN
    UPDATE public.decks SET card_count = card_count - 1 WHERE id = OLD.deck_id;
    UPDATE public.decks SET card_count = card_count + 1 WHERE id = NEW.deck_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER flashcards_card_count
  AFTER INSERT OR DELETE OR UPDATE OF deck_id ON public.flashcards
  FOR EACH ROW EXECUTE FUNCTION public.update_deck_card_count();

-- ============================================================
-- USER CARD PROGRESS (SM-2)
-- One row per (user, flashcard). Tracks spaced repetition state.
-- ease_factor: 1.3–2.5+ (default 2.5)
-- interval_days: 0 = due immediately
-- repetitions: successful review streak
-- ============================================================

CREATE TABLE public.user_card_progress (
  user_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  flashcard_id     uuid NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  ease_factor      numeric(4, 2) NOT NULL DEFAULT 2.5 CHECK (ease_factor >= 1.3),
  interval_days    integer NOT NULL DEFAULT 0 CHECK (interval_days >= 0),
  repetitions      integer NOT NULL DEFAULT 0 CHECK (repetitions >= 0),
  last_reviewed_at timestamptz,
  next_review_at   timestamptz NOT NULL DEFAULT now(),
  total_reviews    integer NOT NULL DEFAULT 0 CHECK (total_reviews >= 0),
  correct_reviews  integer NOT NULL DEFAULT 0 CHECK (correct_reviews >= 0),
  last_confidence  smallint CHECK (last_confidence BETWEEN 0 AND 5),
  PRIMARY KEY (user_id, flashcard_id),
  CONSTRAINT correct_lte_total CHECK (correct_reviews <= total_reviews)
);

-- ============================================================
-- CLASSROOMS
-- Teacher-created groups of students. Identified by a join code.
-- ============================================================

CREATE TABLE public.classrooms (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  district_id     uuid REFERENCES public.districts(id) ON DELETE SET NULL,
  name            text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description     text CHECK (char_length(description) <= 500),
  classroom_code  text NOT NULL UNIQUE CHECK (classroom_code ~ '^[A-Z0-9]{8}$'),
  is_archived     boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER classrooms_updated_at
  BEFORE UPDATE ON public.classrooms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- STUDENT ↔ CLASSROOM membership
-- ============================================================

CREATE TABLE public.student_classroom_memberships (
  student_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  classroom_id  uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  joined_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, classroom_id)
);

-- ============================================================
-- CLASSROOM ↔ DECK shares
-- Teachers share decks with their whole classroom.
-- ============================================================

CREATE TABLE public.classroom_deck_shares (
  classroom_id  uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  deck_id       uuid NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  shared_by_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (classroom_id, deck_id)
);

-- ============================================================
-- STUDY SESSIONS
-- Each time a user starts studying a deck, a session is created.
-- total_time_seconds: updated when session ends.
-- ============================================================

CREATE TABLE public.study_sessions (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  deck_id             uuid NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  started_at          timestamptz NOT NULL DEFAULT now(),
  ended_at            timestamptz,
  cards_reviewed      integer NOT NULL DEFAULT 0 CHECK (cards_reviewed >= 0),
  correct_count       integer NOT NULL DEFAULT 0 CHECK (correct_count >= 0),
  total_time_seconds  integer NOT NULL DEFAULT 0 CHECK (total_time_seconds >= 0),
  CONSTRAINT correct_lte_reviewed CHECK (correct_count <= cards_reviewed)
);

-- ============================================================
-- AUDIT LOGS
-- Immutable append-only log for FERPA/COPPA/SB-29 compliance.
-- No UPDATE or DELETE via RLS — log rotation is via scheduled jobs
-- or partitioning (Phase 14: Production Hardening).
-- ============================================================

CREATE TABLE public.audit_logs (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type    text NOT NULL,               -- e.g. 'user_login', 'deck_created'
  resource_type  text,                        -- e.g. 'deck', 'flashcard'
  resource_id    text,                        -- UUID of affected resource
  details        jsonb,                       -- Additional event context
  ip_address     inet,
  user_agent     text,
  timestamp      timestamptz NOT NULL DEFAULT now()
);

COMMIT;
