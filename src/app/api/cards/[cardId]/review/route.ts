import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ cardId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { cardId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { quality, new_state, next_review_at, session_id } = body;

  if (typeof quality !== 'number' || quality < 0 || quality > 5) {
    return NextResponse.json({ error: 'Invalid quality rating (0–5)' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('user_card_progress')
    .update({
      ease_factor: new_state.ease_factor,
      interval_days: new_state.interval_days,
      repetitions: new_state.repetitions,
      last_reviewed_at: new Date().toISOString(),
      next_review_at: new Date(next_review_at).toISOString(),
      last_confidence: quality,
      total_reviews: new_state.repetitions,
    })
    .eq('user_id', user.id)
    .eq('flashcard_id', cardId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (session_id) {
    const { data: sess } = await supabase
      .from('study_sessions')
      .select('cards_reviewed, correct_count')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .single();

    if (sess) {
      await supabase
        .from('study_sessions')
        .update({
          cards_reviewed: (sess.cards_reviewed ?? 0) + 1,
          correct_count: (sess.correct_count ?? 0) + (quality >= 3 ? 1 : 0),
        })
        .eq('id', session_id);
    }
  }

  return NextResponse.json({ data });
}
