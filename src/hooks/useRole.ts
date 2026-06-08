'use client';

import { useUser } from './useUser';
import { isStudent, isTeacher, isAdmin, isAccountApproved } from '@/lib/permissions';

export function useRole() {
  const { user, isLoading } = useUser();

  return {
    user,
    isLoading,
    isStudent: isStudent(user),
    isTeacher: isTeacher(user),
    isAdmin: isAdmin(user),
    isApproved: isAccountApproved(user),
    role: user?.role || null,
  };
}
