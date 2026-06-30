'use client';

import Link from 'next/link';
import {
  BookOpen, Brain, GraduationCap, ArrowRight, Clock,
  Zap, Flame, Trophy, Globe, BarChart2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { getGreeting } from '@/lib/utils';
import type { Profile } from '@/lib/types';
import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  description: string;
  icon: React.ElementType;
  href?: string;
  disabled?: boolean;
  iconColor: string;
  iconBg: string;
}

interface UserStats {
  streak: number;
  totalSessions: number;
  totalCards: number;
  activity30d: Array<{ date: string; cards: number }>;
}

function QuickActionCard({
  label, description, icon: Icon, href, disabled, iconColor, iconBg,
}: QuickAction) {
  const inner = (
    <div
      className={cn(
        'group flex items-start gap-4 rounded-xl border border-border bg-white p-5',
        'transition-all duration-150',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:border-slate-300 hover:shadow-md cursor-pointer'
      )}
    >
      <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', iconBg)}>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
      </div>
      {!disabled && (
        <ArrowRight className="h-4 w-4 text-muted-foreground/30 mt-0.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground/60" />
      )}
    </div>
  );
  if (href && !disabled) return <Link href={href}>{inner}</Link>;
  return inner;
}

/** 30-day activity sparkline */
function ActivityGrid({ data }: { data: Array<{ date: string; cards: number }> }) {
  const max = Math.max(...data.map((d) => d.cards), 1);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map(({ date, cards }) => {
        const height = cards === 0 ? 3 : Math.max(6, Math.round((cards / max) * 32));
        return (
          <div
            key={date}
            title={`${date}: ${cards} cards`}
            className={cn(
              'flex-1 rounded-sm transition-colors',
              cards === 0 ? 'bg-muted' : 'bg-primary/60 hover:bg-primary'
            )}
            style={{ height: `${height}px` }}
          />
        );
      })}
    </div>
  );
}

export function DashboardClient({ profile }: { profile: Profile | null }) {
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    enabled: profile?.account_status === 'approved',
  });

  const actions: QuickAction[] = [
    {
      label: 'My Decks',
      description: 'Create and organize your flashcard collections',
      icon: BookOpen,
      href: '/decks',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      label: 'Study',
      description: 'Review cards with spaced repetition',
      icon: Brain,
      href: '/study',
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50',
    },
    {
      label: 'Classrooms',
      description: 'Join or manage classroom groups',
      icon: GraduationCap,
      href: '/classrooms',
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50',
    },
    {
      label: 'Browse',
      description: 'Explore public decks shared by your district',
      icon: Globe,
      href: '/browse',
      iconColor: 'text-slate-600',
      iconBg: 'bg-slate-100',
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-2xl space-y-8">
      {/* Page header */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
          {dayName}, {dateStr}
        </p>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {getGreeting()}, {firstName}.
        </h1>
      </div>

      {/* Pending approval notice */}
      {profile?.account_status === 'pending' && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Clock className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
          <p>
            <span className="font-semibold">Account pending approval.</span>
            {' '}Your administrator will review your account soon.
          </p>
        </div>
      )}

      {/* Stats row */}
      {profile?.account_status === 'approved' && (
        <div className="grid grid-cols-3 gap-3">
          {statsLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          ) : (
            <>
              {/* Streak */}
              <div className="rounded-xl border border-border bg-white p-4 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Flame className={cn('h-3.5 w-3.5', stats && stats.streak > 0 ? 'text-orange-500' : 'text-muted-foreground')} />
                  Streak
                </div>
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {stats?.streak ?? 0}
                  <span className="text-sm font-medium text-muted-foreground ml-1">d</span>
                </p>
              </div>
              {/* Sessions */}
              <div className="rounded-xl border border-border bg-white p-4 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BarChart2 className="h-3.5 w-3.5" />
                  Sessions
                </div>
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {stats?.totalSessions ?? 0}
                </p>
              </div>
              {/* Cards */}
              <div className="rounded-xl border border-border bg-white p-4 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Brain className="h-3.5 w-3.5" />
                  Cards
                </div>
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {(stats?.totalCards ?? 0).toLocaleString()}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* 30-day activity */}
      {profile?.account_status === 'approved' && stats?.activity30d && stats.activity30d.length > 0 && (
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">30-day activity</p>
          <ActivityGrid data={stats.activity30d} />
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Quick access
        </p>
        <div className="space-y-2">
          {actions.map((a) => <QuickActionCard key={a.label} {...a} />)}

          {(profile?.role === 'teacher' || profile?.role === 'administrator') && (
            <QuickActionCard
              label="Teacher Dashboard"
              description="View classroom progress and student activity"
              icon={Zap}
              href="/teacher"
              iconColor="text-slate-600"
              iconBg="bg-slate-100"
            />
          )}

          <QuickActionCard
            label="Leaderboard"
            description="See top students in your district this month"
            icon={Trophy}
            href="/leaderboard"
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-white p-5">
        <div>
          <p className="text-sm font-semibold text-foreground">Ready to study?</p>
          <p className="text-xs text-muted-foreground mt-0.5">Pick a deck and start a spaced repetition session</p>
        </div>
        <Button asChild size="lg">
          <Link href="/study">
            <Brain className="h-4 w-4" />
            Start session
          </Link>
        </Button>
      </div>
    </div>
  );
}
