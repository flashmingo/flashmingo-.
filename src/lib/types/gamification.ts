export interface XpProgress {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progressPct: number;
  baseReviewXp: number;
}

export interface AchievementSummary {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold';
}

export interface UnlockedAchievement extends AchievementSummary {
  unlockedAt: string;
}

export interface LockedAchievement extends AchievementSummary {
  progress: number;
  goal: number;
}

export interface NewAchievement extends AchievementSummary {
  xpReward: number;
}

export interface QuestProgress {
  id: string;
  title: string;
  description: string;
  icon: string;
  period: 'daily' | 'weekly';
  progress: number;
  goal: number;
  xpReward: number;
  completed: boolean;
  justClaimed: boolean;
}

export interface ReviewForecast {
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
}

export interface GamificationData {
  xp: XpProgress;
  newAchievements: NewAchievement[];
  achievements: {
    unlocked: UnlockedAchievement[];
    locked: LockedAchievement[];
  };
  quests: {
    daily: QuestProgress[];
    weekly: QuestProgress[];
  };
  forecast: ReviewForecast;
}

export interface WeeklyTotals {
  xp: number;
  cards: number;
  sessions: number;
  activeDays: number;
}

export interface WeeklyRecap {
  /** ISO week key of the just-completed week this recap covers. */
  weekKey: string;
  /** Human label, e.g. "Jun 30 – Jul 6". */
  weekLabel: string;
  recap: WeeklyTotals;
  prior: WeeklyTotals;
  /** Percent change in cards reviewed vs the prior week; null if prior was 0. */
  cardsDeltaPct: number | null;
  /** Current study streak in days. */
  streak: number;
  /** Whether the recapped week had any study activity (skip the card if not). */
  hadActivity: boolean;
}
