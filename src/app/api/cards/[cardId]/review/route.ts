import { supabaseServer } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/cards/[cardId]/review - Record a card review with SM-2 update
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    const { data: { session } } = await supabaseServer.auth.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const cardId = params.cardId;
    const { quality, new_state, next_review_at, session_id } = await request.json();

    // Update user card progress
    const { data: progress, error } = await supabaseServer
      .from('user_card_progress')
      .update({
        ease_factor: new_state.ease_factor,
        interval_days: new_state.interval_days,
        repetitions: new_state.repetitions,
        last_reviewed_at: new Date().toISOString(),
        next_review_at: next_review_at.toISOString(),
        last_confidence: quality,
        last_accuracy: quality >= 3,
        total_reviews: new_state.repetitions,
        correct_reviews: quality >= 3 ? (new_state.repetitions) : undefined,
      })
      .eq('user_id', session.user.id)
      .eq('flashcard_id', cardId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update study session stats
    if (session_id) {
      const { data: studySession } = await supabaseServer
        .from('study_sessions')
        .select('cards_reviewed, correct_count')
        .eq('id', session_id)
        .single();

      if (studySession) {
        await supabaseServer
          .from('study_sessions')
          .update({
            cards_reviewed: (studySession.cards_reviewed || 0) + 1,
            correct_count: (studySession.correct_count || 0) + (quality >= 3 ? 1 : 0),
          })
          .eq('id', session_id);
      }
    }

    return NextResponse.json(
      { data: progress },
      { status: 200 }
    );
  } catch (error) {
    console.error('Card review error:', error);
    return NextResponse.json(
      { error: 'Failed to record review' },
      { status: 500 }
    );
  }
}
