import { supabaseServer } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';
import { Flashcard } from '@/lib/types';

/**
 * POST /api/decks/[deckId]/flashcards - Create a flashcard
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { deckId: string } }
) {
  try {
    const { data: { session } } = await supabaseServer.auth.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const deckId = params.deckId;
    const { front_text, back_text, front_image_url, back_image_url } = await request.json();

    // Check deck ownership
    const { data: deck } = await supabaseServer
      .from('decks')
      .select('owner_id')
      .eq('id', deckId)
      .single();

    if (!deck || deck.owner_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate
    if (!front_text?.trim()) {
      return NextResponse.json(
        { error: 'Front text is required' },
        { status: 400 }
      );
    }

    if (!back_text?.trim()) {
      return NextResponse.json(
        { error: 'Back text is required' },
        { status: 400 }
      );
    }

    // Create flashcard
    const { data: flashcard, error } = await supabaseServer
      .from('flashcards')
      .insert({
        deck_id: deckId,
        front_text: front_text.trim(),
        back_text: back_text.trim(),
        front_image_url: front_image_url || null,
        back_image_url: back_image_url || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Initialize progress for user
    await supabaseServer
      .from('user_card_progress')
      .insert({
        user_id: session.user.id,
        flashcard_id: flashcard.id,
        ease_factor: 2.5,
        interval_days: 0,
        repetitions: 0,
        next_review_at: new Date().toISOString(),
      });

    return NextResponse.json(
      { data: flashcard as Flashcard },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create flashcard error:', error);
    return NextResponse.json(
      { error: 'Failed to create flashcard' },
      { status: 500 }
    );
  }
}
