import { supabaseServer } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/study-sessions - Create a study session
 */
export async function POST(request: NextRequest) {
  try {
    const { data: { session } } = await supabaseServer.auth.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { deck_id } = await request.json();

    const { data: studySession, error } = await supabaseServer
      .from('study_sessions')
      .insert({
        user_id: session.user.id,
        deck_id,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { data: studySession },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create study session error:', error);
    return NextResponse.json(
      { error: 'Failed to create study session' },
      { status: 500 }
    );
  }
}
