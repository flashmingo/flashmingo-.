/**
 * Utility functions for common operations
 */

/**
 * Generate a random string of specified length
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a classroom code
 */
export function generateClassroomCode(): string {
  return generateRandomString(8).toUpperCase();
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Truncate string to specified length
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Check if string is valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if password meets requirements
 * - At least 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 12) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
  return true;
}

/**
 * Get password strength feedback
 */
export function getPasswordStrengthFeedback(password: string): string[] {
  const feedback: string[] = [];

  if (password.length < 12) feedback.push('At least 12 characters');
  if (!/[A-Z]/.test(password)) feedback.push('At least one uppercase letter');
  if (!/[a-z]/.test(password)) feedback.push('At least one lowercase letter');
  if (!/[0-9]/.test(password)) feedback.push('At least one number');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    feedback.push('At least one special character');

  return feedback;
}

/**
 * Sanitize username (alphanumeric, underscores, hyphens only)
 */
export function sanitizeUsername(username: string): string {
  return username.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50);
}

/**
 * Validate username
 */
export function isValidUsername(username: string): boolean {
  if (username.length < 3 || username.length > 50) return false;
  return /^[a-zA-Z0-9_-]+$/.test(username);
}

/**
 * Get username feedback
 */
export function getUsernameFeedback(username: string): string[] {
  const feedback: string[] = [];

  if (username.length < 3) feedback.push('At least 3 characters');
  if (username.length > 50) feedback.push('At most 50 characters');
  if (!/^[a-zA-Z0-9_-]+$/.test(username))
    feedback.push('Only alphanumeric characters, underscores, and hyphens');

  return feedback;
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
