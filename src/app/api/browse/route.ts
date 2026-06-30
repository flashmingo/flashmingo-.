import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  const sort = request.nextUrl.searchParams.get('sort') ?? 'updated';

  // Get caller's district
  const { data: profile } = await supabase
    .from('profiles')
    .select('district_id')
    .eq('id', user.id)
    .single();

  // Build base query — no profiles join (avoids RLS complications)
  let query = supabase
    .from('decks')
    .select('id, name, description, card_count, updated_at, owner_id')
    .eq('is_public', true)
    .neq('owner_id', user.id);

  if (q.length >= 2) {
    query = query.ilike('name', `%${q}%`);
  }

  if (sort === 'cards') {
    query = query.order('card_count', { ascending: false });
  } else {
    query = query.order('updated_at', { ascending: false });
  }

  const { data: decks, error } = await query.limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!decks || decks.length === 0) return NextResponse.json({ data: [] });

  // If user has a district, fetch owner profiles and filter to same district
  // If no district (dev/test), show all public decks
  if (profile?.district_id) {
    const ownerIds = [...new Set(decks.map((d) => d.owner_id))];
    const { data: owners } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, district_id')
      .in('id', ownerIds)
      .eq('district_id', profile.district_id);

    const ownerMap = new Map((owners ?? []).map((o) => [o.id, o]));
    const filtered = decks
      .filter((d) => ownerMap.has(d.owner_id))
      .map((d) => ({ ...d, profiles: ownerMap.get(d.owner_id) }));

    return NextResponse.json({ data: filtered });
  }

  // No district — fetch owner names and return all public decks
  const ownerIds = [...new Set(decks.map((d) => d.owner_id))];
  const { data: owners } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', ownerIds);

  const ownerMap = new Map((owners ?? []).map((o) => [o.id, o]));
  const result = decks.map((d) => ({ ...d, profiles: ownerMap.get(d.owner_id) ?? null }));

  return NextResponse.json({ data: result });
}
