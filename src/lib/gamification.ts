/**
 * FlashMingo — gamification math.
 *
 * Level is derived from total XP rather than stored, so the curve can be
 * tuned without a migration. Curve: totalXpForLevel(n) = 50 * n².
 * That gives level thresholds of 50, 200, 450, 800, 1250, 1800, 2450…
 * — a gentle early climb that steepens, without ever feeling punishing.
 */

export const XP_BASE_REVIEW = 10;
export const XP_PERFECT_REVIEW_BONUS = 5; // rated "Easy" (quality 5)
export const XP_SESSION_COMPLETE = 15;

const LEVEL_CURVE_COEFFICIENT = 50;

/** Total XP required to *reach* level n (n >= 1). Level 1 requires 0 XP. */
export function totalXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return LEVEL_CURVE_COEFFICIENT * (level - 1) ** 2;
}

export interface LevelProgress {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progressPct: number; // 0–100
}

export function getLevelProgress(totalXp: number): LevelProgress {
  let level = 1;
  while (totalXpForLevel(level + 1) <= totalXp) level++;

  const floor = totalXpForLevel(level);
  const ceiling = totalXpForLevel(level + 1);
  const xpIntoLevel = totalXp - floor;
  const xpForNextLevel = ceiling - floor;

  return {
    level,
    totalXp,
    xpIntoLevel,
    xpForNextLevel,
    progressPct: xpForNextLevel > 0 ? Math.min(100, (xpIntoLevel / xpForNextLevel) * 100) : 100,
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Quest period keys — how progress windows are identified & claimed once.
   ───────────────────────────────────────────────────────────────────────────── */

export function dailyPeriodKey(date: Date): string {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

/** ISO 8601 week key, e.g. "2026-W27". */
export function weeklyPeriodKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/** Start-of-week (Monday) for a given date, in UTC-normalized local terms. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // shift Sunday(0) back to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
