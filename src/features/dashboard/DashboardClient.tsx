'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, animate, useMotionValue, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Brain, GraduationCap, Globe, Trophy, Zap, Flame,
  BarChart2, ArrowUpRight, Clock, ChevronRight, Sparkles, Lock,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useDecks } from '@/features/decks/hooks';
import { useGamification, useCelebrations, useWeeklyRecap } from '@/features/gamification/hooks';
import { CelebrationToasts } from '@/components/gamification/CelebrationToast';
import { WeeklyRecapCard } from '@/components/gamification/WeeklyRecapCard';
import { gamificationIcon } from '@/components/gamification/icons';
import { getGreeting, cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Profile, Deck } from '@/lib/types';
import type { GamificationData, QuestProgress } from '@/lib/types/gamification';

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
   Command strip — level · review forecast · daily goal
   ───────────────────────────────────────────────────────────────────────────── */
function CommandStrip({
  game, todayCards, dailyGoal,
}: {
  game: GamificationData; todayCards: number; dailyGoal: number;
}) {
  const { xp, forecast } = game;
  const dueNow = forecast.overdue + forecast.dueToday;

  return (
    <div
      className="grid grid-cols-1 divide-y divide-slate-100 rounded-2xl border border-[#E5E7EB] bg-white sm:grid-cols-[auto_1fr_auto] sm:divide-x sm:divide-y-0"
      style={{ boxShadow: '0 1px 3px 0 rgba(15,23,42,0.05)' }}
    >
      {/* Level */}
      <div className="flex items-center gap-4 p-5">
        <div className="relative shrink-0">
          <ProgressRing value={xp.xpIntoLevel} max={xp.xpForNextLevel} size={72} strokeWidth={6} color="#1E40AF" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-[20px] font-bold leading-none tracking-[-0.03em] text-slate-900 tabular-nums">
              {xp.level}
            </span>
            <span className="text-[8.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">Level</span>
          </div>
        </div>
        <div>
          <p className="font-display text-[15px] font-bold tracking-[-0.01em] text-slate-900">
            <AnimatedNumber value={xp.totalXp} /> XP
          </p>
          <p className="mt-0.5 text-[11.5px] text-slate-400">
            {xp.xpForNextLevel - xp.xpIntoLevel} XP to level {xp.level + 1}
          </p>
        </div>
      </div>

      {/* Forecast + resume */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-6">
          {[
            { n: forecast.overdue,    label: 'Overdue',   tone: forecast.overdue > 0 ? 'text-orange-500' : 'text-slate-900' },
            { n: forecast.dueToday,   label: 'Due today', tone: 'text-slate-900' },
            { n: forecast.dueThisWeek,label: 'This week', tone: 'text-slate-900' },
          ].map(({ n, label, tone }) => (
            <div key={label}>
              <p className={cn('font-display text-[24px] font-bold leading-none tracking-[-0.03em] tabular-nums', tone)}>
                <AnimatedNumber value={n} delay={150} />
              </p>
              <p className="mt-1 text-[11px] font-medium text-slate-400">{label}</p>
            </div>
          ))}
        </div>
        {dueNow > 0 ? (
          <Link
            href="/decks"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#1E40AF] px-4 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-[#1B3A9E] hover:shadow-md active:scale-[0.98]"
          >
            Review {dueNow} card{dueNow !== 1 ? 's' : ''}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span className="text-[12.5px] font-medium text-[#0D9488]">All caught up ✓</span>
        )}
      </div>

      {/* Daily goal */}
      <div className="flex items-center gap-4 p-5">
        <div className="relative shrink-0">
          <ProgressRing value={todayCards} max={dailyGoal} size={72} strokeWidth={6}
            color={todayCards >= dailyGoal ? '#0D9488' : '#1E40AF'} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-[17px] font-bold leading-none tracking-[-0.02em] text-slate-900 tabular-nums">
              {todayCards}
            </span>
          </div>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-slate-700">Today&apos;s goal</p>
          <p className={cn('mt-0.5 text-[11.5px] font-medium',
            todayCards >= dailyGoal ? 'text-[#0D9488]' : 'text-slate-400')}>
            {todayCards >= dailyGoal ? 'Goal reached!' : `${dailyGoal - todayCards} cards to go`}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Insight bar — one honest, data-driven nudge
   ───────────────────────────────────────────────────────────────────────────── */
function pickInsight(stats: UserStats, game: GamificationData, todayCards: number): string {
  const { forecast } = game;
  if (forecast.overdue >= 10) {
    return `${forecast.overdue} cards are past due — clearing them first protects the intervals you've already built.`;
  }
  if (stats.streak >= 3 && todayCards === 0) {
    return `Your ${stats.streak}-day streak is on the line — a single session today keeps it alive.`;
  }
  const nearestQuest = [...game.quests.daily, ...game.quests.weekly]
    .filter((q) => !q.completed)
    .sort((a, b) => (b.progress / b.goal) - (a.progress / a.goal))[0];
  if (nearestQuest && nearestQuest.progress > 0) {
    const left = nearestQuest.goal - nearestQuest.progress;
    return `You're ${left} away from completing “${nearestQuest.title}” — worth ${nearestQuest.xpReward} XP.`;
  }
  if (forecast.dueThisWeek > 0) {
    return `${forecast.dueThisWeek} cards come due later this week — short daily sessions beat one long one.`;
  }
  return 'Reviews spread out as memory strengthens — consistency matters more than volume.';
}

function InsightBar({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#1E40AF]/15 bg-[#1E40AF]/[0.04] px-4 py-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1E40AF]/10">
        <Sparkles className="h-3.5 w-3.5 text-[#1E40AF]" />
      </span>
      <p className="text-[13px] leading-[1.5] text-slate-600">{text}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Quests
   ───────────────────────────────────────────────────────────────────────────── */
function QuestRow({ quest, delay }: { quest: QuestProgress; delay: number }) {
  const Icon = gamificationIcon(quest.icon);
  const pct = Math.min(100, (quest.progress / quest.goal) * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ ...springFast, delay }}
      className="flex items-center gap-3.5 py-3"
    >
      <span className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
        quest.completed ? 'bg-[#0D9488]/10 text-[#0D9488]' : 'bg-slate-100 text-slate-500',
      )}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className={cn('truncate text-[13px] font-semibold', quest.completed ? 'text-slate-400 line-through' : 'text-slate-800')}>
            {quest.title}
          </p>
          <span className={cn('shrink-0 text-[11px] font-bold tabular-nums', quest.completed ? 'text-[#0D9488]' : 'text-slate-400')}>
            {quest.completed ? `+${quest.xpReward} XP` : `${quest.progress}/${quest.goal}`}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: delay + 0.2 }}
            className={cn('h-full rounded-full', quest.completed ? 'bg-[#0D9488]' : 'bg-[#1E40AF]')}
          />
        </div>
      </div>
    </motion.div>
  );
}

function QuestsCard({ game }: { game: GamificationData }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5"
      style={{ boxShadow: '0 1px 3px 0 rgba(15,23,42,0.05)' }}>
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-slate-700">Quests</p>
        <span className="text-[11px] font-medium text-slate-400">Resets daily · weekly</span>
      </div>
      <div className="divide-y divide-slate-50">
        {[...game.quests.daily, ...game.quests.weekly].map((q, i) => (
          <QuestRow key={q.id} quest={q} delay={0.1 + i * 0.06} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Achievements shelf
   ───────────────────────────────────────────────────────────────────────────── */
const TIER_BADGE: Record<'bronze' | 'silver' | 'gold', string> = {
  bronze: 'bg-orange-50 text-orange-600 border-orange-100',
  silver: 'bg-slate-50 text-slate-600 border-slate-200',
  gold: 'bg-amber-50 text-amber-500 border-amber-100',
};

function AchievementsShelf({ game }: { game: GamificationData }) {
  const { unlocked, locked } = game.achievements;
  // Unlocked first, then the 3 nearest locked ones by progress ratio
  const nextUp = [...locked]
    .sort((a, b) => (b.progress / b.goal) - (a.progress / a.goal))
    .slice(0, 3);

  if (unlocked.length === 0 && nextUp.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5"
      style={{ boxShadow: '0 1px 3px 0 rgba(15,23,42,0.05)' }}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-slate-700">Achievements</p>
        <span className="text-[11px] font-medium text-slate-400">
          {unlocked.length} of {unlocked.length + locked.length} unlocked
        </span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {unlocked.map((a, i) => {
          const Icon = gamificationIcon(a.icon);
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ ...springFast, delay: 0.1 + i * 0.05 }}
              whileHover={{ y: -2 }}
              title={a.description}
              className={cn('flex items-center gap-2 rounded-xl border px-3 py-2', TIER_BADGE[a.tier])}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[12px] font-semibold">{a.title}</span>
            </motion.div>
          );
        })}
        {nextUp.map((a) => (
          <div
            key={a.id}
            title={`${a.description} — ${a.progress}/${a.goal}`}
            className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 px-3 py-2 text-slate-400"
          >
            <Lock className="h-3.5 w-3.5" />
            <span className="text-[12px] font-medium">{a.title}</span>
            <span className="text-[10.5px] font-semibold tabular-nums text-slate-300">
              {Math.min(a.progress, a.goal)}/{a.goal}
            </span>
          </div>
        ))}
      </div>
    </div>
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

  const isTeacherOrAdmin = profile?.role === 'teacher' || profile?.role === 'administrator';

  const { data: stats, isLoading: statsLoading, isError } = useQuery<UserStats>({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load stats');
      return json.data;
    },
    staleTime: 60_000,
  });

  const { data: game } = useGamification();
  const { celebrations, clear } = useCelebrations(game);
  const { recap, dismiss: dismissRecap } = useWeeklyRecap();

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
    <div className="relative min-h-full overflow-hidden bg-[#F8FAFC]">
      {/* Ambient texture — same dot-grid + soft-glow language as the
          landing page, kept faint so content stays the clear focus. */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(15,23,42,0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          WebkitMaskImage: 'radial-gradient(120% 60% at 50% 0%, #000 0%, transparent 75%)',
          maskImage: 'radial-gradient(120% 60% at 50% 0%, #000 0%, transparent 75%)',
        }}
      />
      <div aria-hidden className="pointer-events-none absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-[#1E40AF]/[0.05] blur-[110px]" />
      <div aria-hidden className="pointer-events-none absolute -right-24 top-64 h-[380px] w-[380px] rounded-full bg-[#0D9488]/[0.05] blur-[110px]" />

      <div className="relative mx-auto max-w-5xl px-5 py-7 sm:px-8 md:px-10 md:py-10">
        <motion.div variants={pageVariants} initial="hidden" animate="show" className="flex flex-col gap-6">

          {/* ── Greeting ─────────────────────────────────────────────────── */}
          <motion.div variants={sectionVariants} className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[12.5px] font-medium text-slate-400">{dayStr} · {dateStr}</p>
              <h1 className="mt-1.5 font-display text-[clamp(1.7rem,2.8vw,2.2rem)] font-bold leading-[1.1] tracking-[-0.03em] text-slate-900">
                {getGreeting()}, {firstName}.
              </h1>
            </div>
            <AnimatePresence>
              {!statsLoading && stats && stats.streak > 0 && (
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
                    You can explore and study right away. Joining classrooms and creating decks unlocks once your administrator approves your account.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Weekly recap (dismissible, once per week) ─────────────────── */}
          <AnimatePresence>
            {recap && (
              <motion.div key="recap" exit={{ opacity: 0, height: 0, marginTop: 0 }}>
                <WeeklyRecapCard recap={recap} onDismiss={dismissRecap} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Command strip: level · forecast · goal ───────────────────── */}
          <motion.div variants={sectionVariants}>
              {game ? (
                <CommandStrip game={game} todayCards={todayCards} dailyGoal={dailyGoal} />
              ) : (
                <Skeleton className="h-[112px] rounded-2xl" />
              )}
            </motion.div>

          {/* ── Insight ──────────────────────────────────────────────────── */}
          {stats && game && (
            <motion.div variants={sectionVariants}>
              <InsightBar text={pickInsight(stats, game, todayCards)} />
            </motion.div>
          )}

          {/* ── Stat cards ───────────────────────────────────────────────── */}
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

          {/* ── Activity + Quests ────────────────────────────────────────── */}
          <motion.div variants={sectionVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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

              {game ? <QuestsCard game={game} /> : <Skeleton className="h-[200px] rounded-2xl" />}
            </motion.div>

          {/* ── Achievements ─────────────────────────────────────────────── */}
          {game && (
            <motion.div variants={sectionVariants}>
              <AchievementsShelf game={game} />
            </motion.div>
          )}

          {/* ── Jump back in — recent decks ──────────────────────────────── */}
          {(decksLoading || recentDecks.length > 0) && (
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

        </motion.div>
      </div>

      {/* Celebration toasts + confetti */}
      <CelebrationToasts queue={celebrations} onDrain={clear} />
    </div>
  );
}
