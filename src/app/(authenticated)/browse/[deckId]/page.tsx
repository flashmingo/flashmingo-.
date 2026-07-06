'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, BookOpen, GraduationCap, Eye, EyeOff,
  User, Calendar, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { MathText } from '@/components/ui/MathText';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface BrowseDeck {
  id: string;
  name: string;
  description: string | null;
  card_count: number;
  updated_at: string;
  owner_id: string;
  owner: { id: string; full_name: string | null; avatar_url: string | null } | null;
  cards: Array<{ id: string; front: string; back: string; created_at: string }>;
}

function CardRow({ card, index }: { card: BrowseDeck['cards'][number]; index: number }) {
  const [showBack, setShowBack] = useState(false);
  return (
    <div className="border-b border-border last:border-0 px-4 py-3 group">
      <div className="flex items-start gap-3">
        <span className="shrink-0 mt-0.5 text-xs font-mono text-muted-foreground/50 w-6 text-right">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm text-foreground"><MathText>{card.front}</MathText></p>
          {showBack && (
            <p className="text-sm text-muted-foreground border-t border-border pt-1 mt-1">
              <MathText>{card.back}</MathText>
            </p>
          )}
        </div>
        <button
          onClick={() => setShowBack((s) => !s)}
          className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          {showBack ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showBack ? 'Hide' : 'Reveal'}
        </button>
      </div>
    </div>
  );
}

export default function BrowseDeckPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = use(params);
  const [allRevealed, setAllRevealed] = useState(false);
  const [previewCount, setPreviewCount] = useState(10);

  const { data, isLoading, error } = useQuery<BrowseDeck>({
    queryKey: ['browse-deck', deckId],
    queryFn: async () => {
      const res = await fetch(`/api/browse/${deckId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load deck');
      return json.data;
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-6 max-w-3xl">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 py-24 text-center">
        <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-semibold text-foreground mb-1">Deck not found</p>
        <p className="text-sm text-muted-foreground mb-4">
          This deck may have been made private or deleted.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/browse">← Back to Browse</Link>
        </Button>
      </div>
    );
  }

  const ownerInitials = (data.owner?.full_name ?? 'U')
    .split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  const visibleCards = data.cards.slice(0, previewCount);
  const hasMore = data.cards.length > previewCount;

  return (
    <div className="p-6 md:p-8 max-w-3xl space-y-6">
      {/* Back */}
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/browse"><ArrowLeft className="h-4 w-4 mr-1" />Browse</Link>
      </Button>

      {/* Header card */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground tracking-tight">{data.name}</h1>
            {data.description && (
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {data.description}
              </p>
            )}
          </div>
          <Button asChild size="sm">
            <Link href={`/study?deck=${data.id}`}>
              <GraduationCap className="h-4 w-4 mr-1.5" />
              Study this deck
            </Link>
          </Button>
        </div>

        {/* Meta row */}
        <div className="mt-4 flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{data.card_count} cards</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>Updated {formatDate(data.updated_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={data.owner?.avatar_url ?? undefined} />
              <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">
                {ownerInitials}
              </AvatarFallback>
            </Avatar>
            <span>{data.owner?.full_name ?? 'Unknown'}</span>
          </div>
          <Badge variant="muted" className="text-[10px]">Public</Badge>
        </div>
      </div>

      {/* Cards list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Cards
            <span className="ml-1.5 text-muted-foreground font-normal">({data.cards.length})</span>
          </h2>
          {data.cards.length > 0 && (
            <button
              onClick={() => setAllRevealed((s) => !s)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {allRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {allRevealed ? 'Hide all answers' : 'Reveal all answers'}
            </button>
          )}
        </div>

        {data.cards.length === 0 ? (
          <div className="rounded-xl border border-border bg-white py-10 text-center text-sm text-muted-foreground">
            This deck has no cards yet.
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
            {visibleCards.map((card, i) => (
              <RevealCardRow
                key={card.id}
                card={card}
                index={i}
                forceReveal={allRevealed}
              />
            ))}

            {/* Load more */}
            {hasMore && (
              <div className="px-4 py-3 border-t border-border bg-muted/20 text-center">
                <button
                  onClick={() => setPreviewCount((c) => c + 20)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Show {Math.min(20, data.cards.length - previewCount)} more cards
                  <ChevronDown className="inline h-3.5 w-3.5 ml-0.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* Separate component to manage its own reveal state (or obey forceReveal) */
function RevealCardRow({
  card, index, forceReveal,
}: {
  card: { id: string; front: string; back: string };
  index: number;
  forceReveal: boolean;
}) {
  const [localReveal, setLocalReveal] = useState(false);
  const showBack = forceReveal || localReveal;

  return (
    <div className="border-b border-border last:border-0 px-4 py-3 group">
      <div className="flex items-start gap-3">
        <span className="shrink-0 mt-0.5 text-xs font-mono text-muted-foreground/40 w-6 text-right select-none">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm text-foreground"><MathText>{card.front}</MathText></p>
          {showBack && (
            <p className="text-sm text-muted-foreground border-t border-dashed border-border pt-1.5 mt-1.5">
              <MathText>{card.back}</MathText>
            </p>
          )}
        </div>
        {!forceReveal && (
          <button
            onClick={() => setLocalReveal((s) => !s)}
            className={cn(
              'shrink-0 flex items-center gap-1 text-xs transition-colors',
              localReveal
                ? 'text-muted-foreground hover:text-foreground'
                : 'opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-foreground'
            )}
          >
            {localReveal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}
