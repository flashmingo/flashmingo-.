'use client';

import { useAuth } from './useAuth';
import type { Profile } from '@/lib/types';

export function useUser(): {
  user: Profile | null;
  isLoading: boolean;
} {
  const { profile, isLoading } = useAuth();
  return { user: profile, isLoading };
}
