import { supabaseServer } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';
import { Deck } from '@/lib/types';

/**
 * GET /api/decks/[id] - Get a specific deck
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: { session } } = await supabaseServer.auth.getSession();
    const deckId = params.id;

    if (!deckId) {
      return NextResponse.json(
        { error: 'Deck ID is required' },
        { status: 400 }
      );
    }

    // Get deck
    const { data: deck, error } = await supabaseServer
      .from('decks')
      .select('*')
      .eq('id', deckId)
      .single();

    if (error || !deck) {
      return NextResponse.json(
        { error: 'Deck not found' },
        { status: 404 }
      );
    }

    // Check access (owner can view, public decks viewable by all)
    if (!session?.user && !deck.is_public) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session?.user && deck.owner_id !== session.user.id && !deck.is_public) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      data: deck as Deck,
    });
  } catch (error) {
    console.error('Fetch deck error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deck' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/decks/[id] - Update a deck
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: { session } } = await supabaseServer.auth.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const deckId = params.id;
    const { name, description, is_public } = await request.json();

    if (!deckId) {
      return NextResponse.json(
        { error: 'Deck ID is required' },
        { status: 400 }
      );
    }

    // Get deck to check ownership
    const { data: deck } = await supabaseServer
      .from('decks')
      .select('owner_id')
      .eq('id', deckId)
      .single();

    if (!deck) {
      return NextResponse.json(
        { error: 'Deck not found' },
        { status: 404 }
      );
    }

    if (deck.owner_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate
    if (name && name.length > 255) {
      return NextResponse.json(
        { error: 'Deck name must be less than 255 characters' },
        { status: 400 }
      );
    }

    // Update
    const { data: updated, error } = await supabaseServer
      .from('decks')
      .update({
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(is_public !== undefined && { is_public: Boolean(is_public) }),
      })
      .eq('id', deckId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log audit
    await supabaseServer.from('audit_logs').insert({
      user_id: session.user.id,
      action_type: 'deck_updated',
      resource_type: 'deck',
      resource_id: deckId,
    });

    return NextResponse.json({
      data: updated as Deck,
    });
  } catch (error) {
    console.error('Update deck error:', error);
    return NextResponse.json(
      { error: 'Failed to update deck' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/decks/[id] - Delete a deck
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: { session } } = await supabaseServer.auth.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const deckId = params.id;

    if (!deckId) {
      return NextResponse.json(
        { error: 'Deck ID is required' },
        { status: 400 }
      );
    }

    // Get deck to check ownership
    const { data: deck } = await supabaseServer
      .from('decks')
      .select('owner_id')
      .eq('id', deckId)
      .single();

    if (!deck) {
      return NextResponse.json(
        { error: 'Deck not found' },
        { status: 404 }
      );
    }

    if (deck.owner_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete deck (cascade will delete flashcards)
    const { error } = await supabaseServer
      .from('decks')
      .delete()
      .eq('id', deckId);

    if (error) {
      throw error;
    }

    // Log audit
    await supabaseServer.from('audit_logs').insert({
      user_id: session.user.id,
      action_type: 'deck_deleted',
      resource_type: 'deck',
      resource_id: deckId,
    });

    return NextResponse.json(
      { message: 'Deck deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete deck error:', error);
    return NextResponse.json(
      { error: 'Failed to delete deck' },
      { status: 500 }
    );
  }
}
