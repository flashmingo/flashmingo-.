-- ============================================================
-- FlashMingo — Migration 003: Row Level Security
-- ============================================================
-- Security model:
--   - Students: own data only (profile, decks, progress, sessions)
--   - Teachers: own data + students in their classrooms
--   - Administrators: all data in their district
--   - audit_logs: append-only for all authenticated users;
--                 read-only for admins
-- ============================================================

BEGIN;

-- ============================================================
-- ENABLE RLS ON ALL USER-FACING TABLES
-- ============================================================

ALTER TABLE public.districts                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags                         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks                        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deck_tags                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_card_progress           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_classroom_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_deck_shares        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs                   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SECURITY HELPER FUNCTIONS
-- SECURITY DEFINER so they run with elevated privileges and
-- cannot be bypassed by manipulating search_path.
-- ============================================================

CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.auth_district_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT district_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.auth_role() = 'administrator'
$$;

CREATE OR REPLACE FUNCTION public.is_teacher_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.auth_role() IN ('teacher', 'administrator')
$$;

-- Returns true if the calling user is a teacher of the classroom
CREATE OR REPLACE FUNCTION public.is_classroom_teacher(p_classroom_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classrooms
    WHERE id = p_classroom_id AND teacher_id = auth.uid()
  )
$$;

-- Returns true if the calling user is enrolled in the classroom
CREATE OR REPLACE FUNCTION public.is_classroom_member(p_classroom_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.student_classroom_memberships
    WHERE classroom_id = p_classroom_id AND student_id = auth.uid()
  )
$$;

-- ============================================================
-- DISTRICTS
-- ============================================================

-- Any authenticated user can read districts (for on-boarding UI)
CREATE POLICY districts_read
  ON public.districts FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can manage districts
CREATE POLICY districts_admin_insert
  ON public.districts FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY districts_admin_update
  ON public.districts FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY districts_admin_delete
  ON public.districts FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- PROFILES
-- ============================================================

-- Users always see their own profile
CREATE POLICY profiles_self_select
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Teachers see profiles of students in their classrooms
CREATE POLICY profiles_teacher_select
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    public.is_teacher_or_admin()
    AND id IN (
      SELECT scm.student_id
      FROM public.student_classroom_memberships scm
      JOIN public.classrooms c ON c.id = scm.classroom_id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- Admins see all profiles in their district
CREATE POLICY profiles_admin_select
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    AND (district_id = public.auth_district_id() OR public.auth_district_id() IS NULL)
  );

-- Users update their own profile (limited fields — role/status gated by admin)
CREATE POLICY profiles_self_update
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Prevent self-escalation: role and account_status can only be changed by admins
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND account_status = (SELECT account_status FROM public.profiles WHERE id = auth.uid())
  );

-- Admins can update role and status of profiles in their district
CREATE POLICY profiles_admin_update
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    AND (district_id = public.auth_district_id() OR public.auth_district_id() IS NULL)
  );

-- Profile insert is handled by the handle_new_user() trigger (SECURITY DEFINER).
-- We allow authenticated inserts too so the callback route can upsert.
CREATE POLICY profiles_insert
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ============================================================
-- FOLDERS
-- ============================================================

CREATE POLICY folders_owner_select
  ON public.folders FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY folders_owner_insert
  ON public.folders FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY folders_owner_update
  ON public.folders FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY folders_owner_delete
  ON public.folders FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- ============================================================
-- TAGS
-- ============================================================

-- Own tags + district tags
CREATE POLICY tags_select
  ON public.tags FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR (district_id IS NOT NULL AND district_id = public.auth_district_id())
  );

CREATE POLICY tags_owner_insert
  ON public.tags FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY tags_owner_update
  ON public.tags FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY tags_owner_delete
  ON public.tags FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- ============================================================
-- DECKS
-- ============================================================

-- Own decks always visible
CREATE POLICY decks_owner_select
  ON public.decks FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- Public decks visible to all authenticated users
CREATE POLICY decks_public_select
  ON public.decks FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Decks shared with a classroom the user belongs to
CREATE POLICY decks_classroom_member_select
  ON public.decks FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT cds.deck_id
      FROM public.classroom_deck_shares cds
      JOIN public.student_classroom_memberships scm ON scm.classroom_id = cds.classroom_id
      WHERE scm.student_id = auth.uid()
    )
  );

-- Teachers see decks shared with their classrooms
CREATE POLICY decks_classroom_teacher_select
  ON public.decks FOR SELECT
  TO authenticated
  USING (
    public.is_teacher_or_admin()
    AND id IN (
      SELECT deck_id FROM public.classroom_deck_shares cds
      JOIN public.classrooms c ON c.id = cds.classroom_id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- Admins see all decks in their district (via owner's district)
CREATE POLICY decks_admin_select
  ON public.decks FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    AND owner_id IN (
      SELECT id FROM public.profiles
      WHERE district_id = public.auth_district_id()
        OR public.auth_district_id() IS NULL
    )
  );

CREATE POLICY decks_owner_insert
  ON public.decks FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY decks_owner_update
  ON public.decks FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY decks_owner_delete
  ON public.decks FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Admins can manage all decks in their district
CREATE POLICY decks_admin_update
  ON public.decks FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY decks_admin_delete
  ON public.decks FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- DECK_TAGS
-- ============================================================

CREATE POLICY deck_tags_select
  ON public.deck_tags FOR SELECT
  TO authenticated
  USING (
    deck_id IN (SELECT id FROM public.decks WHERE owner_id = auth.uid())
  );

CREATE POLICY deck_tags_owner_insert
  ON public.deck_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    deck_id IN (SELECT id FROM public.decks WHERE owner_id = auth.uid())
  );

CREATE POLICY deck_tags_owner_delete
  ON public.deck_tags FOR DELETE
  TO authenticated
  USING (
    deck_id IN (SELECT id FROM public.decks WHERE owner_id = auth.uid())
  );

-- ============================================================
-- FLASHCARDS
-- ============================================================

-- Owner of the deck sees all its cards
CREATE POLICY flashcards_deck_owner_select
  ON public.flashcards FOR SELECT
  TO authenticated
  USING (
    deck_id IN (SELECT id FROM public.decks WHERE owner_id = auth.uid())
  );

-- Cards in public decks are visible to all
CREATE POLICY flashcards_public_select
  ON public.flashcards FOR SELECT
  TO authenticated
  USING (
    deck_id IN (SELECT id FROM public.decks WHERE is_public = true)
  );

-- Cards in shared classroom decks visible to classroom members
CREATE POLICY flashcards_classroom_select
  ON public.flashcards FOR SELECT
  TO authenticated
  USING (
    deck_id IN (
      SELECT cds.deck_id
      FROM public.classroom_deck_shares cds
      JOIN public.student_classroom_memberships scm ON scm.classroom_id = cds.classroom_id
      WHERE scm.student_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.classrooms c
          WHERE c.id = cds.classroom_id AND c.teacher_id = auth.uid()
        )
    )
  );

-- Admins see all flashcards
CREATE POLICY flashcards_admin_select
  ON public.flashcards FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY flashcards_deck_owner_insert
  ON public.flashcards FOR INSERT
  TO authenticated
  WITH CHECK (
    deck_id IN (SELECT id FROM public.decks WHERE owner_id = auth.uid())
  );

CREATE POLICY flashcards_deck_owner_update
  ON public.flashcards FOR UPDATE
  TO authenticated
  USING (
    deck_id IN (SELECT id FROM public.decks WHERE owner_id = auth.uid())
  );

CREATE POLICY flashcards_deck_owner_delete
  ON public.flashcards FOR DELETE
  TO authenticated
  USING (
    deck_id IN (SELECT id FROM public.decks WHERE owner_id = auth.uid())
  );

-- ============================================================
-- USER_CARD_PROGRESS
-- ============================================================

CREATE POLICY ucp_self_select
  ON public.user_card_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Teachers see progress of students in their classrooms
CREATE POLICY ucp_teacher_select
  ON public.user_card_progress FOR SELECT
  TO authenticated
  USING (
    public.is_teacher_or_admin()
    AND user_id IN (
      SELECT scm.student_id
      FROM public.student_classroom_memberships scm
      JOIN public.classrooms c ON c.id = scm.classroom_id
      WHERE c.teacher_id = auth.uid()
    )
  );

CREATE POLICY ucp_admin_select
  ON public.user_card_progress FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Users own their progress records
CREATE POLICY ucp_self_insert
  ON public.user_card_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY ucp_self_update
  ON public.user_card_progress FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- CLASSROOMS
-- ============================================================

CREATE POLICY classrooms_teacher_select
  ON public.classrooms FOR SELECT
  TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY classrooms_member_select
  ON public.classrooms FOR SELECT
  TO authenticated
  USING (public.is_classroom_member(id));

CREATE POLICY classrooms_admin_select
  ON public.classrooms FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    AND (district_id = public.auth_district_id() OR public.auth_district_id() IS NULL)
  );

CREATE POLICY classrooms_teacher_insert
  ON public.classrooms FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_teacher_or_admin()
    AND teacher_id = auth.uid()
  );

CREATE POLICY classrooms_teacher_update
  ON public.classrooms FOR UPDATE
  TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY classrooms_teacher_delete
  ON public.classrooms FOR DELETE
  TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY classrooms_admin_update
  ON public.classrooms FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY classrooms_admin_delete
  ON public.classrooms FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- STUDENT_CLASSROOM_MEMBERSHIPS
-- ============================================================

CREATE POLICY scm_self_select
  ON public.student_classroom_memberships FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY scm_teacher_select
  ON public.student_classroom_memberships FOR SELECT
  TO authenticated
  USING (public.is_classroom_teacher(classroom_id));

CREATE POLICY scm_admin_select
  ON public.student_classroom_memberships FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Students join by supplying the classroom code (handled in app layer)
CREATE POLICY scm_student_join
  ON public.student_classroom_memberships FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Teachers can add students to their classrooms
CREATE POLICY scm_teacher_insert
  ON public.student_classroom_memberships FOR INSERT
  TO authenticated
  WITH CHECK (public.is_classroom_teacher(classroom_id));

-- Students can leave; teachers can remove from their classroom
CREATE POLICY scm_student_leave
  ON public.student_classroom_memberships FOR DELETE
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY scm_teacher_remove
  ON public.student_classroom_memberships FOR DELETE
  TO authenticated
  USING (public.is_classroom_teacher(classroom_id));

-- ============================================================
-- CLASSROOM_DECK_SHARES
-- ============================================================

CREATE POLICY cds_teacher_select
  ON public.classroom_deck_shares FOR SELECT
  TO authenticated
  USING (public.is_classroom_teacher(classroom_id));

CREATE POLICY cds_member_select
  ON public.classroom_deck_shares FOR SELECT
  TO authenticated
  USING (public.is_classroom_member(classroom_id));

CREATE POLICY cds_admin_select
  ON public.classroom_deck_shares FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY cds_teacher_insert
  ON public.classroom_deck_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_classroom_teacher(classroom_id)
    AND shared_by_id = auth.uid()
  );

CREATE POLICY cds_teacher_delete
  ON public.classroom_deck_shares FOR DELETE
  TO authenticated
  USING (public.is_classroom_teacher(classroom_id));

-- ============================================================
-- STUDY_SESSIONS
-- ============================================================

CREATE POLICY ss_self_select
  ON public.study_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY ss_teacher_select
  ON public.study_sessions FOR SELECT
  TO authenticated
  USING (
    public.is_teacher_or_admin()
    AND user_id IN (
      SELECT scm.student_id
      FROM public.student_classroom_memberships scm
      JOIN public.classrooms c ON c.id = scm.classroom_id
      WHERE c.teacher_id = auth.uid()
    )
  );

CREATE POLICY ss_admin_select
  ON public.study_sessions FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY ss_self_insert
  ON public.study_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can only update their own sessions (to set ended_at, etc.)
CREATE POLICY ss_self_update
  ON public.study_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- AUDIT_LOGS
-- ============================================================

-- Any authenticated user can INSERT (for client-side event logging)
CREATE POLICY audit_logs_insert
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Users can only log events for themselves
    user_id IS NULL OR user_id = auth.uid()
  );

-- Only admins can read audit logs
CREATE POLICY audit_logs_admin_select
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- NO UPDATE or DELETE policies — audit_logs is immutable

COMMIT;
