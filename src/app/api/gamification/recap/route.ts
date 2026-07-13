import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserStudyStats } from '@/lib/stats';
import { startOfWeek, weeklyPeriodKey } from '@/lib/gamification';
import type { WeeklyTotals, WeeklyRecap } from '@/lib/types/gamification';

/**
 * GET /api/gamification/recap
 *
 * A "last week in review" summary: XP, cards, sessions, and active days for
 * the most recently completed Mon–Sun week, compared to the week before it,
 * plus the current streak. Powers the dismissible Weekly Recap card. Read
 * only — no writes, no reconciliation.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Week boundaries. thisMonday = start of the current week; the recap
  // covers the previous full week [recapStart, recapEnd).
  const thisMonday = startOfWeek(new Date());
  const recapStart = new Date(thisMonday); recapStart.setDate(recapStart.getDate() - 7);
  const recapEnd = thisMonday;
  const priorStart = new Date(thisMonday); priorStart.setDate(priorStart.getDate() - 14);
  const priorEnd = recapStart;

  const [stats, { data: xpEvents }, { data: sessions }] = await Promise.all([
    getUserStudyStats(supabase, user.id),
    supabase
      .from('xp_events')
      .select('amount, created_at')
      .eq('user_id', user.id)
      .gte('created_at', priorStart.toISOString())
      .lt('created_at', recapEnd.toISOString()),
    supabase
      .from('study_sessions')
      .select('cards_reviewed, started_at')
      .eq('user_id', user.id)
      .gte('started_at', priorStart.toISOString())
      .lt('started_at', recapEnd.toISOString()),
  ]);

  const inRange = (iso: string, start: Date, end: Date) => {
    const t = new Date(iso).getTime();
    return t >= start.getTime() && t < end.getTime();
  };

  const totalsFor = (start: Date, end: Date): WeeklyTotals => {
    const xp = (xpEvents ?? [])
      .filter((e) => inRange(e.created_at, start, end))
      .reduce((s, e) => s + e.amount, 0);
    const weekSessions = (sessions ?? []).filter((s) => inRange(s.started_at, start, end));
    const cards = weekSessions.reduce((s, x) => s + (x.cards_reviewed ?? 0), 0);
    const activeDays = new Set(
      weekSessions.map((s) => new Date(s.started_at).toISOString().slice(0, 10)),
    ).size;
    return { xp, cards, sessions: weekSessions.length, activeDays };
  };

  const recap = totalsFor(recapStart, recapEnd);
  const prior = totalsFor(priorStart, priorEnd);

  const cardsDeltaPct = prior.cards > 0
    ? Math.round(((recap.cards - prior.cards) / prior.cards) * 100)
    : null;

  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const lastDay = new Date(recapEnd); lastDay.setDate(lastDay.getDate() - 1);

  const payload: WeeklyRecap = {
    weekKey: weeklyPeriodKey(recapStart),
    weekLabel: `${fmt(recapStart)} – ${fmt(lastDay)}`,
    recap,
    prior,
    cardsDeltaPct,
    streak: stats.streak,
    hadActivity: recap.sessions > 0,
  };

  return NextResponse.json({ data: payload });
}
