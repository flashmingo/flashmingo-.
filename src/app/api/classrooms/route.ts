import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateClassroomCode } from '@/lib/utils';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  let data, error;

  if (profile?.role === 'teacher' || profile?.role === 'administrator') {
    // Teachers see classrooms they own
    ({ data, error } = await supabase
      .from('classrooms')
      .select(`*, student_classroom_memberships(count)`)
      .eq('teacher_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false }));
  } else {
    // Students see classrooms they joined
    ({ data, error } = await supabase
      .from('classrooms')
      .select(`*, student_classroom_memberships!inner(student_id)`)
      .eq('student_classroom_memberships.student_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false }));
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, district_id')
    .eq('id', user.id)
    .single();

  if (!profile || !['teacher', 'administrator'].includes(profile.role)) {
    return NextResponse.json({ error: 'Only teachers can create classrooms' }, { status: 403 });
  }

  const body = await request.json();
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  // Generate unique classroom code
  let classroom_code = generateClassroomCode();
  let attempts = 0;
  while (attempts < 5) {
    const { data: existing } = await supabase
      .from('classrooms')
      .select('id')
      .eq('classroom_code', classroom_code)
      .single();
    if (!existing) break;
    classroom_code = generateClassroomCode();
    attempts++;
  }

  const { data, error } = await supabase
    .from('classrooms')
    .insert({
      teacher_id: user.id,
      district_id: profile.district_id,
      name,
      description: typeof body.description === 'string' ? body.description.trim() || null : null,
      classroom_code,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
