import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'administrator')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [usersRes, decksRes, sessionsRes, auditRes] = await Promise.all([
    supabase.from('profiles').select('id, role, account_status, created_at'),
    supabase.from('decks').select('id', { count: 'exact', head: true }),
    supabase.from('study_sessions')
      .select('id, cards_reviewed, correct_count, started_at')
      .gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('audit_logs')
      .select('id, action_type, resource_type, timestamp, user_id')
      .order('timestamp', { ascending: false })
      .limit(20),
  ]);

  const users = usersRes.data ?? [];
  const sessions = sessionsRes.data ?? [];
  const totalCards = sessions.reduce((s, r) => s + (r.cards_reviewed ?? 0), 0);
  const totalCorrect = sessions.reduce((s, r) => s + (r.correct_count ?? 0), 0);

  return NextResponse.json({
    data: {
      users: {
        total: users.length,
        students: users.filter((u) => u.role === 'student').length,
        teachers: users.filter((u) => u.role === 'teacher').length,
        admins: users.filter((u) => u.role === 'administrator').length,
        pending: users.filter((u) => u.account_status === 'pending').length,
        suspended: users.filter((u) => u.account_status === 'suspended').length,
      },
      decks: { total: decksRes.count ?? 0 },
      activity: {
        sessions7d: sessions.length,
        cardsReviewed7d: totalCards,
        accuracy7d: totalCards > 0 ? Math.round((totalCorrect / totalCards) * 100) : null,
      },
      recentAuditLogs: auditRes.data ?? [],
    },
  });
}
