import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

export const APPROVAL_REQUIRED_ERROR =
  'Your account is pending approval. Creating decks and joining classrooms unlocks once your administrator approves you.';

/**
 * True if the user's account_status is 'approved'.
 * Pending/suspended accounts can still browse and study, but the
 * approval gate protects deck creation and classroom joining.
 */
export async function isAccountApproved(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('account_status')
    .eq('id', userId)
    .single();
  return data?.account_status === 'approved';
}
