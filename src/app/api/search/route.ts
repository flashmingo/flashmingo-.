import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (!q || q.length < 2) return NextResponse.json({ data: { decks: [], cards: [] } });

  // Cap at 50 chars to prevent abuse
  const query = q.slice(0, 50);

  // Run deck and card search in parallel
  const [decksResult, cardsResult] = await Promise.all([
    supabase
      .from('decks')
      .select('id, name, description, card_count, updated_at')
      .eq('owner_id', user.id)
      .textSearch('search_vector', query, { type: 'websearch', config: 'english' })
      .limit(8),

    supabase
      .from('flashcards')
      .select('id, deck_id, front_text, back_text, decks!inner(id, name, owner_id)')
      .eq('decks.owner_id', user.id)
      .textSearch('search_vector', query, { type: 'websearch', config: 'english' })
      .limit(12),
  ]);

  // If full-text returns nothing, fall back to trigram ilike
  let decks = decksResult.data ?? [];
  let cards = cardsResult.data ?? [];

  if (decks.length === 0) {
    const { data } = await supabase
      .from('decks')
      .select('id, name, description, card_count, updated_at')
      .eq('owner_id', user.id)
      .ilike('name', `%${query}%`)
      .limit(8);
    decks = data ?? [];
  }

  if (cards.length === 0) {
    const { data } = await supabase
      .from('flashcards')
      .select('id, deck_id, front_text, back_text, decks!inner(id, name, owner_id)')
      .eq('decks.owner_id', user.id)
      .or(`front_text.ilike.%${query}%,back_text.ilike.%${query}%`)
      .limit(12);
    cards = data ?? [];
  }

  return NextResponse.json({ data: { decks, cards } });
}
