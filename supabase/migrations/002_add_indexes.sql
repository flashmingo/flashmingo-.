-- Phase 3: Indexes for performance

-- =====================================================================
-- LOOKUP INDEXES
-- =====================================================================

-- Profiles
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
CREATE INDEX IF NOT EXISTS profiles_district_id_idx ON profiles(district_id);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS profiles_account_status_idx ON profiles(account_status);

-- Classrooms
CREATE INDEX IF NOT EXISTS classrooms_teacher_id_idx ON classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS classrooms_district_id_idx ON classrooms(district_id);
CREATE INDEX IF NOT EXISTS classrooms_classroom_code_idx ON classrooms(classroom_code);

-- Student Classroom Memberships
CREATE INDEX IF NOT EXISTS student_classroom_student_id_idx ON student_classroom_memberships(student_id);
CREATE INDEX IF NOT EXISTS student_classroom_classroom_id_idx ON student_classroom_memberships(classroom_id);

-- Decks
CREATE INDEX IF NOT EXISTS decks_owner_id_idx ON decks(owner_id);
CREATE INDEX IF NOT EXISTS decks_is_public_idx ON decks(is_public);

-- Flashcards
CREATE INDEX IF NOT EXISTS flashcards_deck_id_idx ON flashcards(deck_id);

-- User Card Progress (SM-2 queries)
CREATE INDEX IF NOT EXISTS user_card_progress_user_id_idx ON user_card_progress(user_id);
CREATE INDEX IF NOT EXISTS user_card_progress_flashcard_id_idx ON user_card_progress(flashcard_id);
CREATE INDEX IF NOT EXISTS user_card_progress_next_review_idx ON user_card_progress(next_review_at); -- Critical for SM-2
CREATE INDEX IF NOT EXISTS user_card_progress_deck_idx ON user_card_progress USING btree(user_id, flashcard_id);

-- Study Sessions
CREATE INDEX IF NOT EXISTS study_sessions_user_id_idx ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS study_sessions_deck_id_idx ON study_sessions(deck_id);
CREATE INDEX IF NOT EXISTS study_sessions_started_at_idx ON study_sessions(started_at);

-- Audit Logs
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_type_idx ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS audit_logs_timestamp_idx ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS audit_logs_resource_idx ON audit_logs(resource_type, resource_id);

-- Classroom Deck Shares
CREATE INDEX IF NOT EXISTS classroom_deck_shares_classroom_idx ON classroom_deck_shares(classroom_id);
CREATE INDEX IF NOT EXISTS classroom_deck_shares_deck_idx ON classroom_deck_shares(deck_id);

-- =====================================================================
-- COMPOSITE INDEXES (for common queries)
-- =====================================================================

-- Get all decks owned by a user
CREATE INDEX IF NOT EXISTS decks_owner_created_idx ON decks(owner_id, created_at DESC);

-- Get all flashcards in a deck
CREATE INDEX IF NOT EXISTS flashcards_deck_created_idx ON flashcards(deck_id, created_at);

-- Get all cards to review for a user (SM-2 study queries)
CREATE INDEX IF NOT EXISTS user_card_progress_review_idx ON user_card_progress(user_id, next_review_at);

-- Get study session history
CREATE INDEX IF NOT EXISTS study_sessions_user_created_idx ON study_sessions(user_id, started_at DESC);
