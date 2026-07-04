'use client';

import { Suspense, useCallback, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldCheck, AlertCircle, Sparkles, Brain, GraduationCap, Loader2, Check,
} from 'lucide-react';
import { FlashMingoLogo } from '@/components/brand/FlashMingoLogo';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────────────────────
   Motion — same spring language as the dashboard
   ───────────────────────────────────────────────────────────────────────────── */
const spring = { type: 'spring' as const, stiffness: 340, damping: 28 };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const rise = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { ...spring } },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Google icon
   ───────────────────────────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Error banner (needs Suspense for useSearchParams)
   ───────────────────────────────────────────────────────────────────────────── */
function LoginError() {
  const params = useSearchParams();
  const error = params.get('error');
  if (!error) return null;
  const messages: Record<string, string> = {
    auth_failed:   'Authentication failed. Please try again.',
    missing_code:  'Sign-in was cancelled. Please try again.',
    access_denied: 'Access denied. Use your school Google account.',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] leading-[1.5] text-red-700"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {messages[error] ?? 'An error occurred. Please try again.'}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Floating mini flashcards — the left-panel hero animation.
   Three cards drift gently on independent cycles. Transforms only (GPU).
   ───────────────────────────────────────────────────────────────────────────── */
const miniCards = [
  { subject: 'Biology', q: 'What is the powerhouse of the cell?', tone: '#5EEAD4', x: '4%',  y: '0%',   dur: 7,   delay: 0,   rotate: -3 },
  { subject: 'Spanish', q: '¿Cómo se dice “library”?',            tone: '#93C5FD', x: '38%', y: '38%',  dur: 8.5, delay: 0.8, rotate: 2  },
  { subject: 'History', q: 'When was the Constitution signed?',   tone: '#FCD34D', x: '12%', y: '66%',  dur: 7.8, delay: 1.6, rotate: -1.5 },
];

function FloatingCards() {
  return (
    <div className="relative h-[300px] w-full max-w-[400px]" aria-hidden>
      {miniCards.map((c, i) => (
        <motion.div
          key={c.subject}
          initial={{ opacity: 0, y: 24, rotate: c.rotate }}
          animate={{ opacity: 1, y: 0, rotate: c.rotate }}
          transition={{ ...spring, delay: 0.5 + i * 0.15 }}
          className="absolute w-[240px]"
          style={{ left: c.x, top: c.y }}
        >
          <motion.div
            animate={{ y: [0, -9, 0] }}
            transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md"
            style={{ boxShadow: '0 24px 48px -20px rgba(0,0,0,0.5)' }}
          >
            <span
              className="text-[10px] font-bold uppercase tracking-[0.1em]"
              style={{ color: c.tone }}
            >
              {c.subject}
            </span>
            <p className="mt-1.5 font-display text-[14.5px] font-bold leading-[1.35] tracking-[-0.01em] text-white">
              {c.q}
            </p>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Left panel — dark hero, same language as the landing's dark sections
   ───────────────────────────────────────────────────────────────────────────── */
function HeroPanel() {
  const year = new Date().getFullYear();

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--hx', `${e.clientX - r.left}px`);
    el.style.setProperty('--hy', `${e.clientY - r.top}px`);
  }, []);

  return (
    <div
      onMouseMove={onMove}
      className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-12 lg:flex"
    >
      {/* Dot grid — identical spec to landing dark CTA */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          WebkitMaskImage: 'radial-gradient(90% 90% at 50% 30%, #000, transparent 80%)',
          maskImage: 'radial-gradient(90% 90% at 50% 30%, #000, transparent 80%)',
        }}
      />
      {/* Aurora orbs — existing keyframes */}
      <div aria-hidden className="pointer-events-none absolute -left-24 top-0 h-96 w-96 animate-fm-aurora rounded-full bg-[#1E40AF]/25 blur-[100px] motion-reduce:animate-none" />
      <div aria-hidden className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 animate-fm-aurora-slow rounded-full bg-[#0D9488]/20 blur-[100px] motion-reduce:animate-none" />
      {/* Mouse-reactive light */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(420px circle at var(--hx, 60%) var(--hy, 40%), rgba(94,234,212,0.05), transparent 65%)',
        }}
      />

      {/* Top — logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.05 }}
        className="relative"
      >
        <FlashMingoLogo size="sm" />
      </motion.div>

      {/* Center — copy + floating cards */}
      <div className="relative">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.h2
            variants={rise}
            className="max-w-[420px] font-display text-[clamp(2.1rem,3.2vw,2.7rem)] font-bold leading-[1.08] tracking-[-0.03em] !text-white"
          >
            Learning that{' '}
            <span className="bg-gradient-to-r from-[#60A5FA] to-[#5EEAD4] bg-clip-text text-transparent">
              actually sticks.
            </span>
          </motion.h2>
          <motion.p variants={rise} className="mt-4 max-w-[360px] text-[15px] leading-[1.65] text-slate-400">
            AI-built decks, spaced repetition, and classroom tools in one place.
          </motion.p>
        </motion.div>

        <div className="mt-12">
          <FloatingCards />
        </div>
      </div>

      {/* Bottom */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="relative text-[12px] text-slate-500"
      >
        © {year} FlashMingo · FERPA &amp; COPPA compliant
      </motion.p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Trust chips
   ───────────────────────────────────────────────────────────────────────────── */
const trustItems = [
  { icon: ShieldCheck,   label: 'FERPA Compliant' },
  { icon: GraduationCap, label: 'Google Workspace' },
  { icon: Sparkles,      label: 'AI Flashcards' },
  { icon: Brain,         label: 'Spaced Repetition' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Right panel — the floating sign-in card
   ───────────────────────────────────────────────────────────────────────────── */
function SignInPanel() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithGoogle();
      // OAuth redirects away; if it doesn't (popup blocked etc.), reset.
      window.setTimeout(() => setLoading(false), 6000);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center bg-[#F8FAFC] p-8">
      {/* Faint dot grid to echo the landing hero */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(15,23,42,0.04) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          WebkitMaskImage: 'radial-gradient(80% 80% at 50% 40%, #000 30%, transparent 75%)',
          maskImage: 'radial-gradient(80% 80% at 50% 40%, #000 30%, transparent 75%)',
        }}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative w-full max-w-[400px]"
      >
        {/* Mobile-only logo (left panel hidden below lg) */}
        <motion.div variants={rise} className="mb-8 flex justify-center lg:hidden">
          <FlashMingoLogo size="sm" variant="dark" />
        </motion.div>

        {/* Heading */}
        <motion.div variants={rise} className="mb-7 text-center">
          <h1 className="font-display text-[26px] font-bold tracking-[-0.03em] text-slate-900">
            Welcome back
          </h1>
          <p className="mt-1.5 text-[14px] text-slate-500">
            Sign in with your school account to continue.
          </p>
        </motion.div>

        {/* Floating card */}
        <motion.div
          variants={rise}
          className="rounded-3xl border border-slate-200/80 bg-white/80 p-7 backdrop-blur-xl"
          style={{ boxShadow: '0 24px 64px -24px rgba(15,23,42,0.16), 0 2px 8px -2px rgba(15,23,42,0.05)' }}
        >
          <div className="flex flex-col gap-4">
            <Suspense fallback={null}>
              <LoginError />
            </Suspense>

            <motion.button
              type="button"
              onClick={handleSignIn}
              disabled={loading}
              whileHover={!loading ? { y: -2, boxShadow: '0 12px 28px -8px rgba(15,23,42,0.16)' } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              transition={spring}
              className={cn(
                'flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-[15px] font-semibold text-slate-800 transition-colors',
                loading ? 'cursor-wait opacity-80' : 'hover:border-slate-300',
              )}
              style={{ boxShadow: '0 1px 3px 0 rgba(15,23,42,0.06)' }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-[18px] w-[18px] animate-spin text-slate-400" />
                  Redirecting…
                </>
              ) : (
                <>
                  <GoogleIcon />
                  Continue with Google
                </>
              )}
            </motion.button>

            <p className="text-center text-[12px] leading-[1.6] text-slate-400">
              By signing in you agree to our{' '}
              <Link href="/terms" className="font-medium text-slate-500 underline decoration-slate-300 underline-offset-2 transition-colors hover:text-slate-900">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="font-medium text-slate-500 underline decoration-slate-300 underline-offset-2 transition-colors hover:text-slate-900">Privacy Policy</Link>.
            </p>
          </div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div variants={rise} className="mt-7 grid grid-cols-2 gap-x-6 gap-y-3 px-2">
          {trustItems.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0D9488]/10">
                <Icon className="h-3 w-3 text-[#0D9488]" />
              </span>
              <span className="text-[12.5px] font-medium text-slate-600">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div variants={rise} className="mt-8 flex items-center justify-center gap-1.5 text-[12px] text-slate-400">
          <Check className="h-3.5 w-3.5 text-[#0D9488]" />
          New accounts are approved by your district administrator.
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LoginExperience — the full page
   ───────────────────────────────────────────────────────────────────────────── */
export function LoginExperience() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="grid min-h-screen lg:grid-cols-2"
    >
      <HeroPanel />
      <SignInPanel />
    </motion.main>
  );
}
