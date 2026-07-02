'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Brain, Sparkles, Users, LineChart, ShieldCheck,
  GraduationCap, Lock, FileText, Mail, Check, ArrowRight,
  Plus, Minus, ShieldQuestion, RotateCcw, CheckCircle2,
} from 'lucide-react';
import { FlashMingoLogo } from '@/components/brand/FlashMingoLogo';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/* ══════════════════════════════════════════════════════════════════════════
   Brand tokens (white-first)
   ink   #0F172A   body #475569   muted #94A3B8
   blue  #1E40AF   teal #0D9488   line #E8EBF0   wash #F7F9FC
   ═════════════════════════════════════════════════════════════════════════ */

/* ────────────────────────────── Content ──────────────────────────────── */
const trustBadges = [
  'FERPA', 'COPPA', 'Google for Education', 'Microsoft Entra', 'ClassLink', 'Clever',
];

const narrative = [
  {
    n: '01',
    tone: 'blue' as const,
    icon: Brain,
    title: 'Learning that adapts to memory',
    body: 'FlashMingo schedules every card with the SM-2 algorithm — the science behind Anki. Students review exactly what they\'re about to forget, and nothing they already know.',
  },
  {
    n: '02',
    tone: 'teal' as const,
    icon: Sparkles,
    title: 'Decks built in seconds, not evenings',
    body: 'Teachers describe a topic and FlashMingo drafts a complete, structured deck. Edit, publish to a class, or share across the district library — all in a few clicks.',
  },
  {
    n: '03',
    tone: 'blue' as const,
    icon: LineChart,
    title: 'Progress you can actually act on',
    body: 'A PowerSchool-clean dashboard surfaces streaks, accuracy, and who\'s falling behind — so intervention happens in week one, not at the report card.',
  },
];

const roles = [
  {
    key: 'student',
    label: 'Students',
    icon: GraduationCap,
    heading: 'A calm place to actually learn',
    points: ['AI-built decks in seconds', 'Spaced-repetition review sessions', 'Streaks, activity, and opt-in leaderboards'],
  },
  {
    key: 'teacher',
    label: 'Teachers',
    icon: Users,
    heading: 'Run classrooms without the busywork',
    points: ['Create classrooms & enrol by code', 'Live per-student progress dashboard', 'Publish decks to the district library'],
  },
  {
    key: 'admin',
    label: 'Administrators',
    icon: ShieldCheck,
    heading: 'District control, fully auditable',
    points: ['Approve accounts & manage roles', 'Immutable, timestamped audit log', 'District-scoped data isolation'],
  },
] as const;

const securityPoints = [
  { icon: Lock,      title: 'Google & Microsoft SSO', desc: 'No passwords to manage, reset, or breach. Sign in with the account the district already trusts.' },
  { icon: ShieldCheck, title: 'FERPA & COPPA aligned', desc: 'Student records are never sold, shared, or used for advertising. Ever.' },
  { icon: FileText,  title: 'Immutable audit log', desc: 'Every privileged action is logged with an actor and timestamp — no deletes, no edits.' },
  { icon: Users,     title: 'District data isolation', desc: 'Row-level security enforces strict per-district boundaries at the database.' },
];

const freeFeatures = ['Unlimited personal decks', 'AI deck generation', 'Spaced-repetition engine', 'Join classrooms'];
const districtFeatures = ['Everything in Free', 'Admin dashboard & approvals', 'Immutable audit logs', 'District deck library', 'SSO + priority support & DPA'];

const faqs = [
  { q: 'Is FlashMingo FERPA compliant?', a: 'Yes. FlashMingo is built as a school-official under FERPA. Student data is never sold, shared, or used for advertising, and a signed DPA is available for districts.' },
  { q: 'Do students need a separate password?', a: 'No. Everyone signs in with their existing Google Workspace or Microsoft school account. There are no FlashMingo passwords to manage or leak.' },
  { q: 'How does account approval work?', a: 'New accounts start as “pending” until a district administrator approves them. Nobody sees student data before an admin grants access.' },
  { q: 'What is spaced repetition?', a: 'A proven technique that reviews material at growing intervals timed to memory. FlashMingo uses SM-2 — the same algorithm behind Anki.' },
  { q: 'Is there a mobile experience?', a: 'FlashMingo is a fully responsive web app that works beautifully on Chromebooks, tablets, and phones. A native app is on the roadmap.' },
];

/* ══════════════════════════════════════════════════════════════════════════
   Motion primitives
   ═════════════════════════════════════════════════════════════════════════ */

/** Fade + rise on scroll into view, with optional stagger index. */
function Reveal({
  children, index = 0, className, as: Tag = 'div',
}: {
  children: React.ReactNode; index?: number; className?: string;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window) ||
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        transition: 'opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1)',
        transitionDelay: `${Math.min(index, 8) * 80}ms`,
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(22px)',
        willChange: shown ? undefined : 'opacity, transform',
      }}
    >
      {children}
    </Tag>
  );
}

/** Animated count-up when scrolled into view. */
function Counter({ to, suffix = '', duration = 1400 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setVal(to); return; }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(to * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/** Subtle magnetic pull toward the cursor. */
function Magnetic({ children, className, strength = 0.35 }: {
  children: React.ReactNode; className?: string; strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  }, [strength]);
  const reset = useCallback(() => {
    const el = ref.current; if (el) el.style.transform = 'translate(0,0)';
  }, []);
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={className}
      style={{ transition: 'transform .35s cubic-bezier(.16,1,.3,1)', display: 'inline-block' }}
    >
      {children}
    </div>
  );
}

/** Nav link with an underline that grows from the left. */
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="group relative py-1 text-[13.5px] font-medium text-slate-500 transition-colors hover:text-slate-900">
      {children}
      <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-slate-900 transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100" />
    </a>
  );
}

/** Thin gradient beam at the very top that tracks scroll progress. */
function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? h.scrollTop / max : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-[2px] bg-transparent">
      <div
        className="h-full origin-left bg-gradient-to-r from-[#1E40AF] via-[#3B82F6] to-[#0D9488]"
        style={{ transform: `scaleX(${p})`, transition: 'transform .1s linear' }}
      />
    </div>
  );
}

/**
 * Card wrapper with a cursor-tracked radial glow (Linear/Vercel style) and a
 * subtle lift. The glow lives in a `::before`-like overlay driven by CSS vars.
 */
function Spotlight({
  children, className, glow = 'rgba(30,64,175,0.10)',
}: {
  children: React.ReactNode; className?: string; glow?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
    el.style.setProperty('--o', '1');
  }, []);
  const onLeave = useCallback(() => {
    ref.current?.style.setProperty('--o', '0');
  }, []);
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn('group/spot relative overflow-hidden', className)}
      style={{ ['--o' as string]: '0' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: 'var(--o)',
          background: `radial-gradient(340px circle at var(--mx) var(--my), ${glow}, transparent 70%)`,
        }}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

function Eyebrow({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'teal' }) {
  return (
    <div className="mb-4 inline-flex items-center gap-2">
      <span className={cn('h-1.5 w-1.5 rounded-full', tone === 'blue' ? 'bg-[#1E40AF]' : 'bg-[#0D9488]')} />
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{children}</span>
    </div>
  );
}

const toneTile = (tone: 'blue' | 'teal') =>
  tone === 'blue' ? 'bg-[#1E40AF]/8 text-[#1E40AF]' : 'bg-[#0D9488]/10 text-[#0D9488]';

/* ────────────────────────── Hero product demo ────────────────────────── */
/** A real, playable review session — flip, rate, watch scheduling happen. */
const demoCards = [
  { subject: 'Biology',  tone: 'teal' as const, q: 'What is the powerhouse of the cell?', a: 'The mitochondria', detail: 'Generates the cell’s chemical energy (ATP) through respiration.' },
  { subject: 'Spanish',  tone: 'blue' as const, q: '¿Cómo se dice “library”?', a: 'La biblioteca', detail: '“Librería” means bookstore — a classic false friend.' },
  { subject: 'History',  tone: 'teal' as const, q: 'In what year was the U.S. Constitution signed?', a: '1787', detail: 'September 17, 1787, in Philadelphia.' },
];

const ratings = [
  { label: 'Again', interval: '10 min',  cls: 'text-red-600 border-red-200 hover:bg-red-50' },
  { label: 'Hard',  interval: '1 day',   cls: 'text-orange-600 border-orange-200 hover:bg-orange-50' },
  { label: 'Good',  interval: '3 days',  cls: 'text-[#1E40AF] border-blue-200 hover:bg-blue-50' },
  { label: 'Easy',  interval: '6 days',  cls: 'text-white bg-[#0D9488] border-[#0D9488] hover:bg-[#0B857A]' },
];

function HeroCard() {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [chip, setChip] = useState<{ text: string; id: number } | null>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  const card = demoCards[idx];

  /* subtle 3D cursor tilt */
  const onTilt = useCallback((e: React.MouseEvent) => {
    const el = tiltRef.current; if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -7;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 9;
    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  }, []);
  const resetTilt = useCallback(() => {
    if (tiltRef.current) tiltRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
  }, []);

  const rate = (interval: string) => {
    setChip({ text: `Next review · ${interval}`, id: Date.now() });
    setFlipped(false);
    window.setTimeout(() => {
      if (idx + 1 >= demoCards.length) setDone(true);
      else setIdx((i) => i + 1);
    }, 380);
    window.setTimeout(() => setChip(null), 1900);
  };

  const restart = () => { setDone(false); setIdx(0); setFlipped(false); setChip(null); };

  return (
    <div className="relative w-[370px] max-w-full select-none">
      {/* ambient glow + deck stack */}
      <div aria-hidden className="absolute inset-x-6 top-10 h-64 rounded-[28px] bg-[#1E40AF]/10 blur-2xl" />
      <div aria-hidden className="absolute left-5 right-[-14px] top-[22px] h-64 rounded-[22px] border border-slate-200/80 bg-white/70" />
      <div aria-hidden className="absolute left-2.5 right-[-6px] top-[13px] h-64 rounded-[22px] border border-slate-200 bg-white shadow-[0_10px_30px_-18px_rgba(15,23,42,0.25)]" />

      {/* progress dots */}
      <div className="relative z-[2] mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          {demoCards.map((_, i) => (
            <span key={i} className={cn(
              'h-1.5 rounded-full transition-all duration-500',
              done || i < idx ? 'w-5 bg-[#0D9488]' : i === idx ? 'w-5 bg-[#1E40AF]' : 'w-1.5 bg-slate-200',
            )} />
          ))}
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Live demo
        </span>
      </div>

      {/* scheduling chip */}
      {chip && (
        <div key={chip.id} className="pointer-events-none absolute -top-8 right-0 z-[3] animate-fade-in-up">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-lg">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5EEAD4]" />
            {chip.text}
          </span>
        </div>
      )}

      {/* tilt layer */}
      <div className="relative [perspective:1600px]" onMouseMove={onTilt} onMouseLeave={resetTilt}>
        <div ref={tiltRef} style={{ transition: 'transform .3s cubic-bezier(.16,1,.3,1)', transformStyle: 'preserve-3d' }}>
          {done ? (
            /* session complete */
            <div className="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-[22px] border border-slate-200 bg-white p-6 text-center shadow-[0_28px_60px_-28px_rgba(15,23,42,0.32)]" style={{ animation: 'scale-in .35s cubic-bezier(.16,1,.3,1)' }}>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0D9488]/10">
                <CheckCircle2 className="h-6 w-6 text-[#0D9488]" />
              </span>
              <p className="font-display text-[21px] font-bold tracking-[-0.02em] text-slate-900">Session complete</p>
              <p className="max-w-[240px] text-[13px] leading-[1.5] text-slate-500">
                Every card returns right before you&apos;d forget it. That&apos;s the whole trick.
              </p>
              <button onClick={restart} className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1E40AF] transition-colors hover:text-[#1B3A9E]">
                <RotateCcw className="h-3.5 w-3.5" /> Study again
              </button>
            </div>
          ) : (
            /* flip card */
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              aria-label={flipped ? 'Show question' : 'Reveal answer'}
              className="relative block h-64 w-full cursor-pointer text-left [transform-style:preserve-3d] focus-visible:outline-none"
              style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform .65s cubic-bezier(.16,1,.3,1)' }}
            >
              {/* front */}
              <div key={`f-${idx}`} className="absolute inset-0 flex flex-col rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_28px_60px_-28px_rgba(15,23,42,0.32)] [backface-visibility:hidden]" style={{ animation: 'scale-in .4s cubic-bezier(.16,1,.3,1)' }}>
                <div className="flex items-center justify-between">
                  <span className={cn('rounded-md px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em]', card.tone === 'teal' ? 'bg-[#0D9488]/10 text-[#0D9488]' : 'bg-[#1E40AF]/8 text-[#1E40AF]')}>{card.subject}</span>
                  <span className="text-xs font-medium text-slate-400">Card {idx + 1} · {demoCards.length}</span>
                </div>
                <div className="flex flex-1 items-center">
                  <p className="font-display text-[23px] font-bold leading-[1.22] tracking-[-0.02em] text-slate-900">{card.q}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-fm-pulse-ring rounded-full bg-[#1E40AF]/50" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#1E40AF]" />
                  </span>
                  Click to reveal the answer
                </div>
              </div>
              {/* back */}
              <div className="absolute inset-0 flex flex-col rounded-[22px] border border-[#1E40AF] bg-[#1E40AF] p-6 text-white shadow-[0_28px_60px_-24px_rgba(30,64,175,0.55)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#5EEAD4]">Answer</span>
                <div className="flex flex-1 flex-col justify-center gap-2">
                  <p className="font-display text-[26px] font-bold leading-[1.15] tracking-[-0.02em]">{card.a}</p>
                  <p className="text-[13px] leading-[1.55] text-white/70">{card.detail}</p>
                </div>
                <p className="text-[11.5px] text-white/50">How well did you know it?</p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* rating row — live buttons */}
      <div className={cn('mt-4 grid grid-cols-4 gap-2 transition-all duration-300', (!flipped || done) && 'pointer-events-none opacity-40')}>
        {ratings.map(({ label, interval, cls }) => (
          <button
            key={label}
            type="button"
            onClick={() => rate(interval)}
            className={cn('rounded-lg border bg-white py-2 text-center text-xs font-semibold transition-all duration-150 active:scale-95', cls)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-[11.5px] text-slate-400">
        This isn&apos;t a mockup — flip the card and rate yourself.
      </p>
    </div>
  );
}

/* ─────────────────── Spaced-repetition memory diagram ─────────────────── */
function MemoryDiagram() {
  const ref = useRef<SVGSVGElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // review points along the timeline where memory is "topped up"
  const reviews = [
    { x: 70,  d: 'Day 1' },
    { x: 200, d: 'Day 3' },
    { x: 360, d: 'Day 8' },
    { x: 560, d: 'Day 21' },
  ];

  return (
    <svg ref={ref} viewBox="0 0 660 260" className="w-full" role="img" aria-label="Spaced repetition memory curve">
      {/* baseline */}
      <line x1="30" y1="210" x2="640" y2="210" stroke="#E8EBF0" strokeWidth="1.5" />
      <text x="30" y="234" className="fill-slate-400" fontSize="11" fontWeight="500">Time →</text>

      {/* forgetting curves that decay then get refreshed at each review */}
      {reviews.map((r, i) => {
        const next = reviews[i + 1]?.x ?? 640;
        return (
          <path
            key={i}
            d={`M ${r.x} 60 C ${r.x + (next - r.x) * 0.4} 70, ${r.x + (next - r.x) * 0.55} 200, ${next} 205`}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="2"
            strokeDasharray="4 5"
            style={{
              opacity: on ? 0.9 : 0,
              transition: `opacity .5s ease ${i * 220 + 300}ms`,
            }}
          />
        );
      })}

      {/* the retained-knowledge rising staircase */}
      <path
        d="M 70 60 L 200 60 L 200 45 L 360 45 L 360 33 L 560 33 L 560 25"
        fill="none"
        stroke="#1E40AF"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{
          strokeDasharray: 900,
          strokeDashoffset: on ? 0 : 900,
          transition: 'stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1) .2s',
        }}
      />

      {/* review markers */}
      {reviews.map((r, i) => {
        const y = [60, 60, 45, 33][i];
        return (
          <g key={r.d} style={{ opacity: on ? 1 : 0, transition: `opacity .4s ease ${i * 200 + 700}ms` }}>
            <line x1={r.x} y1={y} x2={r.x} y2="210" stroke="#0D9488" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.4" />
            <circle cx={r.x} cy={y} r="6.5" fill="white" stroke="#0D9488" strokeWidth="3" />
            <text x={r.x} y="230" textAnchor="middle" className="fill-slate-500" fontSize="11" fontWeight="600">{r.d}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ───────────────────────── AI forge live demo ────────────────────────── */
const forgeTopics = [
  {
    prompt: 'Photosynthesis — 8th grade',
    tag: 'Biology',
    cards: ['What are the two stages of photosynthesis?', 'Where does the Calvin cycle take place?', 'Which gas do plants absorb from the air?', 'Chlorophyll absorbs which colors of light?'],
  },
  {
    prompt: 'The French Revolution',
    tag: 'History',
    cards: ['What happened on July 14, 1789?', 'Who was the last king of France?', 'What was the Reign of Terror?', 'Who made up the Third Estate?'],
  },
  {
    prompt: 'Spanish irregular verbs',
    tag: 'Spanish',
    cards: ['Conjugate “ser” in the yo form', '“Ir” in the preterite — ellos', 'What does “tener que” mean?', 'Conjugate “estar” — nosotros'],
  },
];

function AiForge() {
  const [tIdx, setTIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [showCards, setShowCards] = useState(false);
  const topic = forgeTopics[tIdx];

  useEffect(() => {
    let alive = true;
    const timers: number[] = [];
    setTyped('');
    setShowCards(false);
    let i = 0;
    const type = window.setInterval(() => {
      if (!alive) return;
      i++;
      setTyped(topic.prompt.slice(0, i));
      if (i >= topic.prompt.length) {
        window.clearInterval(type);
        timers.push(window.setTimeout(() => { if (alive) setShowCards(true); }, 420));
        timers.push(window.setTimeout(() => { if (alive) setTIdx((x) => (x + 1) % forgeTopics.length); }, 4600));
      }
    }, 52);
    return () => { alive = false; window.clearInterval(type); timers.forEach(window.clearTimeout); };
  }, [tIdx, topic.prompt]);

  return (
    <div className="relative">
      {/* input mock */}
      <div className="relative z-[1] flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)]">
        <span className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E40AF] to-[#0D9488] text-white transition-transform duration-500',
          showCards && 'scale-110',
        )}>
          <Sparkles className="h-4 w-4" />
        </span>
        <p className="flex-1 truncate font-mono text-[14.5px] text-slate-800">
          {typed}
          <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-pulse bg-[#1E40AF]" />
        </p>
        <span className={cn(
          'shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all duration-300',
          showCards ? 'bg-[#0D9488]/10 text-[#0D9488]' : 'bg-slate-100 text-slate-400',
        )}>
          {showCards ? '✓ 24 cards' : 'Generating…'}
        </span>
      </div>

      {/* generated cards */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {topic.cards.map((q, i) => (
          <div
            key={`${tIdx}-${i}`}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            style={{
              opacity: showCards ? 1 : 0,
              transform: showCards ? 'none' : 'translateY(14px) scale(.97)',
              transition: `opacity .5s cubic-bezier(.16,1,.3,1) ${i * 110}ms, transform .5s cubic-bezier(.16,1,.3,1) ${i * 110}ms`,
            }}
          >
            <span className="mb-2 inline-block rounded bg-[#1E40AF]/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#1E40AF]">{topic.tag}</span>
            <p className="text-[13.5px] font-medium leading-[1.45] text-slate-800">{q}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── Accordion item ──────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200/80">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-6 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-[15px] font-semibold text-slate-900">{q}</span>
        <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors', open && 'border-[#1E40AF] bg-[#1E40AF] text-white')}>
          {open ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        </span>
      </button>
      <div
        className="grid transition-all duration-400 ease-[cubic-bezier(.16,1,.3,1)]"
        style={{ gridTemplateRows: open ? '1fr' : '0fr', opacity: open ? 1 : 0 }}
      >
        <div className="overflow-hidden">
          <p className="max-w-[600px] pb-5 text-[14px] leading-[1.6] text-slate-500">{a}</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Page
   ═════════════════════════════════════════════════════════════════════════ */
export function LandingPage() {
  const year = new Date().getFullYear();
  const [scrolled, setScrolled] = useState(false);
  const [activeRole, setActiveRole] = useState(0);
  const [demoForm, setDemoForm] = useState({ name: '', email: '', school: '', useCase: '' });
  const [demoStatus, setDemoStatus] = useState<string | null>(null);
  const [demoSubmitting, setDemoSubmitting] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitting(true);
    setDemoStatus(null);
    try {
      const res = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoForm),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? 'Unable to submit demo request.');
      setDemoStatus('Thanks — your request is in. We\'ll be in touch within one business day.');
      setDemoForm({ name: '', email: '', school: '', useCase: '' });
    } catch (error) {
      setDemoStatus(error instanceof Error ? error.message : 'Unable to submit demo request.');
    } finally {
      setDemoSubmitting(false);
    }
  };

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-shadow focus:border-[#1E40AF] focus:outline-none focus:ring-4 focus:ring-[#1E40AF]/10';

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-white font-sans text-slate-900 antialiased"
      onMouseMove={(e) => {
        const t = e.currentTarget;
        t.style.setProperty('--cx', `${e.clientX}px`);
        t.style.setProperty('--cy', `${e.clientY}px`);
      }}
    >
      <ScrollProgress />

      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <header className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled ? 'border-b border-slate-200/80 bg-white/80 backdrop-blur-xl' : 'border-b border-transparent bg-white/0',
      )}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <FlashMingoLogo size="sm" variant="dark" />
          <nav className="hidden items-center gap-8 md:flex">
            <NavLink href="#why">Why FlashMingo</NavLink>
            <NavLink href="#roles">Product</NavLink>
            <NavLink href="#security">Security</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
          </nav>
          <div className="flex items-center gap-2.5">
            <Button asChild variant="ghost" size="sm" className="h-9 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Magnetic>
              <Button asChild size="sm" className="h-9 rounded-lg bg-[#1E40AF] px-4 shadow-sm transition-shadow hover:bg-[#1B3A9E] hover:shadow-md">
                <a href="#demo">Request a demo</a>
              </Button>
            </Magnetic>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* precise dot grid, radially masked */}
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(15,23,42,0.05) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            WebkitMaskImage: 'radial-gradient(120% 80% at 70% 20%, #000 30%, transparent 78%)',
            maskImage: 'radial-gradient(120% 80% at 70% 20%, #000 30%, transparent 78%)',
          }}
        />
        {/* cursor-tracked spotlight (fixed so it follows across the hero) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{
            background: 'radial-gradient(500px circle at var(--cx,70%) var(--cy,30%), rgba(30,64,175,0.08), transparent 60%)',
          }}
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 pb-24 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
          <div>
            <Reveal>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 py-1.5 pl-1.5 pr-3.5 shadow-sm backdrop-blur">
                <span className="rounded-full bg-[#0D9488]/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#0D9488]">New</span>
                <span className="text-[13px] font-medium text-slate-600">AI deck generation, now for every teacher</span>
              </div>
            </Reveal>
            <h1 className="max-w-[560px] text-balance font-display text-[clamp(2.6rem,5.4vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-slate-900">
              {['The', 'flashcard', 'platform'].map((w, i) => (
                <span key={w} className="inline-block" style={{ animation: `fade-in-up .9s cubic-bezier(.16,1,.3,1) ${i * 90}ms both` }}>
                  {w}&nbsp;
                </span>
              ))}
              <br className="hidden sm:block" />
              {['schools', 'can'].map((w, i) => (
                <span key={w} className="inline-block" style={{ animation: `fade-in-up .9s cubic-bezier(.16,1,.3,1) ${(i + 3) * 90}ms both` }}>
                  {w}&nbsp;
                </span>
              ))}
              <span className="inline-block bg-gradient-to-r from-[#1E40AF] to-[#0D9488] bg-clip-text text-transparent" style={{ animation: `fade-in-up .9s cubic-bezier(.16,1,.3,1) 450ms both` }}>
                trust
              </span>
              <span className="inline-block" style={{ animation: `fade-in-up .9s cubic-bezier(.16,1,.3,1) 500ms both` }}>.</span>
            </h1>
            <Reveal index={2}>
              <p className="mt-6 max-w-[440px] text-[18px] leading-[1.6] text-slate-500">
                Spaced repetition, AI-built decks, and district-grade controls — in one calm, privacy-first platform for K–12.
              </p>
            </Reveal>
            <Reveal index={3}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Magnetic strength={0.25}>
                  <Button asChild size="lg" className="group h-12 rounded-xl bg-[#1E40AF] px-6 text-[15px] shadow-sm transition-all hover:bg-[#1B3A9E] hover:shadow-lg">
                    <Link href="/auth/login">
                      <GraduationCap className="h-[18px] w-[18px]" />
                      Sign in with Google
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </Magnetic>
                <Button asChild variant="outline" size="lg" className="h-12 rounded-xl border-slate-200 bg-white px-6 text-[15px] text-slate-700 hover:bg-slate-50">
                  <a href="#demo">Request a demo</a>
                </Button>
              </div>
            </Reveal>
            <Reveal index={4}>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px] text-slate-500">
                {['FERPA compliant', 'Google & Microsoft SSO', 'No credit card'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-[#0D9488] [stroke-width:2.5]" />{t}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
          <Reveal index={2} className="flex justify-center lg:justify-end">
            <HeroCard />
          </Reveal>
        </div>
      </section>

      {/* ── Trust marquee ─────────────────────────────────────────────── */}
      <section className="border-y border-slate-200/70 bg-[#F7F9FC] py-8">
        <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Built for the standards districts require
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <div className="flex w-max animate-fm-marquee items-center gap-14 pr-14">
            {[...trustBadges, ...trustBadges].map((b, i) => (
              <span key={i} className="whitespace-nowrap font-display text-[17px] font-bold tracking-tight text-slate-400">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── The science ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="mb-10">
          <Eyebrow>The science</Eyebrow>
          <h2 className="max-w-xl text-balance font-display text-[clamp(1.6rem,2.8vw,2.1rem)] font-bold leading-[1.15] tracking-[-0.03em] text-slate-900">
            Flashcards aren&apos;t a trend. They&apos;re 140 years of memory research.
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { n: <>1885</>, l: 'Ebbinghaus maps the forgetting curve — the science FlashMingo runs on' },
            { n: <><Counter to={70} suffix="%" /></>, l: 'of new material is forgotten within 24 hours without review' },
            { n: <>2×</>, l: 'better long-term retention from spaced practice vs. cramming' },
            { n: <><Counter to={50} suffix="%+" /></>, l: 'stronger recall from active testing vs. re-reading notes' },
          ].map((stat, i) => (
            <Reveal key={i} index={i} className="text-center md:text-left">
              <div className="font-display text-[44px] font-extrabold tracking-[-0.03em] text-slate-900">{stat.n}</div>
              <p className="mt-1 text-[13.5px] leading-[1.5] text-slate-500">{stat.l}</p>
            </Reveal>
          ))}
        </div>
        <Reveal index={4}>
          <p className="mt-10 text-[11.5px] text-slate-400">
            Ebbinghaus (1885) · Cepeda et&nbsp;al., Psychological Bulletin (2006) · Roediger &amp; Karpicke, Psychological Science (2006)
          </p>
        </Reveal>
      </section>

      {/* ── Why FlashMingo — narrative ────────────────────────────────── */}
      <section id="why" className="border-t border-slate-200/70 bg-[#F7F9FC] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-16 max-w-2xl">
            <Eyebrow>Why FlashMingo</Eyebrow>
            <h2 className="text-balance font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.03em] text-slate-900">
              Not another study app. A system for how learning actually works.
            </h2>
          </Reveal>
          <div className="flex flex-col gap-4">
            {narrative.map(({ n, tone, icon: Icon, title, body }, i) => (
              <Reveal key={n} index={i}>
                <Spotlight
                  glow={tone === 'blue' ? 'rgba(30,64,175,0.10)' : 'rgba(13,148,136,0.10)'}
                  className="group grid grid-cols-1 items-center gap-6 rounded-3xl border border-slate-200/80 bg-white p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_20px_50px_-30px_rgba(15,23,42,0.3)] md:grid-cols-[auto_1fr_auto]"
                >
                  <span className={cn('font-display text-[40px] font-extrabold tabular-nums tracking-tight', tone === 'blue' ? 'text-[#1E40AF]/15' : 'text-[#0D9488]/20')}>{n}</span>
                  <div className="max-w-xl">
                    <h3 className="mb-1.5 font-display text-[21px] font-bold tracking-[-0.02em] text-slate-900">{title}</h3>
                    <p className="text-[15px] leading-[1.6] text-slate-500">{body}</p>
                  </div>
                  <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105', toneTile(tone))}>
                    <Icon className="h-6 w-6" />
                  </div>
                </Spotlight>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI forge — decks build themselves ─────────────────────────── */}
      <section className="relative overflow-hidden py-24">
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(15,23,42,0.04) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            WebkitMaskImage: 'radial-gradient(90% 90% at 50% 50%, #000 40%, transparent 80%)',
            maskImage: 'radial-gradient(90% 90% at 50% 50%, #000 40%, transparent 80%)',
          }}
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <Eyebrow tone="teal">AI deck generation</Eyebrow>
            <h2 className="mb-5 text-balance font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.03em] text-slate-900">
              Type a topic.
              <br />Watch the deck build itself.
            </h2>
            <p className="max-w-sm text-[15px] leading-[1.65] text-slate-500">
              Teachers describe what the class is studying — FlashMingo drafts a complete, structured deck in seconds. Edit anything, then publish to your classroom or the district library.
            </p>
            <ul className="mt-7 flex flex-col gap-3">
              {['Age- and grade-appropriate wording', 'Every card fully editable before publishing', 'Free for individual teachers'].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-[14px] text-slate-700">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0D9488]/10">
                    <Check className="h-3 w-3 text-[#0D9488] [stroke-width:3]" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal index={1}>
            <AiForge />
          </Reveal>
        </div>
      </section>

      {/* ── Product showcase — role switcher ──────────────────────────── */}
      <section id="roles" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-12 text-center">
            <Eyebrow tone="teal">The product</Eyebrow>
            <h2 className="mx-auto max-w-2xl text-balance font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.03em] text-slate-900">
              One platform, shaped for every role
            </h2>
          </Reveal>

          {/* segmented control */}
          <Reveal className="mb-10 flex justify-center">
            <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
              {roles.map((r, i) => (
                <button
                  key={r.key}
                  onClick={() => setActiveRole(i)}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-medium transition-all duration-300',
                    activeRole === i ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800',
                  )}
                >
                  <r.icon className="h-4 w-4" />
                  {r.label}
                </button>
              ))}
            </div>
          </Reveal>

          {/* panel */}
          <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-b from-white to-[#F7F9FC] p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.3)] md:p-12">
            <div key={activeRole} className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2" style={{ animation: 'fade-in-up .5s cubic-bezier(.16,1,.3,1)' }}>
              <div>
                <div className={cn('mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl', toneTile(activeRole === 1 ? 'teal' : 'blue'))}>
                  {(() => { const I = roles[activeRole].icon; return <I className="h-5.5 w-5.5" />; })()}
                </div>
                <h3 className="mb-5 font-display text-[26px] font-bold tracking-[-0.02em] text-slate-900">{roles[activeRole].heading}</h3>
                <ul className="flex flex-col gap-3.5">
                  {roles[activeRole].points.map((p) => (
                    <li key={p} className="flex items-center gap-3 text-[15px] text-slate-700">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0D9488]/10">
                        <Check className="h-3 w-3 text-[#0D9488] [stroke-width:3]" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              {/* stylised UI mock */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                </div>
                <div className="space-y-3">
                  <div className="h-3 w-2/5 rounded-full bg-slate-200" />
                  {[0, 1, 2].map((r) => (
                    <div key={r} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                      <div className={cn('h-8 w-8 shrink-0 rounded-lg', r === 0 ? 'bg-[#1E40AF]/15' : r === 1 ? 'bg-[#0D9488]/15' : 'bg-slate-200')} />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 w-3/4 rounded-full bg-slate-200" />
                        <div className="h-2 w-1/2 rounded-full bg-slate-100" />
                      </div>
                      <div className="h-6 w-12 rounded-md bg-slate-100" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Learning intelligence — memory diagram ────────────────────── */}
      <section className="relative overflow-hidden border-y border-slate-200/70 bg-slate-900 py-24 text-white">
        {/* drifting aurora */}
        <div aria-hidden className="pointer-events-none absolute -left-24 top-0 h-96 w-96 animate-fm-aurora rounded-full bg-[#1E40AF]/25 blur-[100px] motion-reduce:animate-none" />
        <div aria-hidden className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 animate-fm-aurora-slow rounded-full bg-[#0D9488]/20 blur-[100px] motion-reduce:animate-none" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="mb-4 inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5EEAD4]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Learning intelligence</span>
            </div>
            <h2 className="mb-5 text-balance font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.03em]">
              We show each card right before it fades.
            </h2>
            <p className="max-w-md text-[15px] leading-[1.65] text-slate-300">
              Every review resets the forgetting curve. FlashMingo widens the gap between reviews as memory strengthens — so students spend minutes, not hours, and retain far more.
            </p>
            <div className="mt-8 flex gap-8">
              <div>
                <p className="font-display text-3xl font-extrabold tracking-tight text-white">24 hrs</p>
                <p className="mt-1 text-[13px] text-slate-400">When most forgetting happens</p>
              </div>
              <div>
                <p className="font-display text-3xl font-extrabold tracking-tight text-white">SM-2</p>
                <p className="mt-1 text-[13px] text-slate-400">The algorithm behind Anki</p>
              </div>
            </div>
          </Reveal>
          <Reveal index={1}>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
              <MemoryDiagram />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Security ──────────────────────────────────────────────────── */}
      <section id="security" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.85fr_1.15fr]">
            <Reveal>
              <Eyebrow>Security &amp; compliance</Eyebrow>
              <h2 className="mb-5 text-balance font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.03em] text-slate-900">
                Built with student privacy first.
              </h2>
              <p className="max-w-sm text-[15px] leading-[1.65] text-slate-500">
                FlashMingo was designed for district IT from day one — not retrofitted after launch. Every layer, from auth to the database, assumes student data is sacred.
              </p>
              <Button asChild variant="outline" className="mt-7 h-11 rounded-xl border-slate-200 px-5 text-slate-700 hover:bg-slate-50">
                <Link href="/privacy">Read our privacy policy<ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </Reveal>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {securityPoints.map(({ icon: Icon, title, desc }, i) => (
                <Reveal key={title} index={i}>
                  <Spotlight className="h-full rounded-2xl border border-slate-200/80 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-30px_rgba(15,23,42,0.3)]">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E40AF]/8 text-[#1E40AF]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-1.5 font-display text-[16px] font-bold text-slate-900">{title}</h3>
                    <p className="text-[13.5px] leading-[1.55] text-slate-500">{desc}</p>
                  </Spotlight>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────── */}
      <section id="pricing" className="border-t border-slate-200/70 bg-[#F7F9FC] py-24">
        <div className="mx-auto max-w-[900px] px-6">
          <Reveal className="mb-14 text-center">
            <Eyebrow tone="teal">Pricing</Eyebrow>
            <h2 className="mb-3 text-balance font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.03em] text-slate-900">
              Free for individuals. Priced for districts.
            </h2>
            <p className="text-[15px] text-slate-500">No per-seat surprises. No credit card to start.</p>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Reveal index={0}>
              <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-8">
                <p className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-slate-500">Free</p>
                <div className="mb-1 mt-3"><span className="font-display text-[44px] font-extrabold tracking-[-0.03em] text-slate-900">$0</span><span className="ml-2 text-sm text-slate-500">forever</span></div>
                <p className="mb-6 text-sm text-slate-500">For individual students and teachers.</p>
                <ul className="mb-8 flex flex-1 flex-col gap-3">
                  {freeFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[14px] text-slate-700">
                      <Check className="h-4 w-4 shrink-0 text-[#0D9488] [stroke-width:2.5]" />{f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="h-11 w-full rounded-xl border-slate-200 text-slate-800 hover:bg-slate-50">
                  <Link href="/auth/login">Get started free</Link>
                </Button>
              </div>
            </Reveal>
            <Reveal index={1}>
              <div className="relative h-full rounded-3xl p-[1.5px]">
                {/* animated conic gradient border */}
                <div aria-hidden className="absolute inset-0 overflow-hidden rounded-3xl">
                  <div
                    className="absolute left-1/2 top-1/2 h-[180%] w-[180%] -translate-x-1/2 -translate-y-1/2 animate-fm-spin motion-reduce:animate-none"
                    style={{ background: 'conic-gradient(from 0deg, transparent 0deg, #1E40AF 60deg, #0D9488 120deg, transparent 200deg, transparent 360deg)' }}
                  />
                </div>
                <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(1.5rem-1.5px)] bg-white p-8 shadow-[0_30px_70px_-35px_rgba(30,64,175,0.5)]">
                <div aria-hidden className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-[#1E40AF]/10 to-[#0D9488]/10 blur-2xl" />
                <div className="relative flex items-center justify-between">
                  <p className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-slate-500">District</p>
                  <span className="rounded-full bg-[#1E40AF] px-3 py-1 text-[10.5px] font-bold uppercase tracking-wide text-white">Recommended</span>
                </div>
                <div className="mb-1 mt-3"><span className="font-display text-[44px] font-extrabold tracking-[-0.03em] text-slate-900">Custom</span><span className="ml-2 text-sm text-slate-500">/ school year</span></div>
                <p className="mb-6 text-sm text-slate-500">For schools that need admin controls & compliance.</p>
                <ul className="mb-8 flex flex-1 flex-col gap-3">
                  {districtFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[14px] text-slate-700">
                      <Check className="h-4 w-4 shrink-0 text-[#0D9488] [stroke-width:2.5]" />{f}
                    </li>
                  ))}
                </ul>
                <Magnetic strength={0.2}>
                  <Button asChild className="h-11 w-full rounded-xl bg-[#1E40AF] hover:bg-[#1B3A9E]">
                    <a href="#demo">Request a demo</a>
                  </Button>
                </Magnetic>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-14 px-6 lg:grid-cols-[0.7fr_1.3fr]">
          <Reveal>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="font-display text-[clamp(1.9rem,3.4vw,2.4rem)] font-bold leading-[1.1] tracking-[-0.03em] text-slate-900">
              Questions districts ask us
            </h2>
            <p className="mt-4 flex items-center gap-2 text-[14px] text-slate-500">
              <ShieldQuestion className="h-4 w-4 text-slate-400" />
              Still curious? <a href="#demo" className="font-medium text-[#1E40AF] hover:underline">Talk to us.</a>
            </p>
          </Reveal>
          <Reveal index={1}>
            <div className="border-t border-slate-200/80">
              {faqs.map((f) => <FaqItem key={f.q} {...f} />)}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section id="demo" className="relative overflow-hidden bg-slate-900 py-24 text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            WebkitMaskImage: 'radial-gradient(90% 90% at 50% 0%, #000, transparent 75%)',
            maskImage: 'radial-gradient(90% 90% at 50% 0%, #000, transparent 75%)',
          }}
        />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-72 w-[640px] -translate-x-1/2 animate-fm-aurora rounded-full bg-gradient-to-r from-[#1E40AF]/40 to-[#0D9488]/30 blur-[90px] motion-reduce:animate-none" />
        <div className="relative mx-auto grid max-w-5xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2">
          <Reveal>
            <div className="mb-4 inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5EEAD4]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Request a demo</span>
            </div>
            <h2 className="mb-4 text-balance font-display text-[clamp(2rem,3.6vw,2.8rem)] font-bold leading-[1.08] tracking-[-0.03em]">
              See FlashMingo in your district.
            </h2>
            <p className="max-w-md text-[15px] leading-[1.65] text-slate-300">
              A 30-minute walkthrough of setup, SSO configuration, and the compliance checklist. No commitment.
            </p>
            <div className="mt-8 flex flex-col gap-3 text-[14px] text-slate-300">
              {['SSO with Google & Microsoft', 'FERPA-ready Data Processing Agreement', 'White-glove district onboarding'].map((t) => (
                <span key={t} className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#5EEAD4] [stroke-width:2.5]" />{t}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal index={1}>
            <form onSubmit={handleDemoSubmit} className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white p-6 shadow-2xl">
              <input value={demoForm.name} onChange={(e) => setDemoForm((p) => ({ ...p, name: e.target.value }))} type="text" placeholder="Your name" className={inputCls} required />
              <input value={demoForm.email} onChange={(e) => setDemoForm((p) => ({ ...p, email: e.target.value }))} type="email" placeholder="School email address" className={inputCls} required />
              <input value={demoForm.school} onChange={(e) => setDemoForm((p) => ({ ...p, school: e.target.value }))} type="text" placeholder="School / district name" className={inputCls} required />
              <textarea value={demoForm.useCase} onChange={(e) => setDemoForm((p) => ({ ...p, useCase: e.target.value }))} rows={3} placeholder="Tell us about your use case (optional)" className={cn(inputCls, 'resize-none')} />
              <Button type="submit" disabled={demoSubmitting} className="h-12 w-full rounded-xl bg-[#1E40AF] text-[15px] hover:bg-[#1B3A9E]">
                <Mail className="h-[18px] w-[18px]" />
                {demoSubmitting ? 'Submitting…' : 'Request a demo'}
              </Button>
              {demoStatus && <p className="text-center text-[12.5px] text-slate-600">{demoStatus}</p>}
              <p className="text-center text-[11px] text-slate-400">We&apos;ll respond within one business day.</p>
            </form>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <FlashMingoLogo size="sm" variant="dark" />
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[13.5px] text-slate-500">
              <NavLink href="#why">Why FlashMingo</NavLink>
              <NavLink href="#security">Security</NavLink>
              <NavLink href="#pricing">Pricing</NavLink>
              <Link href="/privacy" className="transition-colors hover:text-slate-900">Privacy</Link>
              <Link href="/terms" className="transition-colors hover:text-slate-900">Terms</Link>
              <Link href="/auth/login" className="transition-colors hover:text-slate-900">Sign in</Link>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 text-[12.5px] text-slate-400">
            <p>© {year} FlashMingo. All rights reserved.</p>
            <p className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#0D9488]" /> FERPA &amp; COPPA compliant</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
