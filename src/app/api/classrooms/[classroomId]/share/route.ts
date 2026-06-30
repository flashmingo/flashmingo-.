import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ classroomId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { classroomId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const deck_id = typeof body.deck_id === 'string' ? body.deck_id : '';
  if (!deck_id) return NextResponse.json({ error: 'deck_id is required' }, { status: 400 });

  // Verify teacher owns classroom
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id')
    .eq('id', classroomId)
    .eq('teacher_id', user.id)
    .single();
  if (!classroom) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { error } = await supabase
    .from('classroom_deck_shares')
    .upsert({ classroom_id: classroomId, deck_id, shared_by_id: user.id });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { classroomId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const deck_id = request.nextUrl.searchParams.get('deck_id') ?? '';
  if (!deck_id) return NextResponse.json({ error: 'deck_id is required' }, { status: 400 });

  const { error } = await supabase
    .from('classroom_deck_shares')
    .delete()
    .eq('classroom_id', classroomId)
    .eq('deck_id', deck_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
