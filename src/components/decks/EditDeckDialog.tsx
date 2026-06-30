'use client';

import { useState, useEffect } from 'react';
import { Globe, Lock } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { useUpdateDeck } from '@/features/decks/hooks';
import type { Deck } from '@/lib/types';

interface Props {
  deck: Deck;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDeckDialog({ deck, open, onOpenChange }: Props) {
  const [name, setName] = useState(deck.name);
  const [description, setDescription] = useState(deck.description ?? '');
  const [isPublic, setIsPublic] = useState(deck.is_public);
  const { mutate, isPending, error } = useUpdateDeck(deck.id);

  useEffect(() => {
    setName(deck.name);
    setDescription(deck.description ?? '');
    setIsPublic(deck.is_public);
  }, [deck]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    mutate(
      { name: name.trim(), description: description.trim() || undefined, is_public: isPublic },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit deck</DialogTitle>
          <DialogDescription>Update the name, description, or visibility of this deck.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="edit-deck-name">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="edit-deck-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="edit-deck-desc">
              Description
            </label>
            <Textarea
              id="edit-deck-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>

          {/* Visibility toggle */}
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

          {error && <p className="text-sm text-destructive">{error.message}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending} disabled={!name.trim()}>
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
