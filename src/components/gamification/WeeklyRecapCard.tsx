'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Brain, CalendarCheck, Flame, TrendingUp, TrendingDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WeeklyRecap } from '@/lib/types/gamification';

const spring = { type: 'spring' as const, stiffness: 320, damping: 30 };

function Stat({
  icon: Icon, value, label, accent, delay,
}: {
  icon: React.ElementType; value: string; label: string; accent: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay }}
      className="flex flex-col gap-1"
    >
      <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', accent)}>
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-1.5 font-display text-[22px] font-bold leading-none tracking-[-0.03em] text-white tabular-nums">
        {value}
      </p>
      <p className="text-[11.5px] font-medium text-white/55">{label}</p>
    </motion.div>
  );
}

/**
 * "Last week in review" — a dismissible summary card that gives students a
 * reason to return each week. Rendered only when the recapped week had
 * activity and hasn't been dismissed (see useWeeklyRecap).
 */
export function WeeklyRecapCard({ recap, onDismiss }: { recap: WeeklyRecap; onDismiss: () => void }) {
  const { cardsDeltaPct } = recap;
  const up = cardsDeltaPct !== null && cardsDeltaPct > 0;
  const down = cardsDeltaPct !== null && cardsDeltaPct < 0;

  const headline = up
    ? `Up ${cardsDeltaPct}% on cards vs the week before — nice momentum.`
    : down
      ? `A quieter week than usual. A short session or two gets you back on track.`
      : recap.prior.cards === 0
        ? `Your first full week of studying is in the books.`
        : `Steady as she goes — you held your pace from the week before.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={spring}
      className="relative overflow-hidden rounded-2xl bg-slate-900 p-5 sm:p-6"
      style={{ boxShadow: '0 20px 48px -22px rgba(15,23,42,0.5)' }}
    >
      {/* Ambient accents — same language as the study CTA */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#1E40AF]/40 blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-[#0D9488]/30 blur-2xl" />

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss weekly recap"
        className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10">
            <Sparkles className="h-3.5 w-3.5 text-[#5EEAD4]" />
          </span>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-white/50">
              Last week in review
            </p>
          </div>
          <span className="ml-auto mr-8 text-[12px] font-medium text-white/45">{recap.weekLabel}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat icon={Zap}          value={recap.recap.xp.toLocaleString()}    label="XP earned"      accent="bg-[#1E40AF]/25 text-[#93C5FD]" delay={0.05} />
          <div className="relative">
            <Stat icon={Brain}      value={recap.recap.cards.toLocaleString()} label="Cards reviewed" accent="bg-[#0D9488]/25 text-[#5EEAD4]" delay={0.1} />
            {cardsDeltaPct !== null && (up || down) && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...spring, delay: 0.28 }}
                className={cn(
                  'absolute right-0 top-0 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums',
                  up ? 'bg-emerald-400/15 text-emerald-300' : 'bg-orange-400/15 text-orange-300',
                )}
              >
                {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(cardsDeltaPct)}%
              </motion.span>
            )}
          </div>
          <Stat icon={CalendarCheck} value={`${recap.recap.activeDays}/7`}       label="Active days"    accent="bg-violet-500/25 text-violet-300" delay={0.15} />
          <Stat icon={Flame}         value={String(recap.streak)}                label="Day streak"     accent="bg-orange-500/25 text-orange-300" delay={0.2} />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.34, duration: 0.4 }}
          className="mt-4 text-[13px] leading-[1.5] text-white/70"
        >
          {headline}
        </motion.p>
      </div>
    </motion.div>
  );
}
