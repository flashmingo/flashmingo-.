import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'administrator')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const status = req.nextUrl.searchParams.get('status');
  const role   = req.nextUrl.searchParams.get('role');
  const q      = req.nextUrl.searchParams.get('q');

  let query = supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role, account_status, created_at, last_login_at')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('account_status', status as 'pending' | 'approved' | 'suspended');
  if (role)   query = query.eq('role', role as 'student' | 'teacher' | 'administrator');
  if (q)      query = query.ilike('full_name', `%${q}%`);

  const { data, error } = await query.limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
