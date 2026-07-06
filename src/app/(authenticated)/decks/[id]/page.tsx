'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, BookOpen, GraduationCap } from 'lucide-react';
import { useDeck } from '@/features/decks/hooks';
import { useFlashcards, useCreateCard, useUpdateCard, useDeleteCard } from '@/features/flashcards/hooks';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { MathText } from '@/components/ui/MathText';
import { CardDialog } from '@/components/flashcards/CardDialog';
import type { Flashcard } from '@/lib/types';

export default function DeckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: deckId } = use(params);
  const { data: deck, isLoading: deckLoading } = useDeck(deckId);
  const { data: cards = [], isLoading: cardsLoading } = useFlashcards(deckId);

  const createCard = useCreateCard(deckId);
  const updateCard = useUpdateCard(deckId);
  const deleteCard = useDeleteCard(deckId);

  const [createOpen, setCreateOpen] = useState(false);
  const [editCard, setEditCard] = useState<Flashcard | null>(null);

  function handleDelete(card: Flashcard) {
    if (!confirm('Delete this card? This cannot be undone.')) return;
    deleteCard.mutate(card.id);
  }

  if (deckLoading || cardsLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-32" />
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Deck not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/decks">Back to decks</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button asChild variant="ghost" size="icon" className="mt-0.5 shrink-0">
          <Link href="/decks"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground truncate">{deck.name}</h1>
            {deck.is_public && <Badge variant="secondary">Public</Badge>}
          </div>
          {deck.description && (
            <p className="mt-1 text-sm text-muted-foreground">{deck.description}</p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            {deck.card_count} {deck.card_count === 1 ? 'card' : 'cards'}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {deck.card_count > 0 && (
            <Button asChild variant="outline">
              <Link href={`/study?deck=${deckId}`}>
                <GraduationCap className="h-4 w-4 mr-2" />
                Study
              </Link>
            </Button>
          )}
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Card
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {cards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No cards yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Add your first card to start building this deck.
          </p>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Card
          </Button>
        </div>
      )}

      {/* Card list */}
      {cards.length > 0 && (
        <div className="space-y-2">
          {cards.map((card, i) => (
            <Card key={card.id} className="group">
              <CardContent className="py-4 px-5">
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 text-xs font-mono text-muted-foreground w-5 shrink-0 select-none">
                    {i + 1}
                  </span>
                  <div className="grid sm:grid-cols-2 gap-4 flex-1 min-w-0">
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Front
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap"><MathText>{card.front_text}</MathText></p>
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Back
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap"><MathText>{card.back_text}</MathText></p>
                    </div>
                  </div>
                  {/* Actions — visible on hover */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => setEditCard(card)}
                      className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label="Edit card"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(card)}
                      className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label="Delete card"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create card dialog */}
      <CardDialog
        mode="create"
        deckId={deckId}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(data) =>
          createCard.mutate(data, { onSuccess: () => setCreateOpen(false) })
        }
        isPending={createCard.isPending}
        error={createCard.error}
      />

      {/* Edit card dialog */}
      {editCard && (
        <CardDialog
          mode="edit"
          card={editCard}
          open={!!editCard}
          onOpenChange={(open) => { if (!open) setEditCard(null); }}
          onSubmit={(data) =>
            updateCard.mutate(
              { cardId: editCard.id, payload: data },
              { onSuccess: () => setEditCard(null) }
            )
          }
          isPending={updateCard.isPending}
          error={updateCard.error}
        />
      )}
    </div>
  );
}
