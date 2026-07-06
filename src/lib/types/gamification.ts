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
