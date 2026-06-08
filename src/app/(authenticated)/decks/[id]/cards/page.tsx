'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Loader from '@/components/ui/Loader';
import { Flashcard, Deck } from '@/lib/types';

export default function DeckCardsPage() {
  const router = useRouter();
  const params = useParams();
  const deckId = params.id as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state for new card
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDeck();
  }, [deckId]);

  const loadDeck = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/decks/${deckId}`);
      const data = await response.json();
      setDeck(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deck');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!frontText.trim() || !backText.trim()) {
      setError('Both front and back text are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/decks/${deckId}/flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          front_text: frontText.trim(),
          back_text: backText.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create flashcard');
      }

      const data = await response.json();
      setCards([...cards, data.data]);
      setFrontText('');
      setBackText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create flashcard');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="space-y-6">
        <Alert type="error">Deck not found</Alert>
        <Button onClick={() => router.push('/decks')}>Back to Decks</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">{deck.name}</h1>
        <p className="mt-2 text-gray-600">{cards.length} card{cards.length !== 1 ? 's' : ''}</p>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Add Card Form */}
      <Card>
        <h2 className="font-display font-semibold text-lg text-gray-900 mb-4">Add Card</h2>
        <form onSubmit={handleAddCard} className="space-y-4">
          <Input
            id="front"
            label="Front (Question)"
            type="text"
            placeholder="e.g., What is the capital of France?"
            value={frontText}
            onChange={(e) => setFrontText(e.target.value)}
            disabled={isSubmitting}
          />

          <Input
            id="back"
            label="Back (Answer)"
            type="text"
            placeholder="e.g., Paris"
            value={backText}
            onChange={(e) => setBackText(e.target.value)}
            disabled={isSubmitting}
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Add Card
          </Button>
        </form>
      </Card>

      {/* Cards List */}
      {cards.length > 0 ? (
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-lg text-gray-900">Cards</h2>
          {cards.map((card) => (
            <Card key={card.id}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Front</p>
                  <p className="font-semibold text-gray-900">{card.front_text}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Back</p>
                  <p className="font-semibold text-gray-900">{card.back_text}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8 text-gray-500">
            <p>No cards yet. Add your first card above!</p>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={() => router.push(`/study?deck=${deckId}`)} variant="primary">
          Start Studying
        </Button>
        <Button onClick={() => router.push('/decks')} variant="secondary">
          Back to Decks
        </Button>
      </div>
    </div>
  );
}
