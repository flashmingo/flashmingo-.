'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Loader from '@/components/ui/Loader';
import { Deck } from '@/lib/types';

export default function DecksPage() {
  const { user, isLoading: userLoading } = useUser();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && user) {
      fetchDecks();
    }
  }, [user, userLoading]);

  const fetchDecks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/decks');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch decks');
      }

      setDecks(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (deckId: string) => {
    if (!confirm('Are you sure you want to delete this deck? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete deck');
      }

      setDecks(decks.filter(d => d.id !== deckId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete deck');
    }
  };

  if (userLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">My Decks</h1>
          <p className="mt-2 text-gray-600">Create and manage your flashcard decks</p>
        </div>
        <Link href="/decks/create">
          <Button variant="primary">Create Deck</Button>
        </Link>
      </div>

      {/* Error Alert */}
      {error && <Alert type="error">{error}</Alert>}

      {/* Empty State */}
      {decks.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No decks yet. Create your first deck to get started!</p>
            <Link href="/decks/create">
              <Button variant="primary">Create Your First Deck</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {decks.map(deck => (
            <Card key={deck.id}>
              <div className="space-y-4">
                <div>
                  <h3 className="font-display font-semibold text-lg text-gray-900">{deck.name}</h3>
                  {deck.description && (
                    <p className="text-sm text-gray-600 mt-1">{deck.description}</p>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  Created {new Date(deck.created_at).toLocaleDateString()}
                  {deck.is_public && ' • Public'}
                </div>

                <div className="flex gap-2">
                  <Link href={`/decks/${deck.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/decks/${deck.id}/cards`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      Cards
                    </Button>
                  </Link>
                  <Link href={`/study?deck=${deck.id}`} className="flex-1">
                    <Button variant="primary" size="sm" className="w-full">
                      Study
                    </Button>
                  </Link>
                  <button
                    onClick={() => handleDelete(deck.id)}
                    className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
