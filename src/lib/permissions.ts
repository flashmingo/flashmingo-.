import type { Profile, UserRole } from './types';

export function hasRole(user: Profile | null, role: UserRole): boolean {
  return user?.role === role;
}

export function isStudent(user: Profile | null): boolean {
  return hasRole(user, 'student');
}

export function isTeacher(user: Profile | null): boolean {
  return hasRole(user, 'teacher');
}

export function isAdmin(user: Profile | null): boolean {
  return hasRole(user, 'administrator');
}

export function isAccountApproved(user: Profile | null): boolean {
  return user?.account_status === 'approved';
}

export function canAccessResource(user: Profile | null, ownerId: string): boolean {
  if (!user) return false;
  return isAdmin(user) || user.id === ownerId;
}
