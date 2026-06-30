'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Deck } from '@/lib/types';

// ─── Query keys ──────────────────────────────────────────────
export const deckKeys = {
  all: ['decks'] as const,
  lists: () => [...deckKeys.all, 'list'] as const,
  detail: (id: string) => [...deckKeys.all, 'detail', id] as const,
};

// ─── API helpers ─────────────────────────────────────────────
async function fetchDecks(): Promise<Deck[]> {
  const res = await fetch('/api/decks');
  if (!res.ok) throw new Error('Failed to fetch decks');
  const json = await res.json();
  return json.data ?? [];
}

async function fetchDeck(id: string): Promise<Deck> {
  const res = await fetch(`/api/decks/${id}`);
  if (!res.ok) throw new Error('Failed to fetch deck');
  const json = await res.json();
  return json.data;
}

async function createDeck(payload: { name: string; description?: string; is_public?: boolean }): Promise<Deck> {
  const res = await fetch('/api/decks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Failed to create deck');
  }
  const json = await res.json();
  return json.data;
}

async function updateDeck(id: string, payload: { name?: string; description?: string; is_public?: boolean }): Promise<Deck> {
  const res = await fetch(`/api/decks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Failed to update deck');
  }
  const json = await res.json();
  return json.data;
}

async function deleteDeck(id: string): Promise<void> {
  const res = await fetch(`/api/decks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete deck');
}

// ─── Hooks ───────────────────────────────────────────────────
export function useDecks() {
  return useQuery({ queryKey: deckKeys.lists(), queryFn: fetchDecks });
}

export function useDeck(id: string) {
  return useQuery({ queryKey: deckKeys.detail(id), queryFn: () => fetchDeck(id), enabled: !!id });
}

export function useCreateDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDeck,
    onSuccess: (newDeck) => {
      qc.setQueryData<Deck[]>(deckKeys.lists(), (old = []) => [newDeck, ...old]);
    },
  });
}

export function useUpdateDeck(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name?: string; description?: string; is_public?: boolean }) =>
      updateDeck(id, payload),
    onSuccess: (updated) => {
      qc.setQueryData<Deck[]>(deckKeys.lists(), (old = []) =>
        old.map((d) => (d.id === updated.id ? updated : d))
      );
      qc.setQueryData(deckKeys.detail(id), updated);
    },
  });
}

export function useDeleteDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDeck,
    onSuccess: (_, id) => {
      qc.setQueryData<Deck[]>(deckKeys.lists(), (old = []) => old.filter((d) => d.id !== id));
      qc.removeQueries({ queryKey: deckKeys.detail(id) });
    },
  });
}
