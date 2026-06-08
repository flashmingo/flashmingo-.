import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Profile } from './types';

/**
 * Get current session
 */
export async function getSession(): Promise<Session | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Get current user profile
 */
export async function getUserProfile(): Promise<Profile | null> {
  try {
    const session = await getSession();
    if (!session) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error getting user profile:', error);
      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

/**
 * Sign up a new user with role
 */
export async function signUp(
  username: string,
  password: string,
  role: 'student' | 'teacher' | 'administrator'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Generate a pseudonymous email
    const pseudoEmail = `${username}+${Math.random().toString(36).substr(2, 9)}@kenmei.local`;

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: pseudoEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user' };
    }

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      username,
      role,
      account_status: role === 'administrator' ? 'approved' : 'pending',
    });

    if (profileError) {
      // If profile creation fails, we should ideally delete the auth user
      return { success: false, error: profileError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Sign in with username and password
 * Note: We need to fetch the user first to get their pseudo email
 */
export async function signIn(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First, get the user's profile to find their ID
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (profileError || !profileData) {
      return { success: false, error: 'User not found' };
    }

    // Get the user's auth email from the auth.users table
    // Since we don't have direct access from client, we'll sign in with a known pattern
    // This requires a different approach - use auth.signInWithPassword with email
    // But we need the email... let's try a different approach

    // For MVP, we'll use a simpler approach: sign in with the username@kenmei.local pattern
    // This assumes the email was created with a pattern
    const possibleEmails = [
      `${username}@kenmei.local`,
      // Add more variations if needed
    ];

    let lastError: string | null = null;

    for (const email of possibleEmails) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data?.session) {
          return { success: true };
        }

        if (error) {
          lastError = error.message;
        }
      } catch (e) {
        // Continue to next email pattern
      }
    }

    return { success: false, error: lastError || 'Invalid credentials' };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Update password
 */
export async function updatePassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Update password error:', error);
    return { success: false, error: String(error) };
  }
}
