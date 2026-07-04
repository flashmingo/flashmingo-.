'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, BookOpen, FileText, ArrowRight, Loader2 } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
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

interface SearchResults {
  decks: DeckResult[];
  cards: CardResult[];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ decks: [], cards: [] });
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const debouncedQuery = useDebounce(query, 250);

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQuery(''); setResults({ decks: [], cards: [] }); }
  }, [open]);

  // Search when query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults({ decks: [], cards: [] });
      return;
    }
    let cancelled = false;
    setIsSearching(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then(({ data }) => { if (!cancelled) setResults(data ?? { decks: [], cards: [] }); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsSearching(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const navigate = useCallback((href: string) => {
    setOpen(false);
    router.push(href);
  }, [router]);

  const hasResults = results.decks.length > 0 || results.cards.length > 0;
  const showEmpty = debouncedQuery.length >= 2 && !isSearching && !hasResults;

  function getDeckName(card: CardResult): string {
    const d = card.decks;
    if (Array.isArray(d)) return d[0]?.name ?? '';
    return d?.name ?? '';
  }

  function getDeckId(card: CardResult): string {
    const d = card.decks;
    if (Array.isArray(d)) return d[0]?.id ?? card.deck_id;
    return d?.id ?? card.deck_id;
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center gap-2 rounded-[9px] px-2.5 h-8',
          'border border-input bg-white text-[#A39E93] text-[13px]',
          'hover:bg-[#F4F0E8] hover:border-[#D3CBB8] transition-colors w-[260px] justify-between',
          'focus:outline-none focus:ring-2 focus:ring-ring'
        )}
        aria-label="Open search"
      >
        <span className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5" />
          <span>Search…</span>
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-px text-[10px] font-sans text-[#A39E93]">
          ⌘K
        </kbd>
      </button>

      {/* Palette dialog */}
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className={cn(
            'fixed left-1/2 top-[18%] z-50 w-full max-w-lg -translate-x-1/2',
            'bg-white rounded-2xl border border-border shadow-lg overflow-hidden',
            'data-[state=open]:animate-scale-in data-[state=closed]:animate-fade-out',
          )}>
            <DialogPrimitive.Title className="sr-only">Search</DialogPrimitive.Title>

            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              {isSearching
                ? <Loader2 className="h-4 w-4 text-muted-foreground shrink-0 animate-spin" />
                : <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              }
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search decks and cards…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-xs text-muted-foreground hover:text-foreground px-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {/* Initial state */}
              {!query && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Type to search your decks and flashcards
                </div>
              )}

              {/* Empty */}
              {showEmpty && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No results for &ldquo;{debouncedQuery}&rdquo;
                </div>
              )}

              {/* Deck results */}
              {results.decks.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Decks
                  </p>
                  {results.decks.map((deck) => (
                    <button
                      key={deck.id}
                      onClick={() => navigate(`/decks/${deck.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                    >
                      <BookOpen className="h-4 w-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{deck.name}</p>
                        {deck.description && (
                          <p className="text-xs text-muted-foreground truncate">{deck.description}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {deck.card_count} cards
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Card results */}
              {results.cards.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Cards
                  </p>
                  {results.cards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => navigate(`/decks/${getDeckId(card)}`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{card.front_text}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {card.back_text} · <span className="text-primary">{getDeckName(card)}</span>
                        </p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Footer */}
              {hasResults && (
                <div className="border-t border-border px-4 py-2 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/search?q=${encodeURIComponent(query)}`)}
                    className="text-xs text-primary hover:underline"
                  >
                    See all results →
                  </button>
                  <span className="text-[10px] text-muted-foreground">Esc to close</span>
                </div>
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
