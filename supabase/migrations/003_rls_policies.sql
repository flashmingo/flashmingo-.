-- Phase 3: Row-Level Security (RLS) Policies

-- =====================================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_classroom_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_card_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_deck_shares ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- HELPER FUNCTION: GET CURRENT USER PROFILE
-- =====================================================================

CREATE OR REPLACE FUNCTION public.current_user_profile()
RETURNS profiles AS $$
  SELECT * FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER SET search_path = public;

-- =====================================================================
-- HELPER FUNCTION: IS ADMIN
-- =====================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT (SELECT role FROM profiles WHERE id = auth.uid()) = 'administrator'
$$ LANGUAGE SQL SECURITY DEFINER SET search_path = public;

-- =====================================================================
-- HELPER FUNCTION: IS TEACHER
-- =====================================================================

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS boolean AS $$
  SELECT (SELECT role FROM profiles WHERE id = auth.uid()) IN ('teacher', 'administrator')
$$ LANGUAGE SQL SECURITY DEFINER SET search_path = public;

-- =====================================================================
-- PROFILES TABLE RLS
-- =====================================================================

-- Users can see their own profile
CREATE POLICY profiles_self_select
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Teachers can see student profiles in their classrooms
CREATE POLICY profiles_teacher_see_students
  ON profiles FOR SELECT
  USING (
    public.is_teacher() AND (
      -- See own profile
      id = auth.uid() OR
      -- See students in own classrooms
      id IN (
        SELECT student_id FROM student_classroom_memberships
        WHERE classroom_id IN (
          SELECT id FROM classrooms WHERE teacher_id = auth.uid()
        )
      )
    )
  );

-- Admins can see all profiles
CREATE POLICY profiles_admin_select
  ON profiles FOR SELECT
  USING (public.is_admin());

-- Users can update their own profile
CREATE POLICY profiles_self_update
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can update any profile
CREATE POLICY profiles_admin_update
  ON profiles FOR UPDATE
  USING (public.is_admin());

-- Service role can insert profiles (during signup)
CREATE POLICY profiles_service_insert
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Admins can delete profiles
CREATE POLICY profiles_admin_delete
  ON profiles FOR DELETE
  USING (public.is_admin());

-- =====================================================================
-- DISTRICTS TABLE RLS
-- =====================================================================

-- All authenticated users can view districts
CREATE POLICY districts_select
  ON districts FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admins can manage districts
CREATE POLICY districts_admin_insert
  ON districts FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY districts_admin_update
  ON districts FOR UPDATE
  USING (public.is_admin());

CREATE POLICY districts_admin_delete
  ON districts FOR DELETE
  USING (public.is_admin());

-- =====================================================================
-- CLASSROOMS TABLE RLS
-- =====================================================================

-- Teachers can see their own classrooms
CREATE POLICY classrooms_teacher_select
  ON classrooms FOR SELECT
  USING (teacher_id = auth.uid());

-- Students can see classrooms they're members of
CREATE POLICY classrooms_student_select
  ON classrooms FOR SELECT
  USING (
    id IN (
      SELECT classroom_id FROM student_classroom_memberships
      WHERE student_id = auth.uid()
    )
  );

-- Admins can see all classrooms
CREATE POLICY classrooms_admin_select
  ON classrooms FOR SELECT
  USING (public.is_admin());

-- Teachers can create classrooms
CREATE POLICY classrooms_teacher_insert
  ON classrooms FOR INSERT
  WITH CHECK (
    public.is_teacher() AND
    teacher_id = auth.uid()
  );

-- Teachers can update their own classrooms
CREATE POLICY classrooms_teacher_update
  ON classrooms FOR UPDATE
  USING (teacher_id = auth.uid());

-- Teachers can delete their own classrooms
CREATE POLICY classrooms_teacher_delete
  ON classrooms FOR DELETE
  USING (teacher_id = auth.uid());

-- Admins can manage all classrooms
CREATE POLICY classrooms_admin_update
  ON classrooms FOR UPDATE
  USING (public.is_admin());

CREATE POLICY classrooms_admin_delete
  ON classrooms FOR DELETE
  USING (public.is_admin());

-- =====================================================================
-- STUDENT CLASSROOM MEMBERSHIPS RLS
-- =====================================================================

-- Users can see their own memberships
CREATE POLICY student_classroom_memberships_self_select
  ON student_classroom_memberships FOR SELECT
  USING (student_id = auth.uid());

-- Teachers can see memberships in their classrooms
CREATE POLICY student_classroom_memberships_teacher_select
  ON student_classroom_memberships FOR SELECT
  USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

-- Admins can see all memberships
CREATE POLICY student_classroom_memberships_admin_select
  ON student_classroom_memberships FOR SELECT
  USING (public.is_admin());

-- Students can join classrooms (insert own membership)
CREATE POLICY student_classroom_memberships_student_insert
  ON student_classroom_memberships FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- Teachers can add students to their classrooms
CREATE POLICY student_classroom_memberships_teacher_insert
  ON student_classroom_memberships FOR INSERT
  WITH CHECK (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

-- Teachers can remove students from their classrooms
CREATE POLICY student_classroom_memberships_teacher_delete
  ON student_classroom_memberships FOR DELETE
  USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

-- Students can remove themselves
CREATE POLICY student_classroom_memberships_student_delete
  ON student_classroom_memberships FOR DELETE
  USING (student_id = auth.uid());

-- Admins can manage all memberships
CREATE POLICY student_classroom_memberships_admin_delete
  ON student_classroom_memberships FOR DELETE
  USING (public.is_admin());

-- =====================================================================
-- DECKS TABLE RLS
-- =====================================================================

-- Users can see their own decks
CREATE POLICY decks_user_select
  ON decks FOR SELECT
  USING (owner_id = auth.uid());

-- Users can see public decks
CREATE POLICY decks_public_select
  ON decks FOR SELECT
  USING (is_public = true);

-- Teachers can see decks shared with their classrooms
CREATE POLICY decks_classroom_select
  ON decks FOR SELECT
  USING (
    public.is_teacher() AND
    id IN (
      SELECT deck_id FROM classroom_deck_shares
      WHERE classroom_id IN (
        SELECT id FROM classrooms WHERE teacher_id = auth.uid()
      )
    )
  );

-- Admins can see all decks
CREATE POLICY decks_admin_select
  ON decks FOR SELECT
  USING (public.is_admin());

-- Users can create decks
CREATE POLICY decks_user_insert
  ON decks FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    owner_id = auth.uid()
  );

-- Users can update their own decks
CREATE POLICY decks_user_update
  ON decks FOR UPDATE
  USING (owner_id = auth.uid());

-- Users can delete their own decks
CREATE POLICY decks_user_delete
  ON decks FOR DELETE
  USING (owner_id = auth.uid());

-- Admins can manage all decks
CREATE POLICY decks_admin_update
  ON decks FOR UPDATE
  USING (public.is_admin());

CREATE POLICY decks_admin_delete
  ON decks FOR DELETE
  USING (public.is_admin());

-- =====================================================================
-- FLASHCARDS TABLE RLS
-- =====================================================================

-- Users can see flashcards in their own decks
CREATE POLICY flashcards_deck_owner_select
  ON flashcards FOR SELECT
  USING (
    deck_id IN (
      SELECT id FROM decks WHERE owner_id = auth.uid()
    )
  );

-- Users can see flashcards in public decks
CREATE POLICY flashcards_public_select
  ON flashcards FOR SELECT
  USING (
    deck_id IN (
      SELECT id FROM decks WHERE is_public = true
    )
  );

-- Teachers can see flashcards in shared classroom decks
CREATE POLICY flashcards_classroom_select
  ON flashcards FOR SELECT
  USING (
    public.is_teacher() AND
    deck_id IN (
      SELECT deck_id FROM classroom_deck_shares
      WHERE classroom_id IN (
        SELECT id FROM classrooms WHERE teacher_id = auth.uid()
      )
    )
  );

-- Admins can see all flashcards
CREATE POLICY flashcards_admin_select
  ON flashcards FOR SELECT
  USING (public.is_admin());

-- Users can add flashcards to their decks
CREATE POLICY flashcards_user_insert
  ON flashcards FOR INSERT
  WITH CHECK (
    deck_id IN (
      SELECT id FROM decks WHERE owner_id = auth.uid()
    )
  );

-- Users can update flashcards in their decks
CREATE POLICY flashcards_user_update
  ON flashcards FOR UPDATE
  USING (
    deck_id IN (
      SELECT id FROM decks WHERE owner_id = auth.uid()
    )
  );

-- Users can delete flashcards from their decks
CREATE POLICY flashcards_user_delete
  ON flashcards FOR DELETE
  USING (
    deck_id IN (
      SELECT id FROM decks WHERE owner_id = auth.uid()
    )
  );

-- Admins can manage all flashcards
CREATE POLICY flashcards_admin_update
  ON flashcards FOR UPDATE
  USING (public.is_admin());

CREATE POLICY flashcards_admin_delete
  ON flashcards FOR DELETE
  USING (public.is_admin());

-- =====================================================================
-- USER CARD PROGRESS TABLE RLS
-- =====================================================================

-- Users can see their own progress
CREATE POLICY user_card_progress_user_select
  ON user_card_progress FOR SELECT
  USING (user_id = auth.uid());

-- Teachers can see progress for students in their classrooms
CREATE POLICY user_card_progress_teacher_select
  ON user_card_progress FOR SELECT
  USING (
    public.is_teacher() AND
    user_id IN (
      SELECT student_id FROM student_classroom_memberships
      WHERE classroom_id IN (
        SELECT id FROM classrooms WHERE teacher_id = auth.uid()
      )
    )
  );

-- Admins can see all progress
CREATE POLICY user_card_progress_admin_select
  ON user_card_progress FOR SELECT
  USING (public.is_admin());

-- Users can insert/update their own progress
CREATE POLICY user_card_progress_user_write
  ON user_card_progress FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can manage all progress
CREATE POLICY user_card_progress_admin_write
  ON user_card_progress FOR ALL
  USING (public.is_admin());

-- =====================================================================
-- STUDY SESSIONS TABLE RLS
-- =====================================================================

-- Users can see their own study sessions
CREATE POLICY study_sessions_user_select
  ON study_sessions FOR SELECT
  USING (user_id = auth.uid());

-- Teachers can see sessions for students in their classrooms
CREATE POLICY study_sessions_teacher_select
  ON study_sessions FOR SELECT
  USING (
    public.is_teacher() AND
    user_id IN (
      SELECT student_id FROM student_classroom_memberships
      WHERE classroom_id IN (
        SELECT id FROM classrooms WHERE teacher_id = auth.uid()
      )
    )
  );

-- Admins can see all sessions
CREATE POLICY study_sessions_admin_select
  ON study_sessions FOR SELECT
  USING (public.is_admin());

-- Users can create study sessions
CREATE POLICY study_sessions_user_insert
  ON study_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own sessions
CREATE POLICY study_sessions_user_update
  ON study_sessions FOR UPDATE
  USING (user_id = auth.uid());

-- Admins can manage all sessions
CREATE POLICY study_sessions_admin_update
  ON study_sessions FOR UPDATE
  USING (public.is_admin());

CREATE POLICY study_sessions_admin_delete
  ON study_sessions FOR DELETE
  USING (public.is_admin());

-- =====================================================================
-- AUDIT LOGS TABLE RLS
-- =====================================================================

-- Admins can view audit logs
CREATE POLICY audit_logs_admin_select
  ON audit_logs FOR SELECT
  USING (public.is_admin());

-- Service role can insert (on auth events)
CREATE POLICY audit_logs_insert
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Only admins can delete (data retention policy)
CREATE POLICY audit_logs_admin_delete
  ON audit_logs FOR DELETE
  USING (public.is_admin());

-- =====================================================================
-- CLASSROOM DECK SHARES TABLE RLS
-- =====================================================================

-- Teachers can see shares for their classrooms
CREATE POLICY classroom_deck_shares_teacher_select
  ON classroom_deck_shares FOR SELECT
  USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

-- Students can see shares in their classrooms
CREATE POLICY classroom_deck_shares_student_select
  ON classroom_deck_shares FOR SELECT
  USING (
    classroom_id IN (
      SELECT classroom_id FROM student_classroom_memberships
      WHERE student_id = auth.uid()
    )
  );

-- Admins can see all shares
CREATE POLICY classroom_deck_shares_admin_select
  ON classroom_deck_shares FOR SELECT
  USING (public.is_admin());

-- Teachers can share decks with their classrooms
CREATE POLICY classroom_deck_shares_teacher_insert
  ON classroom_deck_shares FOR INSERT
  WITH CHECK (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    ) OR
    -- Or the deck owner can share
    shared_by_id = auth.uid()
  );

-- Teachers can remove shares from their classrooms
CREATE POLICY classroom_deck_shares_teacher_delete
  ON classroom_deck_shares FOR DELETE
  USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

-- Admins can manage all shares
CREATE POLICY classroom_deck_shares_admin_delete
  ON classroom_deck_shares FOR DELETE
  USING (public.is_admin());
