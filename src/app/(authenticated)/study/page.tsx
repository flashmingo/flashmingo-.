'use client';

import { use, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, CheckCircle2, Eye, ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { calculateSM2, formatInterval } from '@/lib/sm2';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import type { Flashcard, UserCardProgress } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────
interface StudyCard extends Flashcard { progress: UserCardProgress | null; }

// ─── API ──────────────────────────────────────────────────────
async function fetchDueCards(deckId: string): Promise<StudyCard[]> {
  const [cardsRes, progressRes] = await Promise.all([
    fetch(`/api/decks/${deckId}/flashcards`),
    fetch(`/api/decks/${deckId}/cards/due`),
  ]);
  const { data: cards = [] } = await cardsRes.json();
  const { data: progress = [] } = await progressRes.json();
  const progressMap = new Map<string, UserCardProgress>(
    progress.map((p: UserCardProgress) => [p.flashcard_id, p])
  );
  return cards.map((card: Flashcard) => ({ ...card, progress: progressMap.get(card.id) ?? null }));
}

async function createSession(deckId: string): Promise<string> {
  const res = await fetch('/api/study-sessions', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deck_id: deckId }),
  });
  return (await res.json()).data?.id ?? null;
}

async function submitReview(payload: {
  cardId: string; quality: number;
  new_state: { ease_factor: number; interval_days: number; repetitions: number };
  next_review_at: string; session_id: string | null;
}) {
  await fetch(`/api/cards/${payload.cardId}/review`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quality: payload.quality, new_state: payload.new_state,
      next_review_at: payload.next_review_at, session_id: payload.session_id,
    }),
  });
}

// ─── Rating config ────────────────────────────────────────────
const RATINGS = [
  { quality: 0, label: 'Again',  sub: '1d',  variant: 'answer-again' as const },
  { quality: 2, label: 'Hard',   sub: '2d',  variant: 'answer-hard'  as const },
  { quality: 3, label: 'Good',   sub: '4d',  variant: 'answer-good'  as const },
  { quality: 5, label: 'Easy',   sub: '7d',  variant: 'answer-easy'  as const },
] as const;

// ─── Wrapper ──────────────────────────────────────────────────
function StudyShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col bg-background">
      {children}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function StudyPage({ searchParams }: { searchParams: Promise<{ deck?: string }> }) {
  const { deck: deckId } = use(searchParams);

  const [sessionId, setSessionId]     = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped]         = useState(false);
  const [results, setResults]         = useState<{ quality: number; cardId: string }[]>([]);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [done, setDone]               = useState(false);

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['study-cards', deckId],
    queryFn: () => fetchDueCards(deckId!),
    enabled: !!deckId,
  });

  const reviewMutation = useMutation({ mutationFn: submitReview });

  const startSession = useCallback(async () => {
    if (!deckId) return;
    const id = await createSession(deckId);
    setSessionId(id);
    setSessionStarted(true);
    setCurrentIndex(0); setFlipped(false); setResults([]); setDone(false);
  }, [deckId]);

  const handleRate = useCallback((quality: number) => {
    const card = cards[currentIndex];
    if (!card) return;
    const state = {
      ease_factor:   card.progress?.ease_factor   ?? 2.5,
      interval_days: card.progress?.interval_days ?? 0,
      repetitions:   card.progress?.repetitions   ?? 0,
    };
    const review = calculateSM2(state, quality);
    const newResults = [...results, { quality, cardId: card.id }];
    setResults(newResults);
    reviewMutation.mutate({
      cardId: card.id, quality,
      new_state: review.new_state,
      next_review_at: review.next_review_date.toISOString(),
      session_id: sessionId,
    });
    if (currentIndex + 1 >= cards.length) { setDone(true); }
    else { setCurrentIndex((i) => i + 1); setFlipped(false); }
  }, [cards, currentIndex, results, sessionId, reviewMutation]);

  // ── No deck ──────────────────────────────────────────────────
  if (!deckId) {
    return (
      <StudyShell>
        <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center">
          <p className="text-muted-foreground text-sm">Select a deck to start a study session.</p>
          <Button asChild size="lg"><Link href="/decks">Browse decks</Link></Button>
        </div>
      </StudyShell>
    );
  }

  // ── Loading ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <StudyShell>
        <div className="flex flex-col items-center justify-center flex-1 gap-6 p-8">
          <Skeleton className="h-64 w-full max-w-2xl rounded-2xl" />
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-28 rounded-xl" />)}
          </div>
        </div>
      </StudyShell>
    );
  }

  // ── No cards ──────────────────────────────────────────────────
  if (cards.length === 0) {
    return (
      <StudyShell>
        <div className="p-6">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/decks"><ArrowLeft className="h-4 w-4 mr-1.5" />Back to decks</Link>
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center">
          <p className="text-sm font-semibold text-foreground">This deck has no cards yet.</p>
          <Button asChild variant="outline" size="sm">
            <Link href={`/decks/${deckId}`}>Add cards</Link>
          </Button>
        </div>
      </StudyShell>
    );
  }

  // ── Pre-session ───────────────────────────────────────────────
  if (!sessionStarted) {
    return (
      <StudyShell>
        <div className="p-6">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/decks"><ArrowLeft className="h-4 w-4 mr-1.5" />Back to decks</Link>
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 gap-8 px-8 text-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Ready to study?</h2>
            <p className="text-sm text-muted-foreground">{cards.length} cards in this session</p>
          </div>
          <div className="flex items-center gap-10">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground tabular-nums">{cards.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Cards</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">SM-2</p>
              <p className="text-xs text-muted-foreground mt-1">Algorithm</p>
            </div>
          </div>
          <Button size="xl" onClick={startSession} className="px-12">
            Start session
          </Button>
        </div>
      </StudyShell>
    );
  }

  // ── Session complete ──────────────────────────────────────────
  if (done) {
    const correct = results.filter((r) => r.quality >= 3).length;
    const pct = Math.round((correct / results.length) * 100);
    return (
      <StudyShell>
        <div className="flex flex-col items-center justify-center flex-1 gap-8 px-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-teal-500" />
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Session complete</h2>
            <p className="text-sm text-muted-foreground">
              You reviewed {results.length} card{results.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-10">
            <div className="text-center">
              <p className={cn('text-3xl font-bold tabular-nums', pct >= 70 ? 'text-teal-600' : 'text-orange-500')}>{pct}%</p>
              <p className="text-xs text-muted-foreground mt-1">Accuracy</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground tabular-nums">{correct}</p>
              <p className="text-xs text-muted-foreground mt-1">Correct</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground tabular-nums">{results.length - correct}</p>
              <p className="text-xs text-muted-foreground mt-1">Missed</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={startSession} size="lg">
              <RotateCcw className="h-4 w-4" /> Study again
            </Button>
            <Button asChild size="lg"><Link href="/decks">Back to decks</Link></Button>
          </div>
        </div>
      </StudyShell>
    );
  }

  // ── Active study ──────────────────────────────────────────────
  const card = cards[currentIndex];
  const progressPct = Math.round((currentIndex / cards.length) * 100);

  return (
    <StudyShell>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-white">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/decks"><ArrowLeft className="h-4 w-4 mr-1.5" />End session</Link>
        </Button>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="w-48 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        <div className="w-24" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-6 max-w-2xl mx-auto w-full">

        {/* Flashcard */}
        <div
          className={cn(
            'w-full rounded-2xl border bg-white transition-all duration-200 cursor-pointer select-none',
            'min-h-[260px] flex flex-col',
            flipped
              ? 'border-blue-200 shadow-flashcard'
              : 'border-border shadow-md hover:shadow-lg hover:border-slate-300'
          )}
          onClick={() => setFlipped((f) => !f)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === ' ' && setFlipped((f) => !f)}
          aria-label={flipped ? 'Showing answer — click to flip' : 'Click to reveal answer'}
        >
          {/* Card header */}
          <div className={cn(
            'px-5 py-3 border-b flex items-center justify-between',
            flipped ? 'border-blue-100 bg-blue-50/50' : 'border-border bg-muted/20'
          )}>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {flipped ? 'Answer' : 'Question'}
            </span>
            {!flipped && (
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Eye className="h-3 w-3" /> Click to reveal
              </span>
            )}
          </div>

          {/* Card body */}
          <div className="flex-1 flex items-center justify-center px-10 py-8">
            <p className={cn(
              'text-center leading-relaxed whitespace-pre-wrap text-foreground',
              card.front_text.length > 120 ? 'text-base' : 'text-xl font-medium'
            )}>
              {flipped ? card.back_text : card.front_text}
            </p>
          </div>
        </div>

        {/* Answer buttons */}
        {flipped ? (
          <div className="w-full space-y-2">
            <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              How well did you recall this?
            </p>
            <div className="grid grid-cols-4 gap-2">
              {RATINGS.map(({ quality, label, variant }) => {
                const review = calculateSM2(
                  {
                    ease_factor:   card.progress?.ease_factor   ?? 2.5,
                    interval_days: card.progress?.interval_days ?? 0,
                    repetitions:   card.progress?.repetitions   ?? 0,
                  },
                  quality
                );
                const interval = formatInterval(review.new_state.interval_days);
                return (
                  <button
                    key={quality}
                    onClick={() => handleRate(quality)}
                    className={cn(
                      'flex flex-col items-center gap-0.5 rounded-xl border py-3.5 px-2',
                      'text-sm font-semibold transition-all duration-150',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      'active:scale-[0.97]',
                      variant === 'answer-again' && 'border-red-200    bg-white text-red-600    hover:bg-red-50    hover:border-red-300',
                      variant === 'answer-hard'  && 'border-orange-200 bg-white text-orange-600 hover:bg-orange-50 hover:border-orange-300',
                      variant === 'answer-good'  && 'border-blue-200   bg-white text-blue-600   hover:bg-blue-50   hover:border-blue-300',
                      variant === 'answer-easy'  && 'border-teal-300   bg-white text-teal-700   hover:bg-teal-50   hover:border-teal-400',
                    )}
                  >
                    <span className="text-[13px] font-semibold">{label}</span>
                    <span className="text-[11px] opacity-60 font-normal">{interval}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setFlipped(true)}
            variant="outline"
            size="xl"
            className="px-12"
          >
            Show answer
          </Button>
        )}
      </div>
    </StudyShell>
  );
}
