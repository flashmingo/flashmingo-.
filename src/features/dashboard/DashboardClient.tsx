'use client';

import Link from 'next/link';
import { Flame, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useDecks } from '@/features/decks/hooks';
import { getGreeting } from '@/lib/utils';
import type { Profile, Deck } from '@/lib/types';
import { cn } from '@/lib/utils';

interface UserStats {
  streak: number;
  totalSessions: number;
  totalCards: number;
  activity30d: Array<{ date: string; cards: number }>;
}

/* ── Marker-swipe highlight behind a word ─────────────────────────── */
function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="relative z-[1]">{children}</span>
      <span
        aria-hidden
        className="absolute bottom-1 left-[-6px] right-[-6px] z-0 h-[38%] opacity-55"
        style={{
          background: 'linear-gradient(90deg,#FBBF24,#FCD34D)',
          transform: 'rotate(-1.4deg)',
          borderRadius: '5px 7px 4px 8px',
        }}
      />
    </span>
  );
}

/* ── 30-day activity bars with baseline ───────────────────────────── */
function ActivityBars({ data }: { data: Array<{ date: string; cards: number }> }) {
  const max = Math.max(...data.map((d) => d.cards), 1);
  return (
    <div>
      <p className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A39E93]">
        Last 30 days
      </p>
      <div className="flex h-[54px] max-w-[520px] items-end gap-[3px] border-b border-[#D3CBB8]">
        {data.map(({ date, cards }) => {
          const height = cards === 0 ? 4 : Math.max(8, Math.round((cards / max) * 54));
          return (
            <div
              key={date}
              title={`${date}: ${cards} cards`}
              className={cn(
                'flex-1 rounded-t-sm transition-colors',
                cards === 0 ? 'bg-[#EDE7DB]' : 'bg-primary/70 hover:bg-primary',
              )}
              style={{ height: `${height}px` }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ── "Jump back in" recent-deck card with layered deck stack ──────── */
const CHIP_TINTS = [
  'bg-[#FBEFD8] text-[#B45309]',
  'bg-[#EAF1FE] text-[#2563EB]',
  'bg-[#D7EEE9] text-[#0F766E]',
] as const;

function formatUpdated(iso: string | null): string {
  if (!iso) return 'Recently';
  const d = new Date(iso);
  const days = Math.round((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function RecentDeckCard({ deck, index }: { deck: Deck; index: number }) {
  const count = (deck as Deck & { card_count?: number }).card_count ?? 0;
  return (
    <Link href={`/study?deck=${deck.id}`} className="relative block cursor-pointer">
      {/* stacked deck shadows */}
      <div className="absolute left-2.5 right-[-10px] top-2 bottom-[-8px] rounded-2xl border border-border bg-[#F1ECE2]" />
      <div className="absolute left-[5px] right-[-5px] top-1 bottom-[-4px] rounded-2xl border border-[#EDE7DB] bg-background" />
      {/* face */}
      <div className="relative flex h-full min-h-[150px] flex-col rounded-2xl border border-border bg-white p-4 shadow-[0_10px_24px_-14px_rgba(27,26,24,0.22)] transition-transform duration-150 hover:-translate-y-[3px]">
        <span className={cn('inline-flex w-fit items-center rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-[0.06em]', CHIP_TINTS[index % 3])}>
          {count} cards
        </span>
        <p className="mt-2.5 font-display text-sm font-bold leading-[1.35] text-foreground line-clamp-2">
          {deck.name}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-xs text-[#A39E93]">{formatUpdated(deck.updated_at)}</span>
          <span className="text-[13px] font-semibold text-primary">Study →</span>
        </div>
      </div>
    </Link>
  );
}

export function DashboardClient({ profile }: { profile: Profile | null }) {
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
  const today = new Date();
  const dateLine = today
    .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    .toUpperCase();
  const isApproved = profile?.account_status === 'approved';

  const { data: stats } = useQuery<UserStats>({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    enabled: isApproved,
  });

  const { data: decks } = useDecks();
  const recentDecks = (decks ?? [])
    .slice()
    .sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''))
    .slice(0, 3);

  return (
    <div className="relative min-h-full">
      {/* faded notebook grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[360px]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(27,26,24,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(27,26,24,0.05) 1px, transparent 1px)',
          backgroundSize: '27px 27px',
          WebkitMaskImage: 'radial-gradient(120% 100% at 30% 0%, #000 30%, transparent 80%)',
          maskImage: 'radial-gradient(120% 100% at 30% 0%, #000 30%, transparent 80%)',
        }}
      />

      <div className="relative flex max-w-[720px] flex-col gap-10 px-10 pb-10 pt-11">
        {/* Greeting */}
        <div>
          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#B45309]">
            {dateLine}
          </p>
          <h1 className="font-display text-[32px] font-extrabold leading-[1.15] tracking-[-0.03em] text-foreground">
            {getGreeting()}, <Highlight>{firstName}</Highlight>.
          </h1>
          {isApproved && stats && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Flame className={cn('h-[15px] w-[15px] shrink-0', stats.streak > 0 ? 'text-[#D97706]' : 'text-muted-foreground')} />
              <span><strong className="font-semibold text-foreground">{stats.streak}-day</strong> streak</span>
              <span className="text-[#D3CBB8]">·</span>
              <span><strong className="font-semibold text-foreground">{stats.totalSessions}</strong> sessions</span>
              <span className="text-[#D3CBB8]">·</span>
              <span><strong className="font-semibold text-foreground">{stats.totalCards.toLocaleString()}</strong> cards reviewed</span>
            </div>
          )}
        </div>

        {/* Pending approval */}
        {profile?.account_status === 'pending' && (
          <div className="flex items-start gap-3 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E]">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]" />
            <p>
              <span className="font-semibold">Account pending approval.</span>{' '}
              Your administrator will review your account soon.
            </p>
          </div>
        )}

        {/* Activity */}
        {isApproved && stats?.activity30d && stats.activity30d.length > 0 && (
          <ActivityBars data={stats.activity30d} />
        )}

        {/* Jump back in */}
        {recentDecks.length > 0 && (
          <div>
            <p className="mb-[18px] text-[11px] font-bold uppercase tracking-[0.1em] text-[#B45309]">
              Jump back in
            </p>
            <div className="grid grid-cols-3 gap-6 pr-2.5">
              {recentDecks.map((deck, i) => (
                <RecentDeckCard key={deck.id} deck={deck} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Due-review banner */}
        <div className="relative flex items-center justify-between gap-4 overflow-hidden rounded-[18px] border border-border bg-[#F4F0E8] px-7 py-[26px]">
          <svg
            aria-hidden
            viewBox="0 0 32 32"
            fill="#F59E0B"
            className="pointer-events-none absolute bottom-[-44px] right-[-34px] h-[170px] w-[170px] rotate-12 opacity-[0.07]"
          >
            <path d="M19 5L9 18h8L13 27l14-16h-9L19 5z" />
          </svg>
          <div className="relative">
            <p className="font-display text-[21px] font-extrabold tracking-[-0.02em] text-foreground">
              Ready to review?
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Jump into a spaced-repetition session and keep your streak alive.
            </p>
          </div>
          <Link
            href="/study"
            className="relative inline-flex h-11 shrink-0 items-center rounded-[10px] bg-primary px-6 text-[15px] font-medium text-white transition-colors hover:bg-blue-700"
          >
            Start review
          </Link>
        </div>
      </div>
    </div>
  );
}
