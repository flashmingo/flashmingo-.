'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Pencil, Trash2, BookOpen, Globe, Lock } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EditDeckDialog } from './EditDeckDialog';
import { useDeleteDeck, useUpdateDeck } from '@/features/decks/hooks';
import { cn } from '@/lib/utils';
import type { Deck } from '@/lib/types';

interface Props {
  deck: Deck;
}

export function DeckCard({ deck }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const { mutate: deleteDeck, isPending: isDeleting } = useDeleteDeck();
  const { mutate: updateDeck, isPending: isToggling } = useUpdateDeck(deck.id);

  function handleDelete() {
    if (!confirm(`Delete "${deck.name}"? This will remove all cards.`)) return;
    deleteDeck(deck.id);
  }

  function handleToggleVisibility() {
    updateDeck({ is_public: !deck.is_public });
  }

  return (
    <>
      <Card className="group relative flex flex-col hover:shadow-md transition-shadow">
        <CardContent className="flex-1 pt-5">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/decks/${deck.id}`} className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {deck.name}
              </h3>
              {deck.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {deck.description}
                </p>
              )}
            </Link>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  className={cn(
                    'shrink-0 rounded-md p-1 text-muted-foreground',
                    'hover:text-foreground hover:bg-muted transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-ring',
                    'opacity-0 group-hover:opacity-100 focus:opacity-100'
                  )}
                  aria-label="Deck options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-50 min-w-[160px] rounded-lg border border-border bg-background p-1 shadow-lg"
                  align="end"
                >
                  <DropdownMenu.Item
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-muted focus:bg-muted outline-none"
                    onSelect={() => setEditOpen(true)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-muted focus:bg-muted outline-none"
                    onSelect={handleToggleVisibility}
                    disabled={isToggling}
                  >
                    {deck.is_public
                      ? <><Lock className="h-3.5 w-3.5" /> Make private</>
                      : <><Globe className="h-3.5 w-3.5" /> Make public</>
                    }
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="my-1 h-px bg-border" />
                  <DropdownMenu.Item
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 outline-none"
                    onSelect={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </CardContent>

        <CardFooter className="pt-0 pb-4 px-5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{deck.card_count} {deck.card_count === 1 ? 'card' : 'cards'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {deck.is_public ? (
              <Badge variant="success" className="text-xs flex items-center gap-1">
                <Globe className="h-3 w-3" /> Public
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Lock className="h-3 w-3" /> Private
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>

      <EditDeckDialog deck={deck} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
