import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAccountApproved, APPROVAL_REQUIRED_ERROR } from '@/lib/approval';
import { checkProfanityPayload, PROFANITY_ERROR } from '@/lib/profanity';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (!name) return NextResponse.json({ error: 'Deck name is required' }, { status: 400 });
  if (name.length > 100) return NextResponse.json({ error: 'Name too long (max 100)' }, { status: 400 });
  if (checkProfanityPayload(name, body.description)) {
    return NextResponse.json({ error: PROFANITY_ERROR }, { status: 400 });
  }
  if (!(await isAccountApproved(supabase, user.id))) {
    return NextResponse.json({ error: APPROVAL_REQUIRED_ERROR }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('decks')
    .insert({
      owner_id: user.id,
      name,
      description: typeof body.description === 'string' ? body.description.trim() || null : null,
      is_public: Boolean(body.is_public),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action_type: 'deck_created',
    resource_type: 'deck',
    resource_id: data.id,
    details: { name },
  });

  return NextResponse.json({ data }, { status: 201 });
}
