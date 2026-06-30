import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ classroomId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { classroomId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify teacher owns this classroom
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name')
    .eq('id', classroomId)
    .eq('teacher_id', user.id)
    .single();
  if (!classroom) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Get all students in classroom
  const { data: members } = await supabase
    .from('student_classroom_memberships')
    .select('student_id, joined_at')
    .eq('classroom_id', classroomId);

  if (!members || members.length === 0) {
    return NextResponse.json({ data: { classroom, students: [] } });
  }

  const studentIds = members.map((m) => m.student_id);

  // Fetch profiles separately to avoid RLS join issues
  const { data: profileRows } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', studentIds);

  const profileMap = new Map((profileRows ?? []).map((p) => [p.id, p]));

  // Get study sessions per student (last 30 days)
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: sessions } = await supabase
    .from('study_sessions')
    .select('user_id, cards_reviewed, correct_count, started_at')
    .in('user_id', studentIds)
    .gte('started_at', since);

  // Aggregate per student
  const statsMap = new Map<string, { sessions: number; cards: number; correct: number; lastStudied: string | null }>();
  for (const s of sessions ?? []) {
    const existing = statsMap.get(s.user_id) ?? { sessions: 0, cards: 0, correct: 0, lastStudied: null };
    statsMap.set(s.user_id, {
      sessions: existing.sessions + 1,
      cards: existing.cards + (s.cards_reviewed ?? 0),
      correct: existing.correct + (s.correct_count ?? 0),
      lastStudied: existing.lastStudied
        ? (s.started_at > existing.lastStudied ? s.started_at : existing.lastStudied)
        : s.started_at,
    });
  }

  const students = members.map((m) => {
    const stats = statsMap.get(m.student_id) ?? { sessions: 0, cards: 0, correct: 0, lastStudied: null };
    const profile = profileMap.get(m.student_id);
    return {
      student_id: m.student_id,
      joined_at: m.joined_at,
      full_name: profile?.full_name ?? 'Unknown',
      avatar_url: profile?.avatar_url ?? null,
      sessions_30d: stats.sessions,
      cards_reviewed_30d: stats.cards,
      accuracy_30d: stats.cards > 0 ? Math.round((stats.correct / stats.cards) * 100) : null,
      last_studied: stats.lastStudied,
    };
  });

  return NextResponse.json({ data: { classroom, students } });
}
