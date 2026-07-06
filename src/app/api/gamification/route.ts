import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserStudyStats } from '@/lib/stats';
import {
  getLevelProgress, dailyPeriodKey, weeklyPeriodKey, startOfWeek,
  XP_BASE_REVIEW,
} from '@/lib/gamification';
import type { Database } from '@/lib/types/database';

type Achievement = Database['public']['Tables']['achievements']['Row'];
type QuestTemplate = Database['public']['Tables']['quest_templates']['Row'];

/**
 * GET /api/gamification
 *
 * Returns XP/level, achievement progress, quest progress, and a review
 * forecast — and reconciles as it reads: any achievement whose criteria is
 * now met gets unlocked (XP awarded), and any quest whose goal is now met
 * for the current period gets claimed (XP awarded), all in the same call.
 * Calling this repeatedly is safe — unlocks/claims are idempotent (unique
 * keys on user_achievements / user_quest_claims prevent double-award).
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [
    stats,
    { data: xpEvents },
    { data: achievements },
    { data: unlockedRows },
    { data: questTemplates },
    { data: claimRows },
    { data: dueRows },
  ] = await Promise.all([
    getUserStudyStats(supabase, user.id),
    supabase.from('xp_events').select('amount').eq('user_id', user.id),
    supabase.from('achievements').select('*').order('sort_order'),
    supabase.from('user_achievements').select('achievement_id, unlocked_at').eq('user_id', user.id),
    supabase.from('quest_templates').select('*').order('sort_order'),
    supabase.from('user_quest_claims').select('quest_template_id, period_key').eq('user_id', user.id),
    supabase.from('user_card_progress').select('next_review_at').eq('user_id', user.id),
  ]);

  let totalXp = (xpEvents ?? []).reduce((sum, e) => sum + e.amount, 0);
  const unlockedIds = new Set((unlockedRows ?? []).map((r) => r.achievement_id));
  const unlockedAtMap = new Map((unlockedRows ?? []).map((r) => [r.achievement_id, r.unlocked_at]));

  // ── Reconcile achievements ────────────────────────────────────────────
  const level = getLevelProgress(totalXp).level;
  const criteriaValue = (a: Achievement): number => {
    switch (a.criteria_type) {
      case 'streak': return stats.streak;
      case 'total_cards': return stats.totalCards;
      case 'total_sessions': return stats.totalSessions;
      case 'level': return level;
    }
  };

  const newlyUnlocked: Achievement[] = [];
  for (const a of achievements ?? []) {
    if (unlockedIds.has(a.id)) continue;
    if (criteriaValue(a) < a.criteria_value) continue;

    const { error: unlockError } = await supabase
      .from('user_achievements')
      .insert({ user_id: user.id, achievement_id: a.id });
    if (unlockError) continue; // already unlocked concurrently — skip silently

    await supabase.from('xp_events').insert({
      user_id: user.id, amount: a.xp_reward, reason: 'achievement_unlock',
      metadata: { achievement_id: a.id },
    });
    totalXp += a.xp_reward;
    newlyUnlocked.push(a);
  }

  // ── Quest progress + auto-claim ───────────────────────────────────────
  const now = new Date();
  const weekStart = startOfWeek(now);
  const todayKey = dailyPeriodKey(now);
  const weekKey = weeklyPeriodKey(now);

  const todayCards = stats.activity30d.find((d) => d.date === todayKey)?.cards ?? 0;
  const weekCards = stats.activity30d
    .filter((d) => new Date(d.date) >= weekStart)
    .reduce((s, d) => s + d.cards, 0);
  const weekStudyDays = stats.activity30d
    .filter((d) => new Date(d.date) >= weekStart && d.cards > 0)
    .length;
  // A session "today" is implied by today's card count (matches streak logic).
  const todaySessions = todayCards > 0 ? 1 : 0;

  const claimedSet = new Set((claimRows ?? []).map((c) => `${c.quest_template_id}:${c.period_key}`));

  const progressFor = (q: QuestTemplate): number => {
    switch (q.goal_type) {
      case 'cards_reviewed': return q.period === 'daily' ? todayCards : weekCards;
      case 'sessions_completed': return todaySessions;
      case 'study_days': return weekStudyDays;
    }
  };

  const questsOut: Array<{
    id: string; title: string; description: string; icon: string;
    period: 'daily' | 'weekly'; progress: number; goal: number; xpReward: number;
    completed: boolean; justClaimed: boolean;
  }> = [];

  for (const q of questTemplates ?? []) {
    const periodKey = q.period === 'daily' ? todayKey : weekKey;
    const progress = Math.min(progressFor(q), q.goal_value);
    const completed = progress >= q.goal_value;
    const claimKey = `${q.id}:${periodKey}`;
    let justClaimed = false;

    if (completed && !claimedSet.has(claimKey)) {
      const { error: claimError } = await supabase
        .from('user_quest_claims')
        .insert({ user_id: user.id, quest_template_id: q.id, period_key: periodKey });
      if (!claimError) {
        await supabase.from('xp_events').insert({
          user_id: user.id,
          amount: q.xp_reward,
          reason: q.period === 'daily' ? 'quest_daily' : 'quest_weekly',
          metadata: { quest_id: q.id, period_key: periodKey },
        });
        totalXp += q.xp_reward;
        justClaimed = true;
      }
    }

    questsOut.push({
      id: q.id, title: q.title, description: q.description, icon: q.icon,
      period: q.period, progress, goal: q.goal_value, xpReward: q.xp_reward,
      completed, justClaimed,
    });
  }

  // ── Review forecast ───────────────────────────────────────────────────
  const nowMs = now.getTime();
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
  const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() + 7);

  let overdue = 0, dueToday = 0, dueThisWeek = 0;
  for (const row of dueRows ?? []) {
    const t = new Date(row.next_review_at).getTime();
    if (t < nowMs) overdue++;
    else if (t <= todayEnd.getTime()) dueToday++;
    else if (t <= weekEnd.getTime()) dueThisWeek++;
  }

  return NextResponse.json({
    data: {
      xp: { ...getLevelProgress(totalXp), baseReviewXp: XP_BASE_REVIEW },
      newAchievements: newlyUnlocked.map((a) => ({
        id: a.id, title: a.title, description: a.description,
        icon: a.icon, tier: a.tier, xpReward: a.xp_reward,
      })),
      achievements: {
        unlocked: (achievements ?? [])
          .filter((a) => unlockedIds.has(a.id) || newlyUnlocked.some((n) => n.id === a.id))
          .map((a) => ({
            id: a.id, title: a.title, description: a.description, icon: a.icon, tier: a.tier,
            unlockedAt: unlockedAtMap.get(a.id) ?? new Date().toISOString(),
          })),
        locked: (achievements ?? [])
          .filter((a) => !unlockedIds.has(a.id) && !newlyUnlocked.some((n) => n.id === a.id))
          .map((a) => ({
            id: a.id, title: a.title, description: a.description, icon: a.icon, tier: a.tier,
            progress: criteriaValue(a), goal: a.criteria_value,
          })),
      },
      quests: {
        daily: questsOut.filter((q) => q.period === 'daily'),
        weekly: questsOut.filter((q) => q.period === 'weekly'),
      },
      forecast: { overdue, dueToday, dueThisWeek },
    },
  });
}
