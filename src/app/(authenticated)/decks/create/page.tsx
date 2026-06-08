'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Loader from '@/components/ui/Loader';

export default function CreateDeckPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Deck name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          is_public: isPublic,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create deck');
      }

      const data = await response.json();
      router.push(`/decks/${data.data.id}/cards`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create deck');
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Create New Deck</h1>
        <p className="mt-2 text-gray-600">Start by naming your deck</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <Alert type="error">{error}</Alert>}

          <Input
            id="name"
            label="Deck Name"
            type="text"
            placeholder="e.g., Spanish Vocabulary"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            hint="Give your deck a clear, descriptive name"
          />

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-sakura-500 focus:outline-none focus:ring-1 focus:ring-sakura-500"
              placeholder="What is this deck about? (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={4}
            />
            <p className="mt-1 text-xs text-gray-500">Optional: Add a description to help remember what this deck covers</p>
          </div>

          <Checkbox
            id="isPublic"
            label="Make this deck public (anyone can view)"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            disabled={isLoading}
          />

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Create Deck
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
