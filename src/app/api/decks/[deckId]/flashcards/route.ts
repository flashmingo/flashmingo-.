import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkProfanityPayload, PROFANITY_ERROR } from '@/lib/profanity';

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
    .select('*')
    .eq('deck_id', deckId)
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest, { params }: Params) {
  const { deckId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify deck ownership via RLS — if this select returns nothing, the user doesn't own it
  const { data: deck } = await supabase
    .from('decks')
    .select('id')
    .eq('id', deckId)
    .eq('owner_id', user.id)
    .single();

  if (!deck) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const front_text = typeof body.front_text === 'string' ? body.front_text.trim() : '';
  const back_text = typeof body.back_text === 'string' ? body.back_text.trim() : '';

  if (!front_text) return NextResponse.json({ error: 'front_text is required' }, { status: 400 });
  if (checkProfanityPayload(front_text, body.back_text)) {
    return NextResponse.json({ error: PROFANITY_ERROR }, { status: 400 });
  }
  if (!back_text) return NextResponse.json({ error: 'back_text is required' }, { status: 400 });

  const { data, error } = await supabase
    .from('flashcards')
    .insert({
      deck_id: deckId,
      front_text,
      back_text,
      front_image_url: body.front_image_url ?? null,
      back_image_url: body.back_image_url ?? null,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Initialize SM-2 progress record
  await supabase.from('user_card_progress').insert({
    user_id: user.id,
    flashcard_id: data.id,
    ease_factor: 2.5,
    interval_days: 0,
    repetitions: 0,
    next_review_at: new Date().toISOString(),
    total_reviews: 0,
    correct_reviews: 0,
  });

  return NextResponse.json({ data }, { status: 201 });
}
