import { Profile, UserRole } from './types';

/**
 * Check if user has a specific role
 */
export function hasRole(user: Profile | null, role: UserRole): boolean {
  return user?.role === role;
}

/**
 * Check if user is a student
 */
export function isStudent(user: Profile | null): boolean {
  return hasRole(user, 'student');
}

/**
 * Check if user is a teacher
 */
export function isTeacher(user: Profile | null): boolean {
  return hasRole(user, 'teacher');
}

/**
 * Check if user is an administrator
 */
export function isAdmin(user: Profile | null): boolean {
  return hasRole(user, 'administrator');
}

/**
 * Check if user account is approved
 */
export function isAccountApproved(user: Profile | null): boolean {
  return user?.account_status === 'approved';
}

/**
 * Check if user is in a district
 */
export function hasDistrict(user: Profile | null): boolean {
  return !!user?.district_id;
}

/**
 * Check if user can access a resource by owner_id
 */
export function canAccessResource(user: Profile | null, resourceOwnerId: string): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return user.id === resourceOwnerId;
}

/**
 * Get list of accessible routes for a user role
 */
export function getAccessibleRoutes(role: UserRole | null): string[] {
  const publicRoutes = ['/auth/login', '/auth/signup', '/'];

  if (!role) {
    return publicRoutes;
  }

  const commonRoutes = ['/dashboard', '/decks', '/study', '/settings'];

  const roleSpecificRoutes: Record<UserRole, string[]> = {
    student: commonRoutes,
    teacher: [...commonRoutes, '/teacher/classrooms'],
    administrator: [...commonRoutes, '/admin'],
  };

  return [...publicRoutes, ...(roleSpecificRoutes[role] || [])];
}

/**
 * Check if route is accessible for user role
 */
export function isRouteAccessible(role: UserRole | null, route: string): boolean {
  const accessibleRoutes = getAccessibleRoutes(role);
  return accessibleRoutes.some((ar) => route.startsWith(ar));
}
