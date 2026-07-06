'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { Confetti } from '@/components/gamification/Confetti';
import { gamificationIcon } from '@/components/gamification/icons';
import { cn } from '@/lib/utils';
import type { NewAchievement, QuestProgress } from '@/lib/types/gamification';

const spring = { type: 'spring' as const, stiffness: 340, damping: 28 };

export type Celebration =
  | { kind: 'achievement'; achievement: NewAchievement }
  | { kind: 'quest'; quest: QuestProgress }
  | { kind: 'levelUp'; level: number };

const TIER_STYLE: Record<'bronze' | 'silver' | 'gold', string> = {
  bronze: 'bg-orange-50 text-orange-600',
  silver: 'bg-slate-100 text-slate-600',
  gold: 'bg-amber-50 text-amber-500',
};

/**
 * Bottom-center celebration toasts. Feed it a queue of celebrations; it
 * shows them one at a time (4s each) with a confetti burst for gold
 * achievements and level-ups. Purely presentational — the parent owns the
 * queue so different pages can source celebrations differently.
 */
export function CelebrationToasts({ queue, onDrain }: {
  queue: Celebration[];
  onDrain?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const current: Celebration | undefined = queue[index];

  useEffect(() => { setIndex(0); }, [queue]);

  useEffect(() => {
    if (!current) { if (queue.length > 0) onDrain?.(); return; }
    const t = window.setTimeout(() => setIndex((i) => i + 1), 4000);
    return () => window.clearTimeout(t);
  }, [current, queue.length, onDrain]);

  if (!current) return null;

  const bigMoment =
    current.kind === 'levelUp' ||
    (current.kind === 'achievement' && current.achievement.tier === 'gold');

  let icon: React.ReactNode;
  let eyebrow: string;
  let title: string;
  let detail: string;

  if (current.kind === 'achievement') {
    const Icon = gamificationIcon(current.achievement.icon);
    icon = (
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', TIER_STYLE[current.achievement.tier])}>
        <Icon className="h-5 w-5" />
      </span>
    );
    eyebrow = 'Achievement unlocked';
    title = current.achievement.title;
    detail = `${current.achievement.description} · +${current.achievement.xpReward} XP`;
  } else if (current.kind === 'quest') {
    const Icon = gamificationIcon(current.quest.icon);
    icon = (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0D9488]/10 text-[#0D9488]">
        <Icon className="h-5 w-5" />
      </span>
    );
    eyebrow = current.quest.period === 'daily' ? 'Daily quest complete' : 'Weekly quest complete';
    title = current.quest.title;
    detail = `+${current.quest.xpReward} XP`;
  } else {
    icon = (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E40AF] text-white">
        <ChevronUp className="h-5 w-5" />
      </span>
    );
    eyebrow = 'Level up';
    title = `Level ${current.level}`;
    detail = 'Keep the streak going.';
  }

  return (
    <>
      {bigMoment && <Confetti key={`confetti-${index}`} />}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={spring}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_24px_56px_-20px_rgba(15,23,42,0.28)] backdrop-blur-xl"
          >
            {icon}
            <div className="min-w-0">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">{eyebrow}</p>
              <p className="truncate font-display text-[15px] font-bold tracking-[-0.01em] text-slate-900">{title}</p>
              <p className="truncate text-[12px] text-slate-500">{detail}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
