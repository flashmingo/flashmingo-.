'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  /** Require the user to type this word before confirm enables (e.g. "DELETE"). */
  typeToConfirm?: string;
  loading?: boolean;
  onConfirm: () => void;
}

/**
 * Destructive-action confirmation dialog. Replaces window.confirm for
 * dangerous operations: warning icon, explanation, optional type-to-confirm
 * gate, and a loading state on the confirm button.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  typeToConfirm,
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');
  const gateOpen = !typeToConfirm || typed === typeToConfirm;

  const handleOpenChange = (next: boolean) => {
    if (loading) return; // don't dismiss mid-flight
    if (!next) setTyped('');
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </span>
            <div className="min-w-0 pt-0.5">
              <h2 className="text-[15.5px] font-semibold text-foreground">{title}</h2>
              <div className="mt-1.5 text-[13.5px] leading-[1.6] text-muted-foreground">
                {description}
              </div>
            </div>
          </div>

          {typeToConfirm && (
            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-muted-foreground">
                Type <span className="font-mono font-semibold text-foreground">{typeToConfirm}</span> to confirm
              </label>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                disabled={loading}
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 font-mono text-sm text-foreground transition-shadow focus:border-red-300 focus:outline-none focus:ring-4 focus:ring-red-500/10"
                aria-label={`Type ${typeToConfirm} to confirm`}
              />
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-1">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={!gateOpen || loading}
              className={cn('min-w-[110px]', !gateOpen && 'opacity-50')}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Working…
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
