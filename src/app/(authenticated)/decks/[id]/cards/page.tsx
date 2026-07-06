'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Plus, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { MathText } from '@/components/ui/MathText';
import type { Flashcard, Deck } from '@/lib/types';

export default function DeckCardsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: deckId } = use(params);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [deckRes, cardsRes] = await Promise.all([
          fetch(`/api/decks/${deckId}`),
          fetch(`/api/decks/${deckId}/flashcards`),
        ]);
        const deckData = await deckRes.json();
        const cardsData = await cardsRes.json();
        setDeck(deckData.data ?? null);
        setCards(cardsData.data ?? []);
      } catch {
        setError('Failed to load deck');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [deckId]);

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const front = frontText.trim();
    const back = backText.trim();
    if (!front || !back) {
      setError('Both front and back text are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/decks/${deckId}/flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ front_text: front, back_text: back, sort_order: cards.length }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to add card');
      setCards((prev) => [...prev, data.data]);
      setFrontText('');
      setBackText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add card');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/decks">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {deck?.name ?? 'Deck'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {cards.length} card{cards.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="ml-auto">
          <Button asChild>
            <Link href={`/study?deck=${deckId}`}>Study Now</Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Add Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Card</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCard} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="front" className="text-sm font-medium">
                  Front <span className="text-destructive">*</span>
                </label>
                <Input
                  id="front"
                  placeholder="Question or term…"
                  value={frontText}
                  onChange={(e) => setFrontText(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="back" className="text-sm font-medium">
                  Back <span className="text-destructive">*</span>
                </label>
                <Input
                  id="back"
                  placeholder="Answer or definition…"
                  value={backText}
                  onChange={(e) => setBackText(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              <Plus className="h-4 w-4" />
              Add Card
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Cards list */}
      {cards.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No cards yet. Add your first card above.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {cards.map((card, i) => (
            <Card key={card.id}>
              <CardContent className="py-4 grid grid-cols-2 gap-6">
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Front
                  </p>
                  <p className="text-sm text-foreground"><MathText>{card.front_text}</MathText></p>
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Back
                  </p>
                  <p className="text-sm text-foreground"><MathText>{card.back_text}</MathText></p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
