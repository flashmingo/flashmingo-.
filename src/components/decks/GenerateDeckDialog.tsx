'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, BookOpen } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { useCreateDeck } from '@/features/decks/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { cardKeys } from '@/features/flashcards/hooks';
import { deckKeys } from '@/features/decks/hooks';

interface GeneratedCard {
  front: string;
  back: string;
  sort_order: number;
}

interface GeneratedDeck {
  deck_name: string;
  deck_description: string;
  cards: GeneratedCard[];
}

type Step = 'describe' | 'preview' | 'saving';

export function GenerateDeckDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('describe');
  const [description, setDescription] = useState('');
  const [cardCount, setCardCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedDeck | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: createDeck } = useCreateDeck();
  const queryClient = useQueryClient();
  const router = useRouter();

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      setStep('describe');
      setDescription('');
      setGenerated(null);
      setError(null);
      setCardCount(10);
    }, 200);
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/generate-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim(), card_count: cardCount }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Generation failed');
      setGenerated(json.data);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (!generated) return;
    setStep('saving');

    try {
      // 1. Create the deck
      const deck = await createDeck({
        name: generated.deck_name,
        description: generated.deck_description,
      });

      // 2. Bulk create cards
      for (const card of generated.cards) {
        await fetch(`/api/decks/${deck.id}/flashcards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            front_text: card.front,
            back_text: card.back,
            sort_order: card.sort_order,
          }),
        });
      }

      // 3. Invalidate queries so deck list and cards refresh
      await queryClient.invalidateQueries({ queryKey: deckKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: cardKeys.byDeck(deck.id) });

      handleClose();
      router.push(`/decks/${deck.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save deck');
      setStep('preview');
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Sparkles className="h-4 w-4 mr-2 text-primary" />
        Generate with AI
      </Button>

      <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          {/* ── Step 1: Describe ── */}
          {step === 'describe' && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Generate a deck with AI
                </DialogTitle>
                <DialogDescription>
                  Describe what you&apos;re studying and AI will build a complete flashcard deck for you.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleGenerate} className="flex flex-col gap-5 mt-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    What are you studying?
                  </label>
                  <Textarea
                    placeholder="e.g. The causes and effects of World War I, including the major alliances, key battles, and the Treaty of Versailles..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={1000}
                    rows={5}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {description.length}/1000 — be specific for better cards
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Number of cards</label>
                  <div className="flex gap-2">
                    {[5, 10, 15, 20, 30].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setCardCount(n)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                          cardCount === n
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-border hover:bg-muted'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                  <Button type="submit" isLoading={isGenerating} disabled={!description.trim()}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Generating…' : 'Generate deck'}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}

          {/* ── Step 2: Preview ── */}
          {step === 'preview' && generated && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <DialogTitle>{generated.deck_name}</DialogTitle>
                    {generated.deck_description && (
                      <DialogDescription className="mt-1">{generated.deck_description}</DialogDescription>
                    )}
                  </div>
                  <Badge variant="secondary">{generated.cards.length} cards</Badge>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto mt-2 space-y-2 pr-1">
                {generated.cards.map((card, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Front</p>
                      <p className="text-sm text-foreground">{card.front}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Back</p>
                      <p className="text-sm text-foreground">{card.back}</p>
                    </div>
                  </div>
                ))}
              </div>

              {error && <p className="text-sm text-destructive mt-2">{error}</p>}

              <DialogFooter className="mt-4 border-t border-border pt-4">
                <Button variant="outline" onClick={() => setStep('describe')}>
                  Regenerate
                </Button>
                <Button onClick={handleSave}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Save deck
                </Button>
              </DialogFooter>
            </>
          )}

          {/* ── Step 3: Saving ── */}
          {step === 'saving' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">Saving your deck…</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
