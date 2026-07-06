'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#1E40AF', '#0D9488', '#F59E0B', '#5EEAD4', '#93C5FD'];

interface Piece {
  id: number;
  x: number;      // vw offset from center
  rotate: number;
  color: string;
  delay: number;
  duration: number;
  drift: number;  // horizontal drift during fall
}

/**
 * A single tasteful confetti burst — ~28 pieces falling from the top of the
 * viewport, done in pure Framer Motion transforms (no canvas, no external
 * dependency). Mount once, it plays and unmounts itself via `onDone`.
 */
export function Confetti({ onDone }: { onDone?: () => void }) {
  const pieces = useMemo<Piece[]>(() => (
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 70,
      rotate: Math.random() * 360,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 0.3,
      duration: 1.6 + Math.random() * 0.8,
      drift: (Math.random() - 0.5) * 120,
    }))
  ), []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: `calc(50vw + ${p.x}vw)`, y: '-5vh', opacity: 1, rotate: 0 }}
          animate={{
            y: '105vh',
            x: `calc(50vw + ${p.x}vw + ${p.drift}px)`,
            rotate: p.rotate,
            opacity: [1, 1, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          onAnimationComplete={p.id === pieces.length - 1 ? onDone : undefined}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 8,
            height: 8,
            borderRadius: p.id % 3 === 0 ? '50%' : 2,
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}
