import { supabaseServer } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/decks/[deckId]/cards/due - Get cards due for review
 */
export async function GET(
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

    // Get all flashcards in the deck with user's progress
    const { data: cards, error } = await supabaseServer
      .from('flashcards')
      .select(`
        id,
        deck_id,
        front_text,
        front_image_url,
        back_text,
        back_image_url,
        created_at,
        updated_at,
        user_card_progress!inner(
          user_id,
          ease_factor,
          interval_days,
          repetitions,
          last_reviewed_at,
          next_review_at,
          total_reviews,
          correct_reviews,
          last_confidence,
          last_accuracy
        )
      `)
      .eq('deck_id', deckId)
      .eq('user_card_progress.user_id', session.user.id)
      .lte('user_card_progress.next_review_at', new Date().toISOString())
      .order('user_card_progress.next_review_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Format response
    const formattedCards = cards.map(card => ({
      flashcard: {
        id: card.id,
        deck_id: card.deck_id,
        front_text: card.front_text,
        front_image_url: card.front_image_url,
        back_text: card.back_text,
        back_image_url: card.back_image_url,
        created_at: card.created_at,
        updated_at: card.updated_at,
      },
      progress: card.user_card_progress[0],
    }));

    return NextResponse.json({
      data: formattedCards,
    });
  } catch (error) {
    console.error('Fetch due cards error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}
