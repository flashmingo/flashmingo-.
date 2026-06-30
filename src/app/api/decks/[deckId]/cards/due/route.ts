import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ deckId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { deckId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('flashcards')
    .select(`
      *,
      user_card_progress!inner(*)
    `)
    .eq('deck_id', deckId)
    .eq('user_card_progress.user_id', user.id)
    .lte('user_card_progress.next_review_at', new Date().toISOString())
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}
