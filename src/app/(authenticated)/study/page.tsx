'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Loader from '@/components/ui/Loader';
import { Flashcard, UserCardProgress, Deck } from '@/lib/types';
import { calculateSM2, initializeSM2, SM2State } from '@/lib/sm2';

interface StudyCard {
  flashcard: Flashcard;
  progress: UserCardProgress;
  isFlipped: boolean;
}

export default function StudyPage() {
  const { user, isLoading: userLoading } = useUser();
  const searchParams = useSearchParams();
  const deckId = searchParams.get('deck');

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<StudyCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [stats, setStats] = useState({ reviewed: 0, correct: 0 });

  // Load deck and cards
  useEffect(() => {
    if (!userLoading && user && deckId) {
      loadDeck();
    }
  }, [user, userLoading, deckId]);

  const loadDeck = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch deck
      const deckRes = await fetch(`/api/decks/${deckId}`);
      if (!deckRes.ok) throw new Error('Failed to load deck');
      const deckData = await deckRes.json();
      setDeck(deckData.data);

      // Fetch flashcards due for review
      const cardsRes = await fetch(`/api/decks/${deckId}/cards/due`);
      if (!cardsRes.ok) throw new Error('Failed to load cards');
      const cardsData = await cardsRes.json();

      const studyCards: StudyCard[] = cardsData.data.map((item: any) => ({
        flashcard: item.flashcard,
        progress: item.progress,
        isFlipped: false,
      }));

      setCards(studyCards);

      if (studyCards.length === 0) {
        setError('No cards due for review');
      }

      // Create study session
      const sessionRes = await fetch('/api/study-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deck_id: deckId }),
      });
      const sessionData = await sessionRes.json();
      setSessionId(sessionData.data?.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deck');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = useCallback(
    async (quality: number) => {
      if (!cards[currentIndex] || !sessionId) return;

      const card = cards[currentIndex];
      const currentState = card.progress as SM2State;

      // Calculate SM-2
      const result = calculateSM2(currentState, quality);

      try {
        // Update progress
        const response = await fetch(`/api/cards/${card.flashcard.id}/review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quality,
            new_state: result.new_state,
            next_review_at: result.next_review_date,
            session_id: sessionId,
          }),
        });

        if (!response.ok) throw new Error('Failed to save review');

        // Update stats
        setStats(prev => ({
          reviewed: prev.reviewed + 1,
          correct: prev.correct + (quality >= 3 ? 1 : 0),
        }));

        // Move to next card
        if (currentIndex + 1 < cards.length) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setSessionComplete(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save review');
      }
    },
    [cards, currentIndex, sessionId]
  );

  if (userLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader />
      </div>
    );
  }

  if (!deck || cards.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-bold text-gray-900">Study</h1>
        {error && <Alert type="error">{error}</Alert>}
        {!error && (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No cards available to study right now.</p>
              <a href="/decks" className="text-sakura-600 hover:underline mt-4">
                Back to decks
              </a>
            </div>
          </Card>
        )}
      </div>
    );
  }

  if (sessionComplete) {
    const accuracy = stats.reviewed > 0 ? Math.round((stats.correct / stats.reviewed) * 100) : 0;
    return (
      <div className="space-y-6 max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-gray-900">Study Session Complete!</h1>
        <Card>
          <div className="text-center py-12 space-y-4">
            <div className="text-4xl font-bold text-sakura-600">{accuracy}%</div>
            <p className="text-gray-600">{stats.correct} of {stats.reviewed} cards correct</p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="primary"
                onClick={() => window.location.href = '/decks'}
              >
                Back to Decks
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setCurrentIndex(0);
                  setSessionComplete(false);
                  setStats({ reviewed: 0, correct: 0 });
                  loadDeck();
                }}
              >
                Study Again
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = (currentIndex / cards.length) * 100;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-gray-900">
          {deck?.name}
        </h1>
        <p className="text-gray-600">
          Card {currentIndex + 1} of {cards.length}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-sakura-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Flashcard */}
      <Card>
        <div className="min-h-64 flex flex-col items-center justify-center space-y-6">
          <div className="text-center">
            {!currentCard.isFlipped ? (
              <>
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-4">Front</p>
                <p className="text-2xl font-semibold text-gray-900">{currentCard.flashcard.front_text}</p>
                {currentCard.flashcard.front_image_url && (
                  <img
                    src={currentCard.flashcard.front_image_url}
                    alt="Front"
                    className="max-h-32 mt-4 mx-auto"
                  />
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-4">Back</p>
                <p className="text-2xl font-semibold text-gray-900">{currentCard.flashcard.back_text}</p>
                {currentCard.flashcard.back_image_url && (
                  <img
                    src={currentCard.flashcard.back_image_url}
                    alt="Back"
                    className="max-h-32 mt-4 mx-auto"
                  />
                )}
              </>
            )}
          </div>

          {!currentCard.isFlipped ? (
            <Button
              variant="primary"
              onClick={() => {
                const newCards = [...cards];
                newCards[currentIndex].isFlipped = true;
                setCards(newCards);
              }}
            >
              Reveal Answer
            </Button>
          ) : (
            <div className="space-y-3 w-full">
              <p className="text-sm text-gray-600 text-center">How did you do?</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleReview(0)}
                >
                  Again
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleReview(3)}
                >
                  Good
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleReview(5)}
                >
                  Easy
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Stats */}
      <Card>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-gray-600 text-sm">Reviewed</p>
            <p className="text-2xl font-bold text-gray-900">{stats.reviewed}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Correct</p>
            <p className="text-2xl font-bold text-green-600">{stats.correct}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Accuracy</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.reviewed > 0 ? Math.round((stats.correct / stats.reviewed) * 100) : 0}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
