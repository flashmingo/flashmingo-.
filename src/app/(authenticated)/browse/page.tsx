'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, Search, BookOpen, GraduationCap, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/lib/utils';

interface PublicDeck {
  id: string;
  name: string;
  description: string | null;
  card_count: number;
  updated_at: string;
  owner_id: string;
  profiles: { full_name: string | null; avatar_url: string | null; district_id: string | null }
    | { full_name: string | null; avatar_url: string | null; district_id: string | null }[];
}

function getAuthor(deck: PublicDeck): string {
  const p = Array.isArray(deck.profiles) ? deck.profiles[0] : deck.profiles;
  return p?.full_name ?? 'Unknown';
}

export default function BrowsePage() {
  const [decks, setDecks] = useState<PublicDeck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'updated' | 'cards'>('updated');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams({ sort });
    if (debouncedQuery.length >= 2) params.set('q', debouncedQuery);

    fetch(`/api/browse?${params}`)
      .then((r) => r.json())
      .then(({ data }) => setDecks(data ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [debouncedQuery, sort]);

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Browse Decks
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Public decks shared by teachers and students in your district
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search public decks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground mx-1" />
          <button
            onClick={() => setSort('updated')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              sort === 'updated' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setSort('cards')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              sort === 'cards' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Most cards
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && decks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Globe className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No public decks yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            {query
              ? `No decks match "${query}"`
              : 'Be the first to share a deck with your district. Open any deck and set it to Public.'}
          </p>
          <Button asChild variant="outline">
            <Link href="/decks">Go to My Decks</Link>
          </Button>
        </div>
      )}

      {/* Deck grid */}
      {!isLoading && decks.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground">{decks.length} deck{decks.length !== 1 ? 's' : ''} available</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
              <Card key={deck.id} className="group flex flex-col hover:shadow-md transition-shadow">
                <CardContent className="flex-1 pt-5">
                  <Link href={`/browse/${deck.id}`} className="block">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {deck.name}
                    </h3>
                    {deck.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {deck.description}
                      </p>
                    )}
                  </Link>
                  <p className="mt-2 text-xs text-muted-foreground">
                    by {getAuthor(deck)} · {formatDate(deck.updated_at)}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 pb-4 px-5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{deck.card_count} cards</span>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/study?deck=${deck.id}`}>
                      <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
                      Study
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
