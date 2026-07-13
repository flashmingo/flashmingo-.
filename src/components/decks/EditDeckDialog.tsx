'use client';

import { useState, useEffect } from 'react';
import { Globe, Lock, Clock, CheckCircle2, XCircle } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { useUpdateDeck } from '@/features/decks/hooks';
import { useAuth } from '@/hooks/useAuth';
import type { Deck } from '@/lib/types';

interface Props {
  deck: Deck;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PublishStatus = 'private' | 'pending' | 'approved' | 'rejected';

export function EditDeckDialog({ deck, open, onOpenChange }: Props) {
  const { profile } = useAuth();
  const selfApprover = profile?.role === 'teacher' || profile?.role === 'administrator';

  const status = (deck.publish_status ?? (deck.is_public ? 'approved' : 'private')) as PublishStatus;

  const [name, setName] = useState(deck.name);
  const [description, setDescription] = useState(deck.description ?? '');
  const [wantPublic, setWantPublic] = useState(deck.is_public);
  const { mutate, isPending, error } = useUpdateDeck(deck.id);

  useEffect(() => {
    setName(deck.name);
    setDescription(deck.description ?? '');
    setWantPublic(deck.is_public);
  }, [deck]);

  const pending = status === 'pending';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    mutate(
      { name: name.trim(), description: description.trim() || undefined, is_public: wantPublic },
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

          {/* Visibility */}
          <div className="space-y-3 rounded-lg border border-border p-4">
            {pending ? (
              // A request is already in flight — no toggle, just status.
              <div className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">Publish request pending</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    A teacher or administrator will review this deck before it appears in Browse.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Switch
                  label={
                    wantPublic
                      ? (selfApprover ? 'Public' : 'Request to publish')
                      : 'Private'
                  }
                  description={
                    wantPublic
                      ? (selfApprover
                          ? 'Anyone in your district can view and study this deck'
                          : 'Sends this deck for teacher/admin review before it goes public')
                      : 'Only you can see this deck'
                  }
                  checked={wantPublic}
                  onCheckedChange={setWantPublic}
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {status === 'approved' && deck.is_public ? (
                    <><Globe className="h-3.5 w-3.5 text-green-500" /> Currently public</>
                  ) : status === 'rejected' ? (
                    <><XCircle className="h-3.5 w-3.5 text-red-400" /> A previous request was declined — you can request again</>
                  ) : wantPublic && !selfApprover ? (
                    <><CheckCircle2 className="h-3.5 w-3.5 text-[#1E40AF]" /> Will be submitted for review</>
                  ) : (
                    <><Lock className="h-3.5 w-3.5" /> Only visible to you</>
                  )}
                </div>
              </>
            )}
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
