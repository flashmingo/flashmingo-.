import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canReviewDeckOwner } from '@/lib/deckPublish';

type Params = { params: Promise<{ deckId: string }> };

/**
 * POST /api/decks/[deckId]/publish-review  { action: 'approve' | 'reject' }
 *
 * A reviewer (admin, or a teacher who shares a classroom with the deck owner)
 * acts on a pending publish request. Approving makes the deck public; rejecting
 * returns it to private. Every decision is written to the audit log.
 */
export async function POST(request: NextRequest, { params }: Params) {
  const { deckId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const action = body?.action;
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'action must be "approve" or "reject"' }, { status: 400 });
  }

  const { data: deck } = await supabase
    .from('decks').select('id, owner_id, publish_status').eq('id', deckId).single();
  if (!deck) return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
  if (deck.publish_status !== 'pending') {
    return NextResponse.json({ error: 'This deck has no pending publish request.' }, { status: 400 });
  }

  if (!(await canReviewDeckOwner(supabase, user.id, deck.owner_id))) {
    return NextResponse.json({ error: 'You are not allowed to review this deck.' }, { status: 403 });
  }

  const approved = action === 'approve';
  const { error } = await supabase
    .from('decks')
    .update({
      is_public: approved,
      publish_status: approved ? 'approved' : 'rejected',
      publish_reviewed_by: user.id,
      publish_reviewed_at: new Date().toISOString(),
    })
    .eq('id', deckId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action_type: approved ? 'deck_publish_approved' : 'deck_publish_rejected',
    resource_type: 'deck',
    resource_id: deckId,
  });

  return NextResponse.json({ success: true });
}
