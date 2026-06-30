import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ deckId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { deckId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch deck — must be public
  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .select('id, name, description, card_count, updated_at, owner_id, is_public')
    .eq('id', deckId)
    .eq('is_public', true)
    .single();

  if (deckError || !deck) return NextResponse.json({ error: 'Deck not found or not public' }, { status: 404 });

  // Fetch owner profile
  const { data: owner } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('id', deck.owner_id)
    .single();

  // Fetch cards (front/back only — no SR metadata exposed for public decks)
  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('id, front, back, created_at')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: true });

  if (cardsError) return NextResponse.json({ error: cardsError.message }, { status: 500 });

  return NextResponse.json({
    data: {
      ...deck,
      owner,
      cards: cards ?? [],
    },
  });
}
