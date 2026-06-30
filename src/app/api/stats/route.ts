import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/stats
 * Returns the current user's study stats:
 * - streak (consecutive days with at least one study session)
 * - total sessions
 * - total cards reviewed
 * - sessions in last 30 days (for sparkline)
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch all session dates (last 90 days is plenty for streak)
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const { data: sessions, error } = await supabase
    .from('study_sessions')
    .select('started_at, cards_reviewed')
    .eq('user_id', user.id)
    .gte('started_at', since.toISOString())
    .order('started_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ── Streak calculation ──────────────────────────────────────────────────────
  // Build a set of date strings (YYYY-MM-DD) where a session occurred
  const sessionDates = new Set(
    (sessions ?? []).map((s) =>
      new Date(s.started_at).toISOString().slice(0, 10)
    )
  );

  let streak = 0;
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Start counting from today (or yesterday if no session today)
  const startDate = sessionDates.has(todayStr)
    ? new Date(today)
    : (() => { const d = new Date(today); d.setDate(d.getDate() - 1); return d; })();

  const cursor = new Date(startDate);
  while (true) {
    const dateStr = cursor.toISOString().slice(0, 10);
    if (!sessionDates.has(dateStr)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  // ── 30-day activity grid (for heatmap / sparkline) ──────────────────────────
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  const activityMap: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    activityMap[d.toISOString().slice(0, 10)] = 0;
  }
  (sessions ?? []).forEach((s) => {
    const dateStr = new Date(s.started_at).toISOString().slice(0, 10);
    if (dateStr in activityMap) {
      activityMap[dateStr] = (activityMap[dateStr] ?? 0) + (s.cards_reviewed ?? 0);
    }
  });

  const activity30d = Object.entries(activityMap).map(([date, cards]) => ({ date, cards }));

  // ── Totals ──────────────────────────────────────────────────────────────────
  const totalSessions = sessions?.length ?? 0;
  const totalCards = (sessions ?? []).reduce((sum, s) => sum + (s.cards_reviewed ?? 0), 0);

  return NextResponse.json({
    data: {
      streak,
      totalSessions,
      totalCards,
      activity30d,
    },
  });
}
