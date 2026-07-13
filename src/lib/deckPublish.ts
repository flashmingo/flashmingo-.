import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

/**
 * Deck publishing model
 * ─────────────────────
 * Making a deck public requires review. A deck's owner "requests" publication
 * (publish_status = 'pending'); it only becomes visible in Browse once a
 * reviewer approves it (publish_status = 'approved', is_public = true).
 *
 * Who can review a given deck:
 *   - administrators (within the same district, when both have one), and
 *   - teachers who share a classroom with the deck's owner.
 *
 * Teachers and admins publishing their OWN decks skip the queue — they're
 * already an authorized approver, so their request is auto-approved.
 */

/** Can `reviewerId` approve/reject publish requests for decks owned by `ownerId`? */
export async function canReviewDeckOwner(
  supabase: SupabaseClient<Database>,
  reviewerId: string,
  ownerId: string,
): Promise<boolean> {
  if (reviewerId === ownerId) return false; // reviewing your own is a separate path

  const { data: reviewer } = await supabase
    .from('profiles')
    .select('role, district_id')
    .eq('id', reviewerId)
    .single();
  if (!reviewer) return false;

  if (reviewer.role === 'administrator') {
    // Scope to district when both sides have one; otherwise (single-district
    // deployments with null district_id) allow.
    if (!reviewer.district_id) return true;
    const { data: owner } = await supabase
      .from('profiles').select('district_id').eq('id', ownerId).single();
    return owner?.district_id === reviewer.district_id;
  }

  if (reviewer.role === 'teacher') {
    // Owner must be a student in one of the reviewer's classrooms.
    const { data } = await supabase
      .from('student_classroom_memberships')
      .select('classroom_id, classrooms!inner(teacher_id)')
      .eq('student_id', ownerId)
      .eq('classrooms.teacher_id', reviewerId)
      .limit(1);
    return (data?.length ?? 0) > 0;
  }

  return false;
}

/** An account that is its own publish approver (teacher/admin). */
export async function isSelfApprover(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('profiles').select('role').eq('id', userId).single();
  return data?.role === 'teacher' || data?.role === 'administrator';
}
