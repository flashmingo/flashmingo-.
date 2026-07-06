import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserStudyStats } from '@/lib/stats';

/**
 * GET /api/stats
 * Returns the current user's study stats:
 * - streak (consecutive days with at least one study session)
 * - total sessions
 * - total cards reviewed
 * - sessions in last 30 days (for sparkline)
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await getUserStudyStats(supabase, user.id);
  return NextResponse.json({ data });
}
