/**
 * SM-2 (SuperMemo 2) Algorithm Implementation
 * 
 * The SM-2 algorithm is a proven algorithm for spaced repetition learning.
 * It calculates optimal intervals for reviewing flashcards based on user performance.
 * 
 * Reference: https://en.wikipedia.org/wiki/Spaced_repetition#SM-2
 * 
 * Key Parameters:
 * - ease_factor (EF): Determines how quickly interval grows. Range: 1.3 to 2.5+
 * - interval: Days until next review
 * - repetitions: Number of consecutive successful reviews
 */

export interface SM2State {
  ease_factor: number;      // Current ease factor (1.3 to 2.5+)
  interval_days: number;    // Days until next review
  repetitions: number;      // Number of successful repetitions
}

export interface SM2Review {
  quality: number;          // 0-5: User's confidence/quality of answer
  current_state: SM2State;  // Current SM-2 state
  new_state: SM2State;      // Updated SM-2 state
  next_review_date: Date;   // When to review next
}

/**
 * Calculate SM-2 algorithm result
 * 
 * @param current_state - Current SM-2 state (ease, interval, repetitions)
 * @param quality - User's answer quality (0-5)
 *                  0-2: Incorrect/forgotten
 *                  3-4: Correct but with difficulty
 *                  5: Perfect response
 * @returns Updated SM-2 state and next review date
 */
export function calculateSM2(
  current_state: SM2State,
  quality: number
): SM2Review {
  // Validate quality (0-5 scale)
  const q = Math.max(0, Math.min(5, quality));

  // If quality is poor (< 3), reset learning
  if (q < 3) {
    const new_state: SM2State = {
      ease_factor: current_state.ease_factor,
      interval_days: 1,
      repetitions: 0,
    };
    const next_review = addDays(new Date(), 1);
    return {
      quality: q,
      current_state,
      new_state,
      next_review_date: next_review,
    };
  }

  // Calculate new ease factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const new_ef =
    current_state.ease_factor +
    (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

  // Ease factor minimum is 1.3
  const ease_factor = Math.max(1.3, new_ef);

  // Calculate new interval
  let interval_days: number;
  if (current_state.repetitions === 0) {
    // First review: 1 day
    interval_days = 1;
  } else if (current_state.repetitions === 1) {
    // Second review: 3 days
    interval_days = 3;
  } else {
    // Subsequent reviews: multiply previous interval by ease factor
    interval_days = Math.round(
      current_state.interval_days * ease_factor
    );
  }

  // Increment repetitions
  const repetitions = current_state.repetitions + 1;

  const new_state: SM2State = {
    ease_factor,
    interval_days,
    repetitions,
  };

  const next_review = addDays(new Date(), interval_days);

  return {
    quality: q,
    current_state,
    new_state,
    next_review_date: next_review,
  };
}

/**
 * Initialize SM-2 state for new card
 */
export function initializeSM2(): SM2State {
  return {
    ease_factor: 2.5,    // Default starting ease
    interval_days: 0,    // Due immediately
    repetitions: 0,      // Not yet reviewed
  };
}

/**
 * Get cards due for review today
 * Returns true if next_review_at <= now
 */
export function isCardDueForReview(next_review_at: Date): boolean {
  const now = new Date();
  return next_review_at <= now;
}

/**
 * Get cards due for review within N days
 */
export function getCardsOverdueCount(
  next_review_at: Date,
  days: number = 0
): number {
  const now = new Date();
  const future = addDays(now, days);
  return next_review_at <= future ? 1 : 0;
}

/**
 * Utility: Add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  result.setHours(0, 0, 0, 0); // Reset to start of day
  return result;
}

/**
 * Quality Ratings Explanation:
 * 
 * 0 - Incorrect, complete blackout
 * 1 - Incorrect, but on the right track
 * 2 - Incorrect, significant errors
 * 3 - Correct, but required serious difficulty
 * 4 - Correct, after some hesitation
 * 5 - Correct, perfect response
 * 
 * For simplicity in UI, can show as:
 * - Again (0-2)
 * - Good (3-4)
 * - Easy (5)
 */

/**
 * Calculate study statistics
 */
export interface StudyStats {
  total_reviewed: number;
  due_today: number;
  due_this_week: number;
  new_cards: number;
  learning: number;
  reviewing: number;
}

/**
 * Format interval for display
 */
export function formatInterval(days: number): string {
  if (days === 0) return 'Due now';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `${days} days`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks > 1 ? 's' : ''}`;
}

/**
 * Get ease rating color
 */
export function getEaseColor(ease_factor: number): string {
  if (ease_factor < 1.5) return '#e05c6b'; // red
  if (ease_factor < 2.0) return '#f59e0b'; // amber
  if (ease_factor < 2.3) return '#10b981'; // green
  return '#06b6d4'; // cyan
}
