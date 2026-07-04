'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search, BookOpen, Globe, Lock, MoreHorizontal,
  Pencil, Trash2, GraduationCap, SortAsc, SortDesc,
} from 'lucide-react';
import { useDecks, useDeleteDeck, useUpdateDeck } from '@/features/decks/hooks';
import { CreateDeckDialog } from '@/components/decks/CreateDeckDialog';
import { GenerateDeckDialog } from '@/components/decks/GenerateDeckDialog';
import { EditDeckDialog } from '@/components/decks/EditDeckDialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import type { Deck } from '@/lib/types';

type SortField = 'name' | 'card_count' | 'updated_at';
type SortDir   = 'asc' | 'desc';

function ColHeader({
  label, active, dir, onClick,
}: { label: string; active: boolean; dir: SortDir; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-colors select-none',
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
      {active && (dir === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
    </button>
  );
}

function RowActions({ deck }: { deck: Deck }) {
  const [editOpen, setEditOpen] = useState(false);
  const { mutate: deleteDeck, isPending: isDeleting } = useDeleteDeck();
  const { mutate: updateDeck, isPending: isToggling } = useUpdateDeck(deck.id);

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Deck options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 min-w-[160px] rounded-xl border border-border bg-white p-1.5 shadow-lg data-[state=open]:animate-scale-in"
            align="end"
          >
            <DropdownMenu.Item
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm cursor-pointer hover:bg-muted outline-none"
              onSelect={() => setEditOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" /> Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm cursor-pointer hover:bg-muted outline-none"
              onSelect={() => updateDeck({ is_public: !deck.is_public })}
              disabled={isToggling}
            >
              {deck.is_public
                ? <><Lock className="h-3.5 w-3.5 text-muted-foreground" /> Make private</>
                : <><Globe className="h-3.5 w-3.5 text-muted-foreground" /> Make public</>}
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link
                href={`/study?deck=${deck.id}`}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm cursor-pointer hover:bg-muted outline-none"
              >
                <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" /> Study
              </Link>
            </DropdownMenu.Item>
            <div className="my-1 h-px bg-border" />
            <DropdownMenu.Item
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm cursor-pointer text-red-600 hover:bg-red-50 outline-none"
              onSelect={() => { if (confirm(`Delete "${deck.name}"? This will remove all cards.`)) deleteDeck(deck.id); }}
              disabled={isDeleting}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <EditDeckDialog deck={deck} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}

export default function DecksPage() {
  const { data: decks = [], isLoading, error } = useDecks();
  const [search, setSearch]         = useState('');
  const [sortField, setSortField]   = useState<SortField>('updated_at');
  const [sortDir, setSortDir]       = useState<SortDir>('desc');
  const [visFilter, setVisFilter]   = useState<'all' | 'public' | 'private'>('all');

  function handleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  }

  const filtered = decks
    .filter((d) => {
      const q = search.toLowerCase();
      const matchSearch = d.name.toLowerCase().includes(q) || (d.description ?? '').toLowerCase().includes(q);
      const matchVis =
        visFilter === 'all' ||
        (visFilter === 'public' && d.is_public) ||
        (visFilter === 'private' && !d.is_public);
      return matchSearch && matchVis;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name')       cmp = a.name.localeCompare(b.name);
      if (sortField === 'card_count') cmp = a.card_count - b.card_count;
      if (sortField === 'updated_at') cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });

  return (
    <div className="flex max-w-[920px] flex-col gap-5 p-10">
      {/* Page header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#B45309]">Library</p>
          <h1 className="font-display text-[26px] font-extrabold tracking-[-0.03em] text-foreground">My Decks</h1>
        </div>
        <div className="flex items-center gap-2">
          <GenerateDeckDialog />
          <CreateDeckDialog />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-60">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A39E93]" />
          <Input
            placeholder="Search decks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center rounded-[10px] border border-input bg-white p-[3px] gap-0.5">
          {(['all', 'public', 'private'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVisFilter(v)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors capitalize',
                visFilter === v ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[13px] text-[#A39E93]">
          {decks.length} {decks.length === 1 ? 'deck' : 'decks'}
        </span>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-border last:border-0">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 flex-1 rounded" />
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load decks. Please refresh.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && decks.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">No decks yet</p>
          <p className="text-xs text-muted-foreground mb-5 max-w-[240px]">
            Create your first flashcard deck to start studying.
          </p>
          <CreateDeckDialog />
        </div>
      )}

      {/* No results */}
      {!isLoading && !error && decks.length > 0 && filtered.length === 0 && (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No decks match your filters.
        </div>
      )}

      {/* Table */}
      {!isLoading && filtered.length > 0 && (
        <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-[#F9F6F0]">
                <th className="py-2.5 pl-4 pr-3 text-left"><ColHeader label="Deck" active={sortField==='name'} dir={sortDir} onClick={() => handleSort('name')} /></th>
                <th className="py-2.5 px-3 text-left w-20"><ColHeader label="Cards" active={sortField==='card_count'} dir={sortDir} onClick={() => handleSort('card_count')} /></th>
                <th className="py-2.5 px-3 text-left hidden md:table-cell w-32"><ColHeader label="Updated" active={sortField==='updated_at'} dir={sortDir} onClick={() => handleSort('updated_at')} /></th>
                <th className="py-2.5 px-3 text-left w-24">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Visibility</span>
                </th>
                <th className="py-2.5 pr-4 pl-2 w-20" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((deck) => (
                <tr key={deck.id} className="group border-b border-[#F1ECE2] last:border-0 hover:bg-background transition-colors">
                  {/* Name */}
                  <td className="py-3 pl-4 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF1FE]">
                        <BookOpen className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/decks/${deck.id}`}
                          className="block text-sm font-medium text-foreground hover:text-primary truncate max-w-[240px] transition-colors"
                        >
                          {deck.name}
                        </Link>
                        {deck.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[240px] mt-0.5">
                            {deck.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* Cards */}
                  <td className="py-3 px-3 tabular-nums text-sm text-muted-foreground">{deck.card_count}</td>
                  {/* Updated */}
                  <td className="py-3 px-3 text-sm text-muted-foreground hidden md:table-cell whitespace-nowrap">
                    {formatDate(deck.updated_at)}
                  </td>
                  {/* Visibility */}
                  <td className="py-3 px-3">
                    {deck.is_public ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F766E]">
                        <Globe className="h-3 w-3" /> Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#A39E93]">
                        <Lock className="h-3 w-3" /> Private
                      </span>
                    )}
                  </td>
                  {/* Actions */}
                  <td className="py-3 pr-4 pl-2">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        asChild variant="ghost" size="icon-sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Link href={`/study?deck=${deck.id}`} title="Study">
                          <GraduationCap className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <RowActions deck={deck} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
