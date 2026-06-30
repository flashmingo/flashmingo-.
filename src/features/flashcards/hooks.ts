'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Flashcard } from '@/lib/types';

// ─── Query keys ──────────────────────────────────────────────
export const cardKeys = {
  all: ['flashcards'] as const,
  byDeck: (deckId: string) => [...cardKeys.all, 'deck', deckId] as const,
};

// ─── API helpers ─────────────────────────────────────────────
async function fetchCards(deckId: string): Promise<Flashcard[]> {
  const res = await fetch(`/api/decks/${deckId}/flashcards`);
  if (!res.ok) throw new Error('Failed to fetch cards');
  const json = await res.json();
  return json.data ?? [];
}

async function createCard(
  deckId: string,
  payload: { front_text: string; back_text: string; sort_order?: number }
): Promise<Flashcard> {
  const res = await fetch(`/api/decks/${deckId}/flashcards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Failed to create card');
  }
  const json = await res.json();
  return json.data;
}

async function updateCard(
  cardId: string,
  payload: { front_text?: string; back_text?: string }
): Promise<Flashcard> {
  const res = await fetch(`/api/cards/${cardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Failed to update card');
  }
  const json = await res.json();
  return json.data;
}

async function deleteCard(cardId: string): Promise<void> {
  const res = await fetch(`/api/cards/${cardId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete card');
}

// ─── Hooks ───────────────────────────────────────────────────
export function useFlashcards(deckId: string) {
  return useQuery({
    queryKey: cardKeys.byDeck(deckId),
    queryFn: () => fetchCards(deckId),
    enabled: !!deckId,
  });
}

export function useCreateCard(deckId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { front_text: string; back_text: string }) =>
      createCard(deckId, payload),
    onSuccess: (newCard) => {
      qc.setQueryData<Flashcard[]>(cardKeys.byDeck(deckId), (old = []) => [...old, newCard]);
      // Invalidate deck to refresh card_count
      qc.invalidateQueries({ queryKey: ['decks'] });
    },
  });
}

export function useUpdateCard(deckId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, payload }: { cardId: string; payload: { front_text?: string; back_text?: string } }) =>
      updateCard(cardId, payload),
    onSuccess: (updated) => {
      qc.setQueryData<Flashcard[]>(cardKeys.byDeck(deckId), (old = []) =>
        old.map((c) => (c.id === updated.id ? updated : c))
      );
    },
  });
}

export function useDeleteCard(deckId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCard,
    onSuccess: (_, cardId) => {
      qc.setQueryData<Flashcard[]>(cardKeys.byDeck(deckId), (old = []) =>
        old.filter((c) => c.id !== cardId)
      );
      qc.invalidateQueries({ queryKey: ['decks'] });
    },
  });
}
