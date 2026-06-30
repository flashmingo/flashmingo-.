import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
  if (!code) return NextResponse.json({ error: 'Classroom code is required' }, { status: 400 });

  // Find classroom by code
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name, is_archived')
    .eq('classroom_code', code)
    .single();

  if (!classroom) return NextResponse.json({ error: 'Classroom not found. Check the code and try again.' }, { status: 404 });
  if (classroom.is_archived) return NextResponse.json({ error: 'This classroom is archived.' }, { status: 400 });

  // Check already a member
  const { data: existing } = await supabase
    .from('student_classroom_memberships')
    .select('student_id')
    .eq('student_id', user.id)
    .eq('classroom_id', classroom.id)
    .single();

  if (existing) return NextResponse.json({ error: 'You are already a member of this classroom.' }, { status: 400 });

  const { error } = await supabase
    .from('student_classroom_memberships')
    .insert({ student_id: user.id, classroom_id: classroom.id });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { classroom_id: classroom.id, name: classroom.name } });
}
