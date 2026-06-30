'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import type { Flashcard } from '@/lib/types';

interface CreateProps {
  mode: 'create';
  deckId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { front_text: string; back_text: string }) => void;
  isPending: boolean;
  error?: Error | null;
}

interface EditProps {
  mode: 'edit';
  card: Flashcard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { front_text: string; back_text: string }) => void;
  isPending: boolean;
  error?: Error | null;
}

type Props = CreateProps | EditProps;

export function CardDialog(props: Props) {
  const isEdit = props.mode === 'edit';
  const [front, setFront] = useState(isEdit ? props.card.front_text : '');
  const [back, setBack] = useState(isEdit ? props.card.back_text : '');

  useEffect(() => {
    if (isEdit) {
      setFront(props.card.front_text);
      setBack(props.card.back_text);
    }
  }, [isEdit, isEdit && props.card]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    props.onSubmit({ front_text: front.trim(), back_text: back.trim() });
    if (!isEdit) {
      setFront('');
      setBack('');
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit card' : 'Add a card'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the front and back of this flashcard.' : 'Enter the front (question) and back (answer) for your new card.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="card-front">
              Front <span className="text-muted-foreground font-normal">(question / term)</span>
            </label>
            <Textarea
              id="card-front"
              placeholder="e.g. What is photosynthesis?"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              maxLength={2000}
              rows={3}
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-right">{front.length}/2000</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="card-back">
              Back <span className="text-muted-foreground font-normal">(answer / definition)</span>
            </label>
            <Textarea
              id="card-back"
              placeholder="e.g. The process by which plants convert sunlight into glucose…"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              maxLength={2000}
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">{back.length}/2000</p>
          </div>

          {props.error && <p className="text-sm text-destructive">{props.error.message}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={props.isPending}
              disabled={!front.trim() || !back.trim()}
            >
              {isEdit ? 'Save changes' : 'Add card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
