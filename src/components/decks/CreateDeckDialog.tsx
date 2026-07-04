'use client';

import { useState } from 'react';
import { containsProfanity } from '@/lib/profanity';
import { Plus, Globe, Lock } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogTrigger,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { useCreateDeck } from '@/features/decks/hooks';

export function CreateDeckDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { mutate, isPending, error } = useCreateDeck();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (!name.trim()) return;
    // Client-side profanity check
    if (containsProfanity(name) || containsProfanity(description)) {
      setLocalError('Please avoid profanity in deck name or description.');
      return;
    }
    mutate(
      { name: name.trim(), description: description.trim() || undefined, is_public: isPublic },
      {
        onSuccess: () => {
          setOpen(false);
          setName('');
          setDescription('');
          setIsPublic(false);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Deck
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new deck</DialogTitle>
          <DialogDescription>Give your flashcard deck a name and optional description.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="deck-name">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="deck-name"
              placeholder="e.g. Chapter 5 — Photosynthesis"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-right">{name.length}/100</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="deck-desc">
              Description
            </label>
            <Textarea
              id="deck-desc"
              placeholder="What is this deck about? (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>

          {/* Visibility */}
          <div className="rounded-lg border border-border p-4 space-y-3">
            <Switch
              label={isPublic ? 'Public' : 'Private'}
              description={
                isPublic
                  ? 'Anyone in your district can view and study this deck'
                  : 'Only you can see this deck'
              }
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {isPublic
                ? <><Globe className="h-3.5 w-3.5 text-green-500" /> Visible to your district</>
                : <><Lock className="h-3.5 w-3.5" /> Only visible to you</>
              }
            </div>
          </div>

          {localError && <p className="text-sm text-destructive">{localError}</p>}
          {error && <p className="text-sm text-destructive">{error.message}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending} disabled={!name.trim()}>
              Create deck
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
