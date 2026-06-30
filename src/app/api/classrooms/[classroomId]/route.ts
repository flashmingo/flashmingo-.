import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ classroomId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { classroomId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: classroom, error } = await supabase
    .from('classrooms')
    .select(`
      *,
      profiles!classrooms_teacher_id_fkey(full_name, avatar_url),
      student_classroom_memberships(
        student_id,
        joined_at,
        profiles!student_classroom_memberships_student_id_fkey(full_name, avatar_url)
      ),
      classroom_deck_shares(
        deck_id,
        created_at,
        decks(id, name, card_count)
      )
    `)
    .eq('id', classroomId)
    .single();

  if (error || !classroom) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ data: classroom });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { classroomId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const updates: { name?: string; description?: string | null; is_archived?: boolean } = {};
  if (typeof body.name === 'string') updates.name = body.name.trim();
  if (typeof body.description === 'string') updates.description = body.description.trim() || null;
  if (typeof body.is_archived === 'boolean') updates.is_archived = body.is_archived;

  const { data, error } = await supabase
    .from('classrooms')
    .update(updates)
    .eq('id', classroomId)
    .eq('teacher_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
