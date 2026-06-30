import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { deck_id } = await request.json();
  if (!deck_id) return NextResponse.json({ error: 'deck_id required' }, { status: 400 });

  const { data, error } = await supabase
    .from('study_sessions')
    .insert({ user_id: user.id, deck_id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data }, { status: 201 });
}
