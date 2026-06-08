import { supabaseServer } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';
import { Deck } from '@/lib/types';

/**
 * GET /api/decks - List user's decks
 */
export async function GET(request: NextRequest) {
  try {
    const { data: { session } } = await supabaseServer.auth.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's own decks
    const { data: decks, error } = await supabaseServer
      .from('decks')
      .select('*')
      .eq('owner_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      data: decks as Deck[],
    });
  } catch (error) {
    console.error('Fetch decks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch decks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/decks - Create a new deck
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

    const { name, description, is_public } = await request.json();

    // Validate
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Deck name is required' },
        { status: 400 }
      );
    }

    if (name.length > 255) {
      return NextResponse.json(
        { error: 'Deck name must be less than 255 characters' },
        { status: 400 }
      );
    }

    // Create deck
    const { data: deck, error } = await supabaseServer
      .from('decks')
      .insert({
        owner_id: session.user.id,
        name: name.trim(),
        description: description?.trim() || null,
        is_public: Boolean(is_public),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log audit
    await supabaseServer.from('audit_logs').insert({
      user_id: session.user.id,
      action_type: 'deck_created',
      resource_type: 'deck',
      resource_id: deck.id,
      details: { name },
    });

    return NextResponse.json(
      { data: deck as Deck },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create deck error:', error);
    return NextResponse.json(
      { error: 'Failed to create deck' },
      { status: 500 }
    );
  }
}
