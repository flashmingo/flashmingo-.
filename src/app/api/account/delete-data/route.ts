import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminClient = createAdminClient();

  try {
    const { data: decksData, error: decksError } = await supabase
      .from('decks')
      .select('id')
      .eq('owner_id', user.id);

    if (decksError) throw decksError;

    const deckIds = (decksData ?? []).map((deck) => deck.id);

    if (deckIds.length > 0) {
      await supabase.from('flashcards').delete().in('deck_id', deckIds);
      await supabase.from('decks').delete().in('id', deckIds);
    }

    await supabase.from('folders').delete().eq('owner_id', user.id);
    await supabase.from('tags').delete().eq('owner_id', user.id);
    await supabase.from('user_card_progress').delete().eq('user_id', user.id);
    await supabase.from('study_sessions').delete().eq('user_id', user.id);
    await supabase.from('student_classroom_memberships').delete().eq('student_id', user.id);

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action_type: 'account_deleted',
      resource_type: 'profile',
      resource_id: user.id,
      details: { deleted: true },
    });

    if (adminClient) {
      await adminClient.auth.admin.deleteUser(user.id);
    }

    await supabase.from('profiles').delete().eq('id', user.id);

    return NextResponse.json({ success: true, message: 'Data deletion completed.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
