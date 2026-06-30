import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/leaderboard
 * Returns top 20 users (who opted in) ranked by cards reviewed in the last 30 days.
 * Scoped to the caller's district if they have one.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get caller's district
  const { data: profile } = await supabase
    .from('profiles')
    .select('district_id, leaderboard_opt_in')
    .eq('id', user.id)
    .single();

  // Fetch opted-in users in the same district (or all if no district)
  let profileQuery = supabase
    .from('profiles')
    .select('id, full_name, avatar_url, district_id')
    .eq('leaderboard_opt_in', true)
    .eq('account_status', 'approved');

  if (profile?.district_id) {
    profileQuery = profileQuery.eq('district_id', profile.district_id);
  }

  const { data: eligibleUsers } = await profileQuery;
  if (!eligibleUsers || eligibleUsers.length === 0) {
    return NextResponse.json({ data: [], myRank: null });
  }

  const userIds = eligibleUsers.map((u) => u.id);

  // Get cards reviewed in last 30 days per user
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data: sessions } = await supabase
    .from('study_sessions')
    .select('user_id, cards_reviewed')
    .in('user_id', userIds)
    .gte('started_at', since.toISOString());

  // Aggregate
  const totals: Record<string, number> = {};
  userIds.forEach((id) => { totals[id] = 0; });
  (sessions ?? []).forEach((s) => {
    if (s.user_id) totals[s.user_id] = (totals[s.user_id] ?? 0) + (s.cards_reviewed ?? 0);
  });

  // Rank
  const ranked = eligibleUsers
    .map((u) => ({ ...u, cardsReviewed: totals[u.id] ?? 0 }))
    .sort((a, b) => b.cardsReviewed - a.cardsReviewed)
    .slice(0, 20)
    .map((u, i) => ({ ...u, rank: i + 1 }));

  const myRank = ranked.find((u) => u.id === user.id)?.rank ?? null;
  const isOptedIn = profile?.leaderboard_opt_in ?? false;

  return NextResponse.json({ data: ranked, myRank, isOptedIn });
}

/**
 * PATCH /api/leaderboard
 * Toggle the current user's leaderboard_opt_in preference.
 */
export async function PATCH() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('leaderboard_opt_in')
    .eq('id', user.id)
    .single();

  const newValue = !(profile?.leaderboard_opt_in ?? false);

  const { error } = await supabase
    .from('profiles')
    .update({ leaderboard_opt_in: newValue })
    .eq('id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { leaderboard_opt_in: newValue } });
}
