'use client';

import { Trophy, Medal, Eye, EyeOff, Crown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Switch } from '@/components/ui/Switch';
import { cn } from '@/lib/utils';

interface LeaderEntry {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  cardsReviewed: number;
  rank: number;
}

interface LeaderboardData {
  data: LeaderEntry[];
  myRank: number | null;
  isOptedIn: boolean;
}

const rankColors: Record<number, string> = {
  1: 'text-amber-500',
  2: 'text-slate-400',
  3: 'text-orange-400',
};

const rankBg: Record<number, string> = {
  1: 'bg-amber-50 border-amber-200',
  2: 'bg-slate-50 border-slate-200',
  3: 'bg-orange-50 border-orange-100',
};

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-4 w-4 text-amber-500" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-slate-400" />;
  if (rank === 3) return <Medal className="h-4 w-4 text-orange-400" />;
  return <span className="text-xs font-mono text-muted-foreground w-4 text-center">{rank}</span>;
}

export default function LeaderboardPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<LeaderboardData>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/leaderboard', { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to update preference');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leaderboard'] }),
  });

  return (
    <div className="p-6 md:p-8 max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Leaderboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Top students by cards reviewed in the last 30 days · district-scoped
          </p>
        </div>

        {/* Opt-in toggle */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-3 shadow-card shrink-0">
          {data?.isOptedIn ? (
            <Eye className="h-3.5 w-3.5 text-primary shrink-0" />
          ) : (
            <EyeOff className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          )}
          <span className="text-xs font-medium text-foreground">
            {data?.isOptedIn ? 'Visible' : 'Hidden'}
          </span>
          <Switch
            checked={data?.isOptedIn ?? false}
            onCheckedChange={() => toggleMutation.mutate()}
            disabled={isLoading || toggleMutation.isPending}
          />
        </div>
      </div>

      {/* My rank banner */}
      {!isLoading && data?.isOptedIn && data?.myRank && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3">
          <Trophy className="h-4 w-4 text-primary shrink-0" />
          <p className="text-sm text-foreground">
            Your rank: <span className="font-bold text-primary">#{data.myRank}</span>
            {' '}out of {data.data.length} participants
          </p>
        </div>
      )}

      {/* Opt-in prompt */}
      {!isLoading && !data?.isOptedIn && (
        <div className="rounded-xl border border-border bg-white px-5 py-4 shadow-card">
          <p className="text-sm text-foreground font-medium mb-1">You&apos;re not on the leaderboard</p>
          <p className="text-xs text-muted-foreground mb-3">
            Toggle &ldquo;Visible&rdquo; above to appear on the district leaderboard and compete with your peers.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
          >
            Join leaderboard
          </Button>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="ml-auto h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard table */}
      {!isLoading && data?.data && (
        <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
          {data.data.length === 0 ? (
            <div className="py-16 text-center">
              <Trophy className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">No entries yet</p>
              <p className="text-xs text-muted-foreground">
                Be the first to join the leaderboard!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.data.map((entry) => {
                const initials = (entry.full_name ?? 'U')
                  .split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

                return (
                  <div
                    key={entry.id}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 transition-colors',
                      entry.rank <= 3 ? rankBg[entry.rank] : 'hover:bg-muted/20'
                    )}
                  >
                    {/* Rank */}
                    <div className="w-6 flex items-center justify-center shrink-0">
                      <RankIcon rank={entry.rank} />
                    </div>

                    {/* Avatar */}
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={entry.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium truncate',
                        entry.rank <= 3 ? rankColors[entry.rank] : 'text-foreground'
                      )}>
                        {entry.full_name ?? 'Anonymous'}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="text-right shrink-0">
                      <p className={cn(
                        'text-sm font-bold tabular-nums',
                        entry.rank === 1 ? 'text-amber-600' : 'text-foreground'
                      )}>
                        {entry.cardsReviewed.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">cards</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground text-center">
        Rankings reset at the start of each month. Only district members who opt in are shown.
      </p>
    </div>
  );
}
