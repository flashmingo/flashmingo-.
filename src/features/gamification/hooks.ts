'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { GamificationData, WeeklyRecap } from '@/lib/types/gamification';
import type { Celebration } from '@/components/gamification/CelebrationToast';

export function useGamification(enabled = true) {
  return useQuery<GamificationData>({
    queryKey: ['gamification'],
    queryFn: async () => {
      const res = await fetch('/api/gamification');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load progress');
      return json.data;
    },
    enabled,
    staleTime: 30_000,
  });
}

const RECAP_DISMISS_KEY = 'fm:recap-dismissed-week';

/**
 * Fetches the weekly recap and tracks per-week dismissal in localStorage,
 * so a recap the user closed doesn't reappear until the next week rolls in.
 * Returns null while loading, when there's no activity to recap, or when
 * this week's recap was already dismissed.
 */
export function useWeeklyRecap(enabled = true): {
  recap: WeeklyRecap | null;
  dismiss: () => void;
} {
  const { data } = useQuery<WeeklyRecap>({
    queryKey: ['weekly-recap'],
    queryFn: async () => {
      const res = await fetch('/api/gamification/recap');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load recap');
      return json.data;
    },
    enabled,
    staleTime: 60 * 60_000, // an hour — the recap only changes weekly
  });

  const [dismissedWeek, setDismissedWeek] = useState<string | null>(null);
  useEffect(() => {
    try { setDismissedWeek(window.localStorage.getItem(RECAP_DISMISS_KEY)); }
    catch { /* private browsing */ }
  }, []);

  const dismiss = useCallback(() => {
    if (!data) return;
    setDismissedWeek(data.weekKey);
    try { window.localStorage.setItem(RECAP_DISMISS_KEY, data.weekKey); } catch { /* ignore */ }
  }, [data]);

  const recap = useMemo(() => {
    if (!data || !data.hadActivity) return null;
    if (dismissedWeek === data.weekKey) return null;
    return data;
  }, [data, dismissedWeek]);

  return { recap, dismiss };
}

const LEVEL_KEY = 'fm:last-seen-level';

/**
 * Derives the celebration queue from a gamification payload:
 * newly unlocked achievements, just-claimed quests, and level-ups
 * (detected against the last level this browser saw).
 */
export function useCelebrations(data: GamificationData | undefined): {
  celebrations: Celebration[];
  clear: () => void;
} {
  const [cleared, setCleared] = useState(false);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  useEffect(() => {
    if (!data) return;
    try {
      const prev = Number(window.localStorage.getItem(LEVEL_KEY) ?? '0');
      if (prev > 0 && data.xp.level > prev) setLevelUp(data.xp.level);
      window.localStorage.setItem(LEVEL_KEY, String(data.xp.level));
    } catch { /* private browsing — no level-up toasts, nothing else breaks */ }
  }, [data]);

  const celebrations = useMemo<Celebration[]>(() => {
    if (!data || cleared) return [];
    const out: Celebration[] = [];
    for (const a of data.newAchievements) out.push({ kind: 'achievement', achievement: a });
    for (const q of [...data.quests.daily, ...data.quests.weekly]) {
      if (q.justClaimed) out.push({ kind: 'quest', quest: q });
    }
    if (levelUp) out.push({ kind: 'levelUp', level: levelUp });
    return out;
  }, [data, cleared, levelUp]);

  return { celebrations, clear: () => { setCleared(true); setLevelUp(null); } };
}
