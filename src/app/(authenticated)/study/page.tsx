'use client';

import { use, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, CheckCircle2, RefreshCw } from 'lucide-react';
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
  { quality: 0, label: 'Again', chip: 'border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2] hover:border-[#FCA5A5]' },
  { quality: 2, label: 'Hard',  chip: 'border-[#FED7AA] text-[#EA580C] hover:bg-[#FFF7ED] hover:border-[#FDBA74]' },
  { quality: 3, label: 'Good',  chip: 'border-[#BFDBFE] text-[#2563EB] hover:bg-[#EFF6FF] hover:border-[#93C5FD]' },
] as const;

// ─── Faded notebook-grid backdrop ─────────────────────────────
function GridBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(27,26,24,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(27,26,24,0.04) 1px, transparent 1px)',
        backgroundSize: '27px 27px',
        WebkitMaskImage: 'radial-gradient(100% 90% at 50% 30%, #000 30%, transparent 80%)',
        maskImage: 'radial-gradient(100% 90% at 50% 30%, #000 30%, transparent 80%)',
      }}
    />
  );
}

// ─── Wrapper ──────────────────────────────────────────────────
function StudyShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full flex-col bg-background">
      <GridBackdrop />
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
        <div className="relative flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-sm text-muted-foreground">Select a deck to start a study session.</p>
          <Button asChild size="lg"><Link href="/decks">Browse decks</Link></Button>
        </div>
      </StudyShell>
    );
  }

  // ── Loading ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <StudyShell>
        <div className="relative flex flex-1 flex-col items-center justify-center gap-6 p-8">
          <Skeleton className="h-64 w-full max-w-2xl rounded-[20px]" />
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
        <div className="relative p-6">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/decks"><ArrowLeft className="h-4 w-4 mr-1.5" />Back to decks</Link>
          </Button>
        </div>
        <div className="relative flex flex-1 flex-col items-center justify-center gap-4 text-center">
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
        <div className="relative p-6">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/decks"><ArrowLeft className="h-4 w-4 mr-1.5" />Back to decks</Link>
          </Button>
        </div>
        <div className="relative flex flex-1 flex-col items-center justify-center gap-8 px-8 pb-12 text-center">
          <div>
            <h2 className="mb-1.5 font-display text-[30px] font-extrabold tracking-[-0.03em] text-foreground">Ready to study?</h2>
            <p className="text-sm text-muted-foreground">{cards.length} cards in this session</p>
          </div>
          <div className="flex items-center gap-10">
            <div className="text-center">
              <p className="font-display text-[32px] font-extrabold tabular-nums text-foreground">{cards.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Cards</p>
            </div>
            <div className="h-10 w-px bg-input" />
            <div className="text-center">
              <p className="font-display text-[32px] font-extrabold text-foreground">SM-2</p>
              <p className="mt-1 text-xs text-muted-foreground">Algorithm</p>
            </div>
          </div>
          <button
            onClick={startSession}
            className="inline-flex h-12 items-center rounded-[11px] bg-primary px-12 text-[15px] font-medium text-white shadow-[0_16px_40px_-18px_rgba(37,99,235,0.5)] transition-colors hover:bg-blue-700"
          >
            Start session
          </button>
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
        <div className="relative flex flex-1 flex-col items-center justify-center gap-8 px-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-[#D7EEE9]">
            <CheckCircle2 className="h-[30px] w-[30px] text-[#0D9488]" />
          </div>
          <div>
            <h2 className="mb-1.5 font-display text-[30px] font-extrabold tracking-[-0.03em] text-foreground">Session complete</h2>
            <p className="text-sm text-muted-foreground">
              You reviewed {results.length} card{results.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-10">
            <div className="text-center">
              <p className={cn('font-display text-[32px] font-extrabold tabular-nums', pct >= 70 ? 'text-[#0D9488]' : 'text-[#EA580C]')}>{pct}%</p>
              <p className="mt-1 text-xs text-muted-foreground">Accuracy</p>
            </div>
            <div className="h-10 w-px bg-input" />
            <div className="text-center">
              <p className="font-display text-[32px] font-extrabold tabular-nums text-foreground">{correct}</p>
              <p className="mt-1 text-xs text-muted-foreground">Correct</p>
            </div>
            <div className="h-10 w-px bg-input" />
            <div className="text-center">
              <p className="font-display text-[32px] font-extrabold tabular-nums text-foreground">{results.length - correct}</p>
              <p className="mt-1 text-xs text-muted-foreground">Missed</p>
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
      <div className="relative flex items-center justify-between border-b border-border bg-background/85 px-6 py-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/decks"><ArrowLeft className="h-4 w-4 mr-1.5" />End session</Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="hidden h-1.5 w-48 overflow-hidden rounded-full bg-[#F1ECE2] sm:block">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
        <div className="w-24" />
      </div>

      {/* Main content */}
      <div className="relative mx-auto flex w-full max-w-[640px] flex-1 flex-col items-center justify-center gap-7 px-6 py-8">
        {/* Flashcard with deck-stack */}
        <div className="relative w-full">
          <div className="absolute left-4 right-[-16px] top-3.5 bottom-[-14px] rounded-[20px] border border-border bg-[#F1ECE2]" />
          <div className="absolute left-2 right-[-8px] top-[7px] bottom-[-7px] rounded-[20px] border border-[#EDE7DB] bg-background shadow-[0_8px_20px_-12px_rgba(27,26,24,0.15)]" />

          <div
            onClick={() => setFlipped((f) => !f)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === ' ' && setFlipped((f) => !f)}
            aria-label={flipped ? 'Showing answer — click to flip' : 'Click to reveal answer'}
            className="relative cursor-pointer select-none [perspective:1400px]"
          >
            <div className={cn(
              'relative h-[300px] w-full transition-transform duration-500 [transform-style:preserve-3d]',
              flipped && '[transform:rotateY(180deg)]',
            )}>
              {/* Front */}
              <div className="absolute inset-0 flex flex-col rounded-[20px] border border-border bg-white p-[22px] shadow-[0_20px_40px_-18px_rgba(27,26,24,0.28)] [backface-visibility:hidden]">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[#FBEFD8] px-[9px] py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#B45309]">Question</span>
                  <span className="text-xs font-medium text-[#A39E93]">{currentIndex + 1} of {cards.length}</span>
                </div>
                <div className="flex flex-1 items-center justify-center px-3 py-4">
                  <p className={cn(
                    'text-balance text-center font-display font-bold leading-[1.3] text-foreground whitespace-pre-wrap',
                    card.front_text.length > 120 ? 'text-[17px]' : 'text-[23px]',
                  )}>
                    {card.front_text}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#A39E93]">
                  <RefreshCw className="h-[13px] w-[13px]" /> Click to reveal the answer
                </div>
              </div>

              {/* Back (navy) */}
              <div className="absolute inset-0 flex flex-col rounded-[20px] border border-[#1E3A8A] bg-[#1E3A8A] p-[22px] text-white shadow-[0_20px_40px_-18px_rgba(30,58,138,0.45)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#FBBF24]">Answer</span>
                <div className="flex flex-1 items-center justify-center px-3 py-4">
                  <p className="text-balance text-center font-display text-[19px] font-semibold leading-[1.45] text-white whitespace-pre-wrap">
                    {card.back_text}
                  </p>
                </div>
                <div className="text-center text-xs text-[#C7D2FE]">How well did you recall this?</div>
              </div>
            </div>
          </div>
        </div>

        {/* Answer buttons / show answer */}
        {flipped ? (
          <div className="grid w-full grid-cols-4 gap-2.5">
            {RATINGS.map(({ quality, label, chip }) => {
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
                    'flex flex-col items-center gap-0.5 rounded-[10px] border bg-white px-2 py-3 transition-all duration-150',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]',
                    chip,
                  )}
                >
                  <span className="text-[13px] font-semibold">{label}</span>
                  <span className="text-[11px] font-normal opacity-60">{interval}</span>
                </button>
              );
            })}
            {/* Easy — solid teal */}
            {(() => {
              const review = calculateSM2(
                {
                  ease_factor:   card.progress?.ease_factor   ?? 2.5,
                  interval_days: card.progress?.interval_days ?? 0,
                  repetitions:   card.progress?.repetitions   ?? 0,
                },
                5
              );
              const interval = formatInterval(review.new_state.interval_days);
              return (
                <button
                  onClick={() => handleRate(5)}
                  className="flex flex-col items-center gap-0.5 rounded-[10px] bg-[#0D9488] px-2 py-3 text-white transition-all duration-150 hover:bg-[#0F766E] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
                >
                  <span className="text-[13px] font-semibold">Easy</span>
                  <span className="text-[11px] font-normal opacity-75">{interval}</span>
                </button>
              );
            })()}
          </div>
        ) : (
          <button
            onClick={() => setFlipped(true)}
            className="inline-flex h-[46px] items-center rounded-[11px] border border-input bg-white px-12 text-[15px] font-medium text-foreground transition-colors hover:bg-[#F4F0E8]"
          >
            Show answer
          </button>
        )}
      </div>
    </StudyShell>
  );
}
