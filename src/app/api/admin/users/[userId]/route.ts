import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ userId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: admin } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (admin?.role !== 'administrator')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Prevent self-modification
  if (userId === user.id)
    return NextResponse.json({ error: 'Cannot modify your own account' }, { status: 400 });

  const body = await req.json();
  const allowed: {
    account_status?: 'pending' | 'approved' | 'suspended';
    role?: 'student' | 'teacher' | 'administrator';
  } = {};
  if (body.account_status) allowed.account_status = body.account_status;
  if (body.role)            allowed.role = body.role;

  const { data, error } = await supabase
    .from('profiles').update(allowed).eq('id', userId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}
