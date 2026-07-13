import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkProfanityPayload, PROFANITY_ERROR } from '@/lib/profanity';
import { isSelfApprover } from '@/lib/deckPublish';

type Params = { params: Promise<{ deckId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { deckId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('id', deckId)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { deckId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (checkProfanityPayload(body.name, body.description)) {
    return NextResponse.json({ error: PROFANITY_ERROR }, { status: 400 });
  }
  const updates: {
    name?: string; description?: string | null; is_public?: boolean;
    publish_status?: 'private' | 'pending' | 'approved';
    publish_requested_at?: string | null;
    publish_reviewed_by?: string | null;
    publish_reviewed_at?: string | null;
  } = {};
  if (typeof body.name === 'string') {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
    if (name.length > 100) return NextResponse.json({ error: 'Name too long' }, { status: 400 });
    updates.name = name;
  }
  if (typeof body.description === 'string') updates.description = body.description.trim() || null;

  // Publishing is gated. Setting is_public:
  //   true  → self-approvers (teacher/admin) publish directly; everyone else
  //           files a pending request and the deck stays private until reviewed.
  //   false → unpublish immediately, reset to private.
  let publishOutcome: 'published' | 'requested' | 'unpublished' | null = null;
  if (typeof body.is_public === 'boolean') {
    if (body.is_public) {
      if (await isSelfApprover(supabase, user.id)) {
        updates.is_public = true;
        updates.publish_status = 'approved';
        updates.publish_reviewed_by = user.id;
        updates.publish_reviewed_at = new Date().toISOString();
        publishOutcome = 'published';
      } else {
        updates.is_public = false;
        updates.publish_status = 'pending';
        updates.publish_requested_at = new Date().toISOString();
        updates.publish_reviewed_by = null;
        updates.publish_reviewed_at = null;
        publishOutcome = 'requested';
      }
    } else {
      updates.is_public = false;
      updates.publish_status = 'private';
      updates.publish_requested_at = null;
      publishOutcome = 'unpublished';
    }
  }

  const { data, error } = await supabase
    .from('decks')
    .update(updates)
    .eq('id', deckId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: error ? 500 : 404 });
  return NextResponse.json({ data, publishOutcome });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { deckId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', deckId)
    .eq('owner_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
