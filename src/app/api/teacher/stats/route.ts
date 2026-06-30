import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['teacher', 'administrator'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get teacher's classroom IDs first (for the nested subquery workaround)
  const { data: classroomIds } = await supabase
    .from('classrooms')
    .select('id')
    .eq('teacher_id', user.id)
    .eq('is_archived', false);

  const ids = (classroomIds ?? []).map((c) => c.id);

  // Get student IDs from those classrooms
  const { data: memberships } = ids.length > 0
    ? await supabase
        .from('student_classroom_memberships')
        .select('student_id')
        .in('classroom_id', ids)
    : { data: [] };

  const studentIds = [...new Set((memberships ?? []).map((m) => m.student_id))];

  // Run remaining queries in parallel
  const [classroomsRes, decksRes, sessionsRes] = await Promise.all([
    // Classrooms with member counts
    supabase
      .from('classrooms')
      .select('id, name, classroom_code, created_at, student_classroom_memberships(count)')
      .eq('teacher_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false }),

    // Teacher's decks
    supabase
      .from('decks')
      .select('id, name, card_count, is_public, updated_at')
      .eq('owner_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(6),

    // Recent study sessions from those students
    studentIds.length > 0
      ? supabase
          .from('study_sessions')
          .select('id, started_at, cards_reviewed, correct_count, decks(name), profiles!study_sessions_user_id_fkey(full_name, avatar_url)')
          .in('user_id', studentIds)
          .order('started_at', { ascending: false })
          .limit(20)
      : Promise.resolve({ data: [] }),
  ]);

  const classrooms = (classroomsRes.data ?? []) as unknown as Array<{
    id: string; name: string; classroom_code: string; created_at: string;
    student_classroom_memberships: { count: number }[];
  }>;

  const totalStudents = classrooms.reduce((sum, c) => {
    const countRaw = c.student_classroom_memberships;
    const count = Array.isArray(countRaw) ? (countRaw[0]?.count ?? 0) : 0;
    return sum + Number(count);
  }, 0);

  const sessions = (sessionsRes.data ?? []) as unknown as Array<{
    id: string; started_at: string; cards_reviewed: number; correct_count: number;
    decks: { name: string } | null;
    profiles: { full_name: string | null; avatar_url: string | null } | null;
  }>;

  const totalReviewed = sessions.reduce((s, r) => s + (r.cards_reviewed ?? 0), 0);
  const totalCorrect = sessions.reduce((s, r) => s + (r.correct_count ?? 0), 0);

  return NextResponse.json({
    data: {
      classrooms,
      totalStudents,
      decks: decksRes.data ?? [],
      recentSessions: sessions,
      totalCardsReviewed: totalReviewed,
      overallAccuracy: totalReviewed > 0 ? Math.round((totalCorrect / totalReviewed) * 100) : null,
    },
  });
}
