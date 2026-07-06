import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { XP_SESSION_COMPLETE } from '@/lib/gamification';

type Params = { params: Promise<{ sessionId: string }> };

/**
 * PATCH /api/study-sessions/[sessionId] — mark a session finished.
 * Sets ended_at + total_time_seconds and awards the session-complete XP
 * bonus. Idempotent: a session that already has ended_at is left alone,
 * so double-submits can't double-award.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const totalTimeSeconds = Math.max(0, Math.min(Number(body?.total_time_seconds) || 0, 60 * 60 * 6));

  const { data: session } = await supabase
    .from('study_sessions')
    .select('id, ended_at')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  if (session.ended_at) return NextResponse.json({ data: session, xpAwarded: 0 });

  const { data, error } = await supabase
    .from('study_sessions')
    .update({ ended_at: new Date().toISOString(), total_time_seconds: totalTimeSeconds })
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from('xp_events').insert({
    user_id: user.id,
    amount: XP_SESSION_COMPLETE,
    reason: 'session_complete',
    metadata: { session_id: sessionId },
  });

  return NextResponse.json({ data, xpAwarded: XP_SESSION_COMPLETE });
}
