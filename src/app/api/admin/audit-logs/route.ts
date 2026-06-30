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

  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '50');

  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, action_type, resource_type, resource_id, timestamp, user_id')
    .order('timestamp', { ascending: false })
    .limit(Math.min(limit, 200));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
