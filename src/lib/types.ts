/**
 * Core TypeScript type definitions for Kenmei
 */

/**
 * User Roles in the system
 */
export type UserRole = 'student' | 'teacher' | 'administrator';

/**
 * Account status in the system
 */
export type AccountStatus = 'pending' | 'approved' | 'rejected';

/**
 * District status
 */
export type DistrictStatus = 'pending' | 'approved' | 'rejected';

/**
 * User profile from profiles table
 */
export interface Profile {
  id: string; // UUID from auth.users
  username: string;
  role: UserRole;
  district_id: string | null;
  account_status: AccountStatus;
  leaderboard_opt_in: boolean;
  created_at: string;
  last_login_at: string | null;
  updated_at: string;
}

/**
 * District record
 */
export interface District {
  id: string;
  name: string;
  status: DistrictStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Flashcard deck
 */
export interface Deck {
  id: string;
  owner_id: string;
  name: string;
  description?: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Individual flashcard
 */
export interface Flashcard {
  id: string;
  deck_id: string;
  front_text?: string | null;
  front_image_url?: string | null;
  back_text?: string | null;
  back_image_url?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * User's progress on a flashcard (SM-2 algorithm data)
 */
export interface UserCardProgress {
  user_id: string;
  flashcard_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  last_reviewed_at: string;
  next_review_at: string;
  total_reviews: number;
  correct_reviews: number;
  last_confidence?: number | null;
  last_accuracy?: boolean | null;
}

/**
 * Classroom (teacher-managed)
 */
export interface Classroom {
  id: string;
  teacher_id: string;
  district_id: string | null;
  name: string;
  classroom_code: string; // 8-char code for joining
  created_at: string;
  updated_at: string;
}

/**
 * Student-Classroom membership
 */
export interface StudentClassroomMembership {
  student_id: string;
  classroom_id: string;
  joined_at: string;
}

/**
 * Classroom-Deck share
 */
export interface ClassroomDeckShare {
  classroom_id: string;
  deck_id: string;
  shared_by_id: string;
  created_at: string;
}

/**
 * Study session record
 */
export interface StudySession {
  id: string;
  user_id: string;
  deck_id: string;
  started_at: string;
  ended_at: string | null;
  cards_reviewed: number;
  correct_count: number;
  total_time_minutes: number;
}

/**
 * Audit log entry
 */
export interface AuditLog {
  id: string;
  user_id?: string | null;
  action_type: string;
  resource_type: string;
  resource_id?: string | null;
  details?: Record<string, any> | null;
  timestamp: string;
}

/**
 * Session user context (from auth + profile)
 */
export interface SessionUser extends Profile {
  email?: string; // pseudo email from auth
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data?: T | null;
  error?: string | null;
  message?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  error?: string | null;
}
