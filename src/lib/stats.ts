import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

export interface UserStudyStats {
  streak: number;
  totalSessions: number;
  totalCards: number;
  activity30d: Array<{ date: string; cards: number }>;
}

/**
 * Computes streak, session/card totals, and a 30-day activity grid for a
 * user from their study_sessions. Shared by /api/stats (dashboard sparkline)
 * and /api/gamification (quest progress + achievement checks) so the two
 * never drift out of sync.
 */
export async function getUserStudyStats(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<UserStudyStats> {
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const { data: sessions } = await supabase
    .from('study_sessions')
    .select('started_at, cards_reviewed')
    .eq('user_id', userId)
    .gte('started_at', since.toISOString())
    .order('started_at', { ascending: false });

  const sessionDates = new Set(
    (sessions ?? []).map((s) => new Date(s.started_at).toISOString().slice(0, 10)),
  );

  let streak = 0;
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
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
  const totalSessions = sessions?.length ?? 0;
  const totalCards = (sessions ?? []).reduce((sum, s) => sum + (s.cards_reviewed ?? 0), 0);

  return { streak, totalSessions, totalCards, activity30d };
}
