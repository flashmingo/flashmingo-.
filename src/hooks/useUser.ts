'use client';

import { useAuth } from './useAuth';
import { useCallback, useState, useEffect } from 'react';
import { Profile } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';

export function useUser() {
  const { user: contextUser, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<Profile | null>(contextUser || null);
  const [isLoading, setIsLoading] = useState(authLoading);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile
  const fetchUser = useCallback(async () => {
    if (!contextUser?.id) {
      setUser(null);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', contextUser.id)
        .single();

      if (fetchError) throw fetchError;
      setUser(data as Profile);
      setError(null);
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(String(err));
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [contextUser?.id]);

  useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
      setIsLoading(false);
    }
  }, [contextUser]);

  return { user, isLoading, error, refetch: fetchUser };
}
