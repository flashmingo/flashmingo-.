'use client';

import { useAuth } from './useAuth';
import { isStudent, isTeacher, isAdmin, isAccountApproved } from '@/lib/permissions';

export function useRole() {
  const { profile, isLoading } = useAuth();

  return {
    user: profile,
    isLoading,
    isStudent: isStudent(profile),
    isTeacher: isTeacher(profile),
    isAdmin: isAdmin(profile),
    isApproved: isAccountApproved(profile),
    role: profile?.role ?? null,
  };
}
