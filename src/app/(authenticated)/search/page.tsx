'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, BookOpen, FileText, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';

interface DeckResult {
  id: string;
  name: string;
  description: string | null;
  card_count: number;
}

interface CardResult {
  id: string;
  deck_id: string;
  front_text: string;
  back_text: string;
  decks: { id: string; name: string } | { id: string; name: string }[];
}

function getDeckName(card: CardResult): string {
  const d = card.decks;
  return Array.isArray(d) ? (d[0]?.name ?? '') : (d?.name ?? '');
}

function getDeckId(card: CardResult): string {
  const d = card.decks;
  return Array.isArray(d) ? (d[0]?.id ?? card.deck_id) : (d?.id ?? card.deck_id);
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: initialQ = '' } = use(searchParams);
  const router = useRouter();

  const [query, setQuery] = useState(initialQ);
  const [decks, setDecks] = useState<DeckResult[]>([]);
  const [cards, setCards] = useState<CardResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  // Keep URL in sync
  useEffect(() => {
    if (debouncedQuery) {
      router.replace(`/search?q=${encodeURIComponent(debouncedQuery)}`, { scroll: false });
    }
  }, [debouncedQuery, router]);

  // Fetch results
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setDecks([]);
      setCards([]);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then(({ data }) => {
        if (!cancelled) {
          setDecks(data?.decks ?? []);
          setCards(data?.cards ?? []);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const hasResults = decks.length > 0 || cards.length > 0;
  const showEmpty = debouncedQuery.length >= 2 && !isLoading && !hasResults;

  return (
    <div className="p-6 md:p-8 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Search</h1>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          autoFocus
          placeholder="Search decks and flashcards…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 h-11 text-base"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      )}

      {/* Empty */}
      {showEmpty && (
        <div className="text-center py-16">
          <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground">No results for &ldquo;{debouncedQuery}&rdquo;</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
        </div>
      )}

      {/* Initial state */}
      {!query && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Search across all your decks and flashcards
        </div>
      )}

      {/* Results */}
      {!isLoading && hasResults && (
        <div className="space-y-6">
          {/* Decks */}
          {decks.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                Decks · {decks.length}
              </h2>
              {decks.map((deck) => (
                <Link key={deck.id} href={`/decks/${deck.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="py-4 px-5 flex items-center gap-4">
                      <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{deck.name}</p>
                        {deck.description && (
                          <p className="text-sm text-muted-foreground truncate">{deck.description}</p>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground shrink-0">
                        {deck.card_count} cards
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Cards */}
          {cards.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                Flashcards · {cards.length}
              </h2>
              {cards.map((card) => (
                <Link key={card.id} href={`/decks/${getDeckId(card)}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="py-4 px-5 flex items-start gap-4">
                      <div className="rounded-lg bg-muted p-2 shrink-0 mt-0.5">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0 grid sm:grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Front</p>
                          <p className="text-sm text-foreground line-clamp-2">{card.front_text}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Back</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{card.back_text}</p>
                        </div>
                      </div>
                      <span className="text-xs text-primary shrink-0 mt-0.5">{getDeckName(card)}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
