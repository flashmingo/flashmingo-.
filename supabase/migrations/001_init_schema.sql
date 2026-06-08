-- Kenmei MVP Schema
-- Phase 3: Initial database setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- CORE TABLES
-- =====================================================================

-- Districts (school districts for future expansion)
CREATE TABLE public.districts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Profiles (user accounts - linked to auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'administrator')),
  district_id uuid REFERENCES public.districts(id) ON DELETE SET NULL,
  account_status text NOT NULL DEFAULT 'pending' CHECK (account_status IN ('pending', 'approved', 'rejected')),
  leaderboard_opt_in boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  last_login_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now()
);

-- Classrooms (teacher-managed learning groups)
CREATE TABLE public.classrooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  district_id uuid REFERENCES public.districts(id) ON DELETE SET NULL,
  name text NOT NULL,
  classroom_code text NOT NULL UNIQUE, -- 8-char code for students to join
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Student-Classroom Memberships
CREATE TABLE public.student_classroom_memberships (
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  joined_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (student_id, classroom_id)
);

-- Decks (flashcard collections)
CREATE TABLE public.decks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Flashcards (individual flashcards)
CREATE TABLE public.flashcards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id uuid NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  front_text text NOT NULL,
  front_image_url text, -- Signed URL from Supabase Storage
  back_text text NOT NULL,
  back_image_url text,  -- Signed URL from Supabase Storage
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- User Card Progress (SM-2 spaced repetition data)
CREATE TABLE public.user_card_progress (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  flashcard_id uuid NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  ease_factor numeric(4, 2) DEFAULT 2.5, -- SM-2 ease factor (1.3 to 2.5+)
  interval_days integer DEFAULT 0,       -- Days until next review
  repetitions integer DEFAULT 0,          -- Number of times reviewed
  last_reviewed_at timestamp with time zone,
  next_review_at timestamp with time zone DEFAULT now(),
  total_reviews integer DEFAULT 0,
  correct_reviews integer DEFAULT 0,
  last_confidence integer,                -- 1-5 confidence rating
  last_accuracy numeric(3, 2),            -- Accuracy % on last review
  PRIMARY KEY (user_id, flashcard_id)
);

-- Study Sessions (activity tracking)
CREATE TABLE public.study_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  deck_id uuid NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  started_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  cards_reviewed integer DEFAULT 0,
  correct_count integer DEFAULT 0,
  total_time_minutes integer DEFAULT 0
);

-- Audit Logs (security & compliance)
CREATE TABLE public.audit_logs (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type text NOT NULL, -- e.g., 'user_signup', 'user_login', 'deck_created'
  resource_type text,        -- e.g., 'deck', 'flashcard', 'study_session'
  resource_id text,          -- UUID of affected resource
  details jsonb,             -- Additional context
  ip_address inet,
  user_agent text,
  timestamp timestamp with time zone DEFAULT now()
);

-- =====================================================================
-- CLASSROOM DECK SHARING (junction table for sharing decks with classrooms)
-- =====================================================================

CREATE TABLE public.classroom_deck_shares (
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  deck_id uuid NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  shared_by_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (classroom_id, deck_id)
);

-- =====================================================================
-- SETUP DEFAULTS
-- =====================================================================

-- Update profiles.updated_at on every update
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_update_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER districts_update_updated_at
BEFORE UPDATE ON districts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER classrooms_update_updated_at
BEFORE UPDATE ON classrooms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER decks_update_updated_at
BEFORE UPDATE ON decks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER flashcards_update_updated_at
BEFORE UPDATE ON flashcards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
