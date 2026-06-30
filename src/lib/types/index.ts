/**
 * FlashMingo — domain type definitions.
 * Import from here, not directly from database.ts.
 */
export type { Database, Tables, TablesInsert, TablesUpdate, Enums } from './database';

// ——————————————————————————————————————————————————
// Enums / scalars
// ——————————————————————————————————————————————————

export type UserRole = 'student' | 'teacher' | 'administrator';
export type AccountStatus = 'pending' | 'approved' | 'suspended';
export type DistrictStatus = 'pending' | 'approved' | 'rejected';

// ——————————————————————————————————————————————————
// Domain row types (derived from Tables<> for DRY)
// ——————————————————————————————————————————————————

import type { Tables } from './database';

export type Profile    = Tables<'profiles'>;
export type District   = Tables<'districts'>;
export type Folder     = Tables<'folders'>;
export type Tag        = Tables<'tags'>;
export type Deck       = Tables<'decks'>;
export type DeckTag    = Tables<'deck_tags'>;
export type Flashcard  = Tables<'flashcards'>;
export type UserCardProgress = Tables<'user_card_progress'>;
export type Classroom  = Tables<'classrooms'>;
export type StudentClassroomMembership = Tables<'student_classroom_memberships'>;
export type ClassroomDeckShare = Tables<'classroom_deck_shares'>;
export type StudySession = Tables<'study_sessions'>;
export type AuditLog   = Tables<'audit_logs'>;

// ——————————————————————————————————————————————————
// Composite / view types used by the application
// ——————————————————————————————————————————————————

/** Deck with its tags attached (used on deck list pages) */
export interface DeckWithTags extends Deck {
  tags: Tag[];
}

/** Flashcard with the calling user's SM-2 progress */
export interface FlashcardWithProgress extends Flashcard {
  progress: UserCardProgress | null;
}

/** Classroom with membership count (teacher dashboard) */
export interface ClassroomWithStats extends Classroom {
  member_count: number;
  shared_deck_count: number;
}

// ——————————————————————————————————————————————————
// API helpers
// ——————————————————————————————————————————————————

export interface ApiResponse<T = unknown> {
  data?: T | null;
  error?: string | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
