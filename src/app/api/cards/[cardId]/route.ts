import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ cardId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { cardId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify ownership via deck
  const { data: card } = await supabase
    .from('flashcards')
    .select('id, deck_id, decks!inner(owner_id)')
    .eq('id', cardId)
    .single();

  if (!card) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const updates: { front_text?: string; back_text?: string; sort_order?: number } = {};
  if (typeof body.front_text === 'string') {
    const t = body.front_text.trim();
    if (!t) return NextResponse.json({ error: 'front_text cannot be empty' }, { status: 400 });
    updates.front_text = t;
  }
  if (typeof body.back_text === 'string') {
    const t = body.back_text.trim();
    if (!t) return NextResponse.json({ error: 'back_text cannot be empty' }, { status: 400 });
    updates.back_text = t;
  }
  if (typeof body.sort_order === 'number') updates.sort_order = body.sort_order;

  const { data, error } = await supabase
    .from('flashcards')
    .update(updates)
    .eq('id', cardId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { cardId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('flashcards')
    .delete()
    .eq('id', cardId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
