'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, animate, useMotionValue, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Brain, GraduationCap, Globe, Trophy, Zap, Flame,
  BarChart2, ArrowUpRight, Clock, ChevronRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useDecks } from '@/features/decks/hooks';
import { getGreeting, cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Profile, Deck } from '@/lib/types';

/* ─────────────────────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────────────────────── */
interface UserStats {
  streak: number;
  totalSessions: number;
  totalCards: number;
  activity30d: Array<{ date: string; cards: number }>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Spring presets
   ───────────────────────────────────────────────────────────────────────────── */
const spring     = { type: 'spring' as const, stiffness: 340, damping: 28 };
const springFast = { type: 'spring' as const, stiffness: 420, damping: 30 };

/* ─────────────────────────────────────────────────────────────────────────────
   Animated counter
   ───────────────────────────────────────────────────────────────────────────── */
function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const unsub = mv.on('change', (v) => setDisplay(Math.round(v).toLocaleString()));
    const timer = window.setTimeout(() => {
      const ctrl = animate(mv, value, { duration: 1.35, ease: [0.16, 1, 0.3, 1] });
      return () => ctrl.stop();
    }, delay);
    return () => { window.clearTimeout(timer); unsub(); };
  }, [value, delay, mv]);

  return <>{display}</>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Progress ring
   ───────────────────────────────────────────────────────────────────────────── */
function ProgressRing({
  value, max, size = 96, strokeWidth = 7, color = '#1E40AF',
}: {
  value: number; max: number; size?: number; strokeWidth?: number; color?: string;
}) {
  const [pct, setPct] = useState(0);
  const rafRef = useRef<number>(0);
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    const target = Math.min(value / Math.max(max, 1), 1);
    let start: number | null = null;
    const run = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1500, 1);
      setPct((1 - Math.pow(1 - p, 4)) * target);
      if (p < 1) rafRef.current = requestAnimationFrame(run);
    };
    rafRef.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, max]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ transform: 'rotate(-90deg)' }} aria-hidden>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EFF2F5" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Activity heatmap — staggered spring entrance
   ───────────────────────────────────────────────────────────────────────────── */
const heatColors = [
  'bg-slate-100',
  'bg-[#1E40AF]/18',
  'bg-[#1E40AF]/38',
  'bg-[#1E40AF]/62',
  'bg-[#1E40AF]',
] as const;

function ActivityHeatmap({ data }: { data: Array<{ date: string; cards: number }> }) {
  const max = Math.max(...data.map((d) => d.cards), 1);
  const slot = (cards: number): 0|1|2|3|4 => {
    if (cards === 0) return 0;
    const r = cards / max;
    if (r < 0.25) return 1;
    if (r < 0.5)  return 2;
    if (r < 0.75) return 3;
    return 4;
  };
  return (
    <motion.div
      initial="hidden" animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.014, delayChildren: 0.1 } } }}
      className="grid gap-[3.5px]"
      style={{ gridTemplateColumns: 'repeat(30, 1fr)' }}
    >
      {data.map(({ date, cards }) => (
        <motion.div
          key={date}
          variants={{ hidden: { opacity: 0, scale: 0.5 }, show: { opacity: 1, scale: 1, transition: { ...springFast } } }}
          className={cn('aspect-square rounded-[3px] cursor-default', heatColors[slot(cards)])}
          title={`${date}: ${cards} card${cards !== 1 ? 's' : ''}`}
        />
      ))}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Stat card
   ───────────────────────────────────────────────────────────────────────────── */
function StatCard({
  icon: Icon, label, value, iconColor, iconBg, badge, delay = 0,
}: {
  icon: React.ElementType; label: string; value: number;
  iconColor: string; iconBg: string; badge?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay }}
      whileHover={{ y: -3, boxShadow: '0 10px 28px -6px rgba(15,23,42,0.11)' }}
      className="flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5"
      style={{ boxShadow: '0 1px 3px 0 rgba(15,23,42,0.05)' }}
    >
      <div className="flex items-start justify-between">
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', iconBg)}>
          <Icon className={cn('h-[18px] w-[18px]', iconColor)} />
        </span>
        {badge && (
          <span className="hidden rounded-full bg-orange-50 px-2 py-0.5 text-[10.5px] font-semibold text-orange-500 sm:inline">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-5">
        <p className="font-display text-[26px] font-bold leading-none tracking-[-0.035em] text-slate-900 tabular-nums sm:text-[34px]">
          <AnimatedNumber value={value} delay={delay * 1000} />
        </p>
        <p className="mt-1.5 text-[12.5px] font-medium text-slate-500">{label}</p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Recent deck card — layered stack effect
   ───────────────────────────────────────────────────────────────────────────── */
const CHIP_TINTS = [
  'bg-[#EAF1FE] text-[#1E40AF]',
  'bg-[#D7EEE9] text-[#0D9488]',
  'bg-[#EDE9FE] text-[#7C3AED]',
] as const;

function formatUpdated(iso: string | null): string {
  if (!iso) return 'Recently';
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0)  return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7)   return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function RecentDeckCard({ deck, index, delay = 0 }: { deck: Deck; index: number; delay?: number }) {
  const count = (deck as Deck & { card_count?: number }).card_count ?? 0;
  return (
    <Link href={`/study?deck=${deck.id}`} className="relative block">
      <div className="absolute left-2.5 right-[-10px] top-2 bottom-[-8px] rounded-2xl border border-[#E5E7EB] bg-slate-50" />
      <div className="absolute left-[5px] right-[-5px] top-1 bottom-[-4px] rounded-2xl border border-[#EAECEF] bg-white/80" />
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay }}
        whileHover={{ y: -3, boxShadow: '0 10px 28px -6px rgba(15,23,42,0.13)' }}
        whileTap={{ scale: 0.985 }}
        className="relative flex min-h-[148px] flex-col rounded-2xl border border-[#E5E7EB] bg-white p-4"
        style={{ boxShadow: '0 1px 3px 0 rgba(15,23,42,0.06)' }}
      >
        <span className={cn('inline-flex w-fit items-center rounded-lg px-2 py-1 text-[10.5px] font-bold uppercase tracking-[0.06em]', CHIP_TINTS[index % 3])}>
          {count} {count === 1 ? 'card' : 'cards'}
        </span>
        <p className="mt-2.5 text-[13.5px] font-semibold leading-[1.35] text-slate-900 line-clamp-2">
          {deck.name}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-[11.5px] text-slate-400">{formatUpdated(deck.updated_at)}</span>
          <span className="flex items-center gap-0.5 text-[12px] font-semibold text-[#1E40AF]">
            Study <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Action card
   ───────────────────────────────────────────────────────────────────────────── */
function ActionCard({
  label, description, href, icon: Icon, iconColor, iconBg, disabled = false, delay = 0,
}: {
  label: string; description: string; href?: string;
  icon: React.ElementType; iconColor: string; iconBg: string;
  disabled?: boolean; delay?: number;
}) {
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay }}
      whileHover={!disabled ? { y: -2, boxShadow: '0 10px 28px -6px rgba(15,23,42,0.11)' } : {}}
      whileTap={!disabled ? { scale: 0.985 } : {}}
      className={cn(
        'group flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 transition-colors duration-150',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-slate-300',
      )}
      style={{ boxShadow: '0 1px 3px 0 rgba(15,23,42,0.05)' }}
    >
      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', iconBg)}>
        <Icon className={cn('h-5 w-5', iconColor)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold text-slate-900">{label}</p>
        <p className="mt-0.5 text-[12px] leading-[1.45] text-slate-500">{description}</p>
      </div>
      {!disabled && (
        <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition-all duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-500" />
      )}
    </motion.div>
  );
  if (href && !disabled) return <Link href={href} className="block">{card}</Link>;
  return <div>{card}</div>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Section label
   ───────────────────────────────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
      {children}
    </p>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Page variants
   ───────────────────────────────────────────────────────────────────────────── */
const pageVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.02 } },
};
const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { ...spring } },
};

/* ─────────────────────────────────────────────────────────────────────────────
   DashboardClient
   ───────────────────────────────────────────────────────────────────────────── */
export function DashboardClient({ profile }: { profile: Profile | null }) {
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const dayStr  = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const isApproved       = profile?.account_status === 'approved';
  const isTeacherOrAdmin = profile?.role === 'teacher' || profile?.role === 'administrator';

  const { data: stats, isLoading: statsLoading, isError } = useQuery<UserStats>({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load stats');
      return json.data;
    },
    enabled: isApproved,
    staleTime: 60_000,
  });

  const { data: allDecks, isLoading: decksLoading } = useDecks();
  const recentDecks: Deck[] = (allDecks ?? [])
    .slice()
    .sort((a, b) => new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime())
    .slice(0, 3);

  const todayCards = stats?.activity30d?.find((d) => d.date === todayKey)?.cards ?? 0;
  const weekCards  = stats?.activity30d?.slice(-7).reduce((s, d) => s + d.cards, 0) ?? 0;
  const dailyGoal  = 20;

  const primaryActions = [
    { label: 'My Decks',   description: 'Create and organise your flashcard collections', href: '/decks',      icon: BookOpen,      iconColor: 'text-[#1E40AF]',  iconBg: 'bg-[#1E40AF]/8'  },
    { label: 'Study Now',  description: 'Start a spaced repetition session',               href: '/study',      icon: Brain,         iconColor: 'text-[#0D9488]',  iconBg: 'bg-[#0D9488]/8'  },
    { label: 'Classrooms', description: 'Join or manage classroom groups',                 href: '/classrooms', icon: GraduationCap, iconColor: 'text-violet-600', iconBg: 'bg-violet-50'    },
    { label: 'Browse',     description: 'Explore public decks from your district',         href: '/browse',     icon: Globe,         iconColor: 'text-slate-600',  iconBg: 'bg-slate-100'    },
  ];
  const secondaryActions = [
    { label: 'Leaderboard', description: 'Top students this month', href: '/leaderboard', icon: Trophy, iconColor: 'text-amber-500', iconBg: 'bg-amber-50' },
    ...(isTeacherOrAdmin ? [{ label: 'Teacher Dashboard', description: 'Class progress and student activity', href: '/teacher', icon: Zap, iconColor: 'text-slate-600', iconBg: 'bg-slate-100' }] : []),
  ];

  return (
    <div className="min-h-full bg-[#F8FAFC]">
      <div className="mx-auto max-w-5xl px-5 py-7 sm:px-8 md:px-10 md:py-10">
        <motion.div variants={pageVariants} initial="hidden" animate="show" className="flex flex-col gap-7">

          {/* ── Greeting ─────────────────────────────────────────────────── */}
          <motion.div variants={sectionVariants} className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[12.5px] font-medium text-slate-400">{dayStr} · {dateStr}</p>
              <h1 className="mt-1.5 font-display text-[clamp(1.7rem,2.8vw,2.2rem)] font-bold leading-[1.1] tracking-[-0.03em] text-slate-900">
                {getGreeting()}, {firstName}.
              </h1>
            </div>
            <AnimatePresence>
              {isApproved && !statsLoading && stats && stats.streak > 0 && (
                <motion.div key="streak-badge"
                  initial={{ opacity: 0, scale: 0.75, x: 12 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.75 }}
                  transition={{ ...spring, delay: 0.6 }}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-orange-200/80 bg-orange-50 px-3 py-1.5"
                >
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-[12px] font-semibold text-orange-600">
                    {stats.streak}-day streak
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Pending notice ───────────────────────────────────────────── */}
          <AnimatePresence>
            {profile?.account_status === 'pending' && (
              <motion.div key="pending" variants={sectionVariants} exit={{ opacity: 0, y: -8 }}
                className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4"
              >
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <p className="text-[13.5px] font-semibold text-amber-800">Account pending approval</p>
                  <p className="mt-0.5 text-[12.5px] text-amber-700">
                    Your district administrator will review your account and grant access soon.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Stat cards ───────────────────────────────────────────────── */}
          {isApproved && (
            <motion.div variants={sectionVariants} className="grid grid-cols-3 gap-2.5 sm:gap-4">
              {statsLoading ? (
                [0,1,2].map((i) => <Skeleton key={i} className="h-[118px] rounded-2xl" />)
              ) : isError ? (
                <div className="col-span-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-[13px] text-red-600">
                  Could not load stats. Refresh to try again.
                </div>
              ) : (
                <>
                  <StatCard icon={Flame} label="Day streak" value={stats?.streak ?? 0}
                    iconColor={stats && stats.streak > 0 ? 'text-orange-500' : 'text-slate-400'}
                    iconBg={stats && stats.streak > 0 ? 'bg-orange-50' : 'bg-slate-100'}
                    badge={stats && stats.streak >= 7 ? `${stats.streak}🔥` : undefined}
                    delay={0.05} />
                  <StatCard icon={BarChart2} label="Sessions completed" value={stats?.totalSessions ?? 0}
                    iconColor="text-[#1E40AF]" iconBg="bg-[#1E40AF]/8" delay={0.12} />
                  <StatCard icon={Brain} label="Cards reviewed" value={stats?.totalCards ?? 0}
                    iconColor="text-[#0D9488]" iconBg="bg-[#0D9488]/8" delay={0.19} />
                </>
              )}
            </motion.div>
          )}

          {/* ── Activity + Goal ──────────────────────────────────────────── */}
          {isApproved && (
            <motion.div variants={sectionVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_192px]">
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5"
                style={{ boxShadow: '0 1px 3px 0 rgba(15,23,42,0.05)' }}>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-slate-700">30-day activity</p>
                  {stats && weekCards > 0 && (
                    <span className="text-[12px] font-medium text-slate-400">
                      {weekCards.toLocaleString()} cards this week
                    </span>
                  )}
                </div>
                {statsLoading
                  ? <Skeleton className="h-8 w-full rounded-lg" />
                  : stats?.activity30d
                    ? <ActivityHeatmap data={stats.activity30d} />
                    : <p className="text-[12.5px] text-slate-400">No activity yet — start a session!</p>}
              </div>

              <motion.div
                whileHover={{ y: -2, boxShadow: '0 10px 28px -6px rgba(15,23,42,0.11)' }}
                className="flex flex-col items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white px-5 py-6"
                style={{ boxShadow: '0 1px 3px 0 rgba(15,23,42,0.05)' }}
              >
                <p className="mb-4 text-[13px] font-semibold text-slate-700">Today&apos;s goal</p>
                {statsLoading ? (
                  <Skeleton className="h-24 w-24 rounded-full" />
                ) : (
                  <div className="relative">
                    <ProgressRing value={todayCards} max={dailyGoal} size={96} strokeWidth={7}
                      color={todayCards >= dailyGoal ? '#0D9488' : '#1E40AF'} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display text-[22px] font-bold leading-none tracking-[-0.03em] text-slate-900">
                        <AnimatedNumber value={todayCards} delay={200} />
                      </span>
                      <span className="text-[10.5px] font-medium text-slate-400">/ {dailyGoal}</span>
                    </div>
                  </div>
                )}
                <p className={cn('mt-4 text-[11.5px] font-semibold',
                  todayCards >= dailyGoal ? 'text-[#0D9488]' : 'text-slate-400')}>
                  {statsLoading ? 'Loading…'
                    : todayCards >= dailyGoal ? 'Goal reached!'
                    : `${dailyGoal - todayCards} cards to go`}
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* ── Jump back in — recent decks ──────────────────────────────── */}
          {isApproved && (decksLoading || recentDecks.length > 0) && (
            <motion.div variants={sectionVariants}>
              <SectionLabel>Jump back in</SectionLabel>
              {decksLoading ? (
                <div className="grid grid-cols-1 gap-4 pr-2.5 sm:grid-cols-2 md:grid-cols-3">
                  {[0,1,2].map((i) => <Skeleton key={i} className="h-[148px] rounded-2xl" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 pr-2.5 sm:grid-cols-2 md:grid-cols-3">
                  {recentDecks.map((deck, i) => (
                    <RecentDeckCard key={deck.id} deck={deck} index={i} delay={0.28 + i * 0.06} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Quick access — 2×2 ──────────────────────────────────────── */}
          <motion.div variants={sectionVariants}>
            <SectionLabel>Quick access</SectionLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {primaryActions.map((a, i) => (
                <ActionCard key={a.label} {...a} delay={0.32 + i * 0.055} />
              ))}
            </div>
          </motion.div>

          {/* ── More ────────────────────────────────────────────────────── */}
          {secondaryActions.length > 0 && (
            <motion.div variants={sectionVariants}>
              <SectionLabel>More</SectionLabel>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {secondaryActions.map((a, i) => (
                  <ActionCard key={a.label} {...a} delay={0.52 + i * 0.05} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Study CTA ───────────────────────────────────────────────── */}
          {isApproved && (
            <motion.div variants={sectionVariants}>
              <Link href="/study" className="group block">
                <motion.div
                  whileHover={{ y: -3, boxShadow: '0 24px 56px -20px rgba(30,64,175,0.42)' }}
                  whileTap={{ scale: 0.995 }}
                  transition={spring}
                  className="relative overflow-hidden rounded-2xl bg-[#1E40AF] p-6"
                  style={{ boxShadow: '0 8px 24px -8px rgba(30,64,175,0.38)' }}
                >
                  <div aria-hidden className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }} />
                  <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#0D9488]/35 blur-2xl" />
                  <div className="relative flex items-center justify-between gap-6">
                    <div>
                      <p className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-white/55">
                        Ready when you are
                      </p>
                      <p className="mt-1 font-display text-[21px] font-bold leading-tight tracking-[-0.025em] text-white">
                        Start a review session
                      </p>
                      <p className="mt-1.5 text-[13px] leading-[1.5] text-white/65">
                        Pick a deck and let spaced repetition take over.
                      </p>
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 transition-all duration-200 group-hover:scale-105 group-hover:bg-white/22">
                      <ArrowUpRight className="h-5 w-5 text-white transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
