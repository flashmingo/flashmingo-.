import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/decks/publish-requests
 *
 * Pending deck-publish requests the current user is allowed to review:
 *   - administrators: all pending requests in their district
 *   - teachers: pending requests from students in their classrooms
 *   - everyone else: none
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: me } = await supabase
    .from('profiles').select('role, district_id').eq('id', user.id).single();

  if (me?.role !== 'administrator' && me?.role !== 'teacher') {
    return NextResponse.json({ data: [] });
  }

  // Determine which owner ids this reviewer covers.
  let ownerIds: string[] | null = null; // null = all (district admin)
  if (me.role === 'teacher') {
    const { data: memberships } = await supabase
      .from('student_classroom_memberships')
      .select('student_id, classrooms!inner(teacher_id)')
      .eq('classrooms.teacher_id', user.id);
    ownerIds = [...new Set((memberships ?? []).map((m) => m.student_id))];
    if (ownerIds.length === 0) return NextResponse.json({ data: [] });
  } else if (me.district_id) {
    const { data: peers } = await supabase
      .from('profiles').select('id').eq('district_id', me.district_id);
    ownerIds = (peers ?? []).map((p) => p.id);
  }

  let query = supabase
    .from('decks')
    .select('id, name, description, card_count, owner_id, publish_requested_at, profiles!decks_owner_id_fkey(full_name)')
    .eq('publish_status', 'pending')
    .order('publish_requested_at', { ascending: true });

  if (ownerIds !== null) query = query.in('owner_id', ownerIds);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const requests = (data ?? []).map((d) => {
    const owner = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
    return {
      id: d.id,
      name: d.name,
      description: d.description,
      card_count: d.card_count,
      owner_name: (owner as { full_name: string | null } | null)?.full_name ?? 'Unknown',
      requested_at: d.publish_requested_at,
    };
  });

  return NextResponse.json({ data: requests });
}
