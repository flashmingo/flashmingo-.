import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ userId: string }> };

const VALID_ROLES = ['student', 'teacher', 'administrator'] as const;
const VALID_STATUSES = ['pending', 'approved', 'suspended'] as const;

export async function PATCH(req: NextRequest, { params }: Params) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: admin } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (admin?.role !== 'administrator')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (userId === user.id)
    return NextResponse.json({ error: 'Cannot modify your own account' }, { status: 400 });

  const body = await req.json();
  const allowed: {
    account_status?: 'pending' | 'approved' | 'suspended';
    role?: 'student' | 'teacher' | 'administrator';
  } = {};

  // Runtime enum validation — TypeScript types are erased at runtime
  if (body.account_status !== undefined) {
    if (!VALID_STATUSES.includes(body.account_status))
      return NextResponse.json({ error: 'Invalid account_status' }, { status: 400 });
    allowed.account_status = body.account_status;
  }
  if (body.role !== undefined) {
    if (!VALID_ROLES.includes(body.role))
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    allowed.role = body.role;

    // Assigning a role is an explicit act of vetting — auto-approve in
    // the same request so an admin never has to click "approve" as a
    // separate step. Doesn't override an explicit account_status also
    // sent in this same request (e.g. setting role + suspending at once).
    if (body.account_status === undefined) {
      allowed.account_status = 'approved';
    }
  }

  if (Object.keys(allowed).length === 0)
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });

  const { data, error } = await supabase
    .from('profiles').update(allowed).eq('id', userId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit log every admin action on a user. When a role assignment
  // auto-approved the account, log both facts in one entry.
  const actionParts: string[] = [];
  if (allowed.role) actionParts.push(`role_changed_to_${allowed.role}`);
  if (allowed.account_status) actionParts.push(`status_changed_to_${allowed.account_status}`);
  const actionType = `user_${actionParts.join('_and_')}`;

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action_type: actionType,
    resource_type: 'profile',
    resource_id: userId,
  });

  return NextResponse.json({ data });
}

/**
 * DELETE /api/admin/users/[userId]
 * FERPA compliance: permanently delete a student's data on request.
 * Deletes all user data in order (FK constraints), then the auth user.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: admin } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (admin?.role !== 'administrator')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (userId === user.id)
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });

  // Delete in FK-safe order
  await supabase.from('user_card_progress').delete().eq('user_id', userId);
  await supabase.from('study_sessions').delete().eq('user_id', userId);
  await supabase.from('student_classroom_memberships').delete().eq('student_id', userId);

  // Delete decks owned by user (cascades to flashcards, deck_tags, classroom_deck_shares)
  const { data: userDecks } = await supabase.from('decks').select('id').eq('owner_id', userId);
  if (userDecks && userDecks.length > 0) {
    const deckIds = userDecks.map((d) => d.id);
    await supabase.from('classroom_deck_shares').delete().in('deck_id', deckIds);
    await supabase.from('deck_tags').delete().in('deck_id', deckIds);
    await supabase.from('flashcards').delete().in('deck_id', deckIds);
    await supabase.from('decks').delete().eq('owner_id', userId);
  }

  // Delete profile
  await supabase.from('profiles').delete().eq('id', userId);

  // Audit log the deletion
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action_type: 'user_data_deleted',
    resource_type: 'profile',
    resource_id: userId,
  });

  return NextResponse.json({ success: true });
}
