'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Brain, Sparkles, Users, LineChart, ShieldCheck,
  GraduationCap, Lock, FileText, Mail, Check, ArrowRight,
  Plus, Minus, ShieldQuestion, RotateCcw,
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
    body: 'Every card returns right before you\'d forget it.',
  },
  {
    n: '02',
    tone: 'teal' as const,
    icon: Sparkles,
    title: 'Decks built in seconds',
    body: 'Describe a topic. Get a full, editable deck.',
  },
  {
    n: '03',
    tone: 'blue' as const,
    icon: LineChart,
    title: 'Progress you can act on',
    body: 'Streaks, accuracy, and who needs help. All at a glance.',
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
  { icon: Lock,      title: 'Google & Microsoft SSO', desc: 'No passwords to manage or breach.' },
  { icon: ShieldCheck, title: 'FERPA & COPPA aligned', desc: 'Student data is never sold or shared.' },
  { icon: FileText,  title: 'Immutable audit log', desc: 'Every action logged. No edits, no deletes.' },
  { icon: Users,     title: 'District data isolation', desc: 'Strict per-district boundaries, enforced at the database.' },
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
        transition: 'opacity .45s cubic-bezier(.16,1,.3,1), transform .45s cubic-bezier(.16,1,.3,1)',
        transitionDelay: `${Math.min(index, 8) * 60}ms`,
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(14px)',
        willChange: shown ? undefined : 'opacity, transform',
      }}
    >
      {children}
    </Tag>
  );
}


/** Subtle magnetic pull toward the cursor. */
function Magnetic({ children, className, strength = 0.15 }: {
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
      style={{ transition: 'transform .25s cubic-bezier(.16,1,.3,1)', display: 'inline-block' }}
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

function HeroCard() {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const tiltRef = useRef<HTMLDivElement>(null);

  const card = demoCards[idx];

  /* auto-play: flip to the answer, then advance to the next card — a lively,
     hands-off demo that keeps spinning on a steady beat. */
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let showAnswer = true;
    const id = window.setInterval(() => {
      if (showAnswer) {
        setFlipped(true);
      } else {
        setFlipped(false);
        setIdx((i) => (i + 1) % demoCards.length);
      }
      showAnswer = !showAnswer;
    }, 1500);
    return () => window.clearInterval(id);
  }, []);

  /* subtle 3D cursor tilt */
  const onTilt = useCallback((e: React.MouseEvent) => {
    const el = tiltRef.current; if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -4;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  }, []);
  const resetTilt = useCallback(() => {
    if (tiltRef.current) tiltRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
  }, []);

  return (
    <div className="relative w-[370px] max-w-full select-none">
      {/* ambient glow */}
      <div aria-hidden className="absolute inset-x-6 top-4 h-64 rounded-[28px] bg-[#1E40AF]/10 blur-2xl" />

      {/* tilt layer */}
      <div className="relative [perspective:1600px]" onMouseMove={onTilt} onMouseLeave={resetTilt}>
        <div ref={tiltRef} style={{ transition: 'transform .3s cubic-bezier(.16,1,.3,1)', transformStyle: 'preserve-3d' }}>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? 'Show question' : 'Reveal answer'}
            className="relative block h-64 w-full cursor-pointer text-left [transform-style:preserve-3d] focus-visible:outline-none"
            style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform .5s cubic-bezier(.16,1,.3,1)' }}
          >
            {/* front */}
            <div key={`f-${idx}`} className="absolute inset-0 flex flex-col rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_28px_60px_-28px_rgba(15,23,42,0.32)] [backface-visibility:hidden]" style={{ animation: 'scale-in .4s cubic-bezier(.16,1,.3,1)' }}>
              <div className="flex items-center">
                <span className={cn('rounded-md px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em]', card.tone === 'teal' ? 'bg-[#0D9488]/10 text-[#0D9488]' : 'bg-[#1E40AF]/8 text-[#1E40AF]')}>{card.subject}</span>
              </div>
              <div className="flex flex-1 items-center">
                <p className="font-display text-[23px] font-bold leading-[1.22] tracking-[-0.02em] text-slate-900">{card.q}</p>
              </div>
            </div>
            {/* back */}
            <div className="absolute inset-0 flex flex-col rounded-[22px] border border-[#1E40AF] bg-[#1E40AF] p-6 text-white shadow-[0_28px_60px_-24px_rgba(30,64,175,0.55)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#5EEAD4]">Answer</span>
              <div className="flex flex-1 flex-col justify-center gap-2">
                <p className="font-display text-[26px] font-bold leading-[1.15] tracking-[-0.02em]">{card.a}</p>
                <p className="text-[13px] leading-[1.55] text-white/70">{card.detail}</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Spaced-repetition interval chart — a plain bar chart: each correct
   recall pushes the next review further out. ─────────────────────────────── */
function MemoryDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const steps = [
    { label: '1 day',   h: 20 },
    { label: '3 days',  h: 42 },
    { label: '8 days',  h: 68 },
    { label: '21 days', h: 100 },
  ];

  return (
    <div ref={ref} role="img" aria-label="Time until the next review grows after each correct recall">
      <p className="mb-6 text-[12px] font-medium uppercase tracking-[0.14em] text-slate-400">Time until the next review</p>
      <div className="flex items-end gap-4" style={{ height: 180 }}>
        {steps.map((s, i) => (
          <div key={s.label} className="flex flex-1 flex-col items-center gap-3">
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-[#1E40AF] to-[#5EEAD4]"
                style={{
                  height: on ? `${s.h}%` : '0%',
                  transition: `height .6s cubic-bezier(.16,1,.3,1) ${i * 110}ms`,
                }}
              />
            </div>
            <span className="text-[12.5px] font-semibold text-slate-300">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────── Per-role product previews ───────────────────── */
function RoleMock({ role }: { role: 'student' | 'teacher' | 'admin' }) {
  const frame = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_-24px_rgba(15,23,42,0.4)]';

  if (role === 'student') {
    return (
      <div className={frame}>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-slate-900">Today&apos;s review</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-500">🔥 12-day streak</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-[#F7F9FC] p-5 text-center">
          <span className="mb-2 inline-block rounded bg-[#0D9488]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0D9488]">Biology</span>
          <p className="font-display text-[17px] font-bold text-slate-900">What is osmosis?</p>
          <p className="mt-1 text-[11.5px] text-slate-400">Tap to reveal</p>
        </div>
        <div className="mt-4 flex items-center justify-between text-[12px] text-slate-500">
          <span>18 cards due</span>
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/3 rounded-full bg-[#0D9488]" />
          </div>
          <span className="font-semibold text-slate-700">12 / 18</span>
        </div>
      </div>
    );
  }

  if (role === 'teacher') {
    const rows = [
      { name: 'Ava M.',   pct: 94, tone: 'bg-[#0D9488]' },
      { name: 'Liam R.',  pct: 76, tone: 'bg-[#1E40AF]' },
      { name: 'Noah T.',  pct: 41, tone: 'bg-orange-400' },
    ];
    return (
      <div className={frame}>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-slate-900">Period 3 · Biology</p>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">This week</span>
        </div>
        <div className="space-y-2.5">
          {rows.map((r) => (
            <div key={r.name} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5">
              <span className="w-16 text-[12.5px] font-medium text-slate-700">{r.name}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className={cn('h-full rounded-full', r.tone)} style={{ width: `${r.pct}%` }} />
              </div>
              <span className="w-9 text-right text-[12px] font-bold tabular-nums text-slate-700">{r.pct}%</span>
            </div>
          ))}
        </div>
        <p className="mt-3.5 flex items-center gap-1.5 text-[11.5px] text-orange-500">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-400" /> Noah hasn&apos;t studied in 4 days
        </p>
      </div>
    );
  }

  return (
    <div className={frame}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-slate-900">Pending approvals</p>
        <span className="rounded-full bg-[#1E40AF]/8 px-2.5 py-1 text-[11px] font-bold text-[#1E40AF]">3 new</span>
      </div>
      <div className="space-y-2.5">
        {[
          { name: 'E. Chen',  role: 'Teacher' },
          { name: 'M. Patel', role: 'Student' },
        ].map((u) => (
          <div key={u.name} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1E40AF]/10 text-[10px] font-bold text-[#1E40AF]">{u.name[0]}</span>
            <div className="flex-1">
              <p className="text-[12.5px] font-medium text-slate-800">{u.name}</p>
              <p className="text-[10.5px] text-slate-400">{u.role}</p>
            </div>
            <span className="rounded-lg bg-[#0D9488] px-3 py-1.5 text-[11px] font-semibold text-white">Approve</span>
          </div>
        ))}
      </div>
      <p className="mt-3.5 flex items-center gap-1.5 text-[11.5px] text-slate-400">
        <FileText className="h-3 w-3" /> Every action lands in the audit log
      </p>
    </div>
  );
}

/* ───────────────────────── AI forge — interactive ────────────────────── */
const forgeTopics = [
  {
    prompt: 'Photosynthesis, 8th grade',
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
    cards: ['Conjugate \u201cser\u201d in the yo form', '\u201cIr\u201d in the preterite \u2014 ellos', 'What does \u201ctener que\u201d mean?', 'Conjugate \u201cestar\u201d \u2014 nosotros'],
  },
];

/** Turn any visitor-typed topic into a plausible mini deck. */
function cardsForTopic(raw: string): string[] {
  const t = raw.trim().replace(/[.?!]+$/, '');
  return [
    `Define ${t} in your own words.`,
    `Give a real-world example of ${t}.`,
    `What's one common misconception about ${t}?`,
    `Summarize ${t} in one sentence.`,
  ];
}

/* Cards deal out of a central pile: each starts stacked, rotated, and
   converges to its grid cell with a springy stagger. */
const dealFrom = [
  'translate(52%, 46px) rotate(-7deg) scale(0.82)',
  'translate(-52%, 46px) rotate(6deg) scale(0.82)',
  'translate(52%, -34px) rotate(-4deg) scale(0.82)',
  'translate(-52%, -34px) rotate(5deg) scale(0.82)',
];

function AiForge() {
  const [mode, setMode] = useState<'demo' | 'user'>('demo');
  const [tIdx, setTIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [showCards, setShowCards] = useState(false);
  const [input, setInput] = useState('');
  const [userTopic, setUserTopic] = useState('');
  const [shuffling, setShuffling] = useState(false);
  const [dealt, setDealt] = useState(false);
  const topic = forgeTopics[tIdx];

  /* auto demo loop — only while nobody is playing */
  useEffect(() => {
    if (mode !== 'demo') return;
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
  }, [tIdx, topic.prompt, mode]);

  const generate = () => {
    const t = input.trim();
    if (!t || shuffling) return;
    setUserTopic(t);
    setDealt(false);
    setShuffling(true);
    window.setTimeout(() => { setShuffling(false); setDealt(true); }, 750);
  };

  const reset = () => {
    setInput(''); setUserTopic(''); setDealt(false); setShuffling(false);
    setMode('demo'); setTIdx(0);
  };

  const userMode = mode === 'user';
  const cards = userMode && userTopic ? cardsForTopic(userTopic) : topic.cards;
  const tag = userMode && userTopic
    ? (userTopic.length > 14 ? userTopic.slice(0, 14).trimEnd() + '\u2026' : userTopic)
    : topic.tag;
  const visible = userMode ? dealt : showCards;

  return (
    <div className="relative">
      {/* input row — actually typeable */}
      <div className={cn(
        'relative z-[2] flex items-center gap-3 rounded-2xl border bg-white p-3.5 pl-4 transition-all duration-200',
        userMode
          ? 'border-[#1E40AF]/40 shadow-[0_20px_50px_-30px_rgba(30,64,175,0.45)] ring-4 ring-[#1E40AF]/5'
          : 'border-slate-200 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)]',
      )}>
        <span className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E40AF] to-[#0D9488] text-white transition-transform duration-300',
          shuffling && 'animate-fm-spin',
          visible && !shuffling && 'scale-110',
        )}>
          <Sparkles className="h-4 w-4" />
        </span>

        {userMode ? (
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') generate(); }}
            placeholder="Type any topic… e.g. the water cycle"
            maxLength={60}
            className="min-w-0 flex-1 bg-transparent font-display text-[14.5px] font-medium text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:outline-none"
            aria-label="Topic for your deck"
          />
        ) : (
          <button
            type="button"
            onClick={() => { setMode('user'); setShowCards(false); }}
            className="min-w-0 flex-1 truncate text-left font-display text-[14.5px] font-medium text-slate-800"
            aria-label="Type your own topic"
          >
            {typed}
            <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-pulse bg-[#1E40AF]" />
          </button>
        )}

        {userMode ? (
          <button
            type="button"
            onClick={generate}
            disabled={!input.trim() || shuffling}
            className={cn(
              'shrink-0 rounded-lg px-3.5 py-2 text-[12.5px] font-semibold transition-all duration-200',
              input.trim() && !shuffling
                ? 'bg-[#1E40AF] text-white hover:bg-[#1B3A9E] active:scale-[0.97]'
                : 'bg-slate-100 text-slate-400',
            )}
          >
            {shuffling ? 'Forging\u2026' : 'Generate'}
          </button>
        ) : (
          <span className={cn(
            'shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all duration-300',
            showCards ? 'bg-[#0D9488]/10 text-[#0D9488]' : 'bg-slate-100 text-slate-400',
          )}>
            {showCards ? '\u2713 24 cards' : 'Generating\u2026'}
          </span>
        )}
      </div>

      {/* shuffle pile — appears while forging */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[76px] z-[1] -translate-x-1/2 transition-opacity duration-200"
        style={{ opacity: shuffling ? 1 : 0 }}
      >
        <div className="relative h-20 w-32">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-xl border border-slate-200 bg-white shadow-md"
              style={{
                transform: shuffling ? `rotate(${(i - 1) * 8}deg) translateY(${i * -3}px)` : 'none',
                transition: `transform .45s cubic-bezier(.16,1,.3,1) ${i * 70}ms`,
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-5 w-5 animate-pulse text-[#1E40AF]" />
          </div>
        </div>
      </div>

      {/* the deck — deals out of the pile */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cards.map((q, i) => (
          <div
            key={`${userMode ? userTopic : tIdx}-${i}`}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible
                ? 'translate(0,0) rotate(0deg) scale(1)'
                : userMode ? dealFrom[i % dealFrom.length] : 'translateY(14px) scale(.97)',
              transition: `opacity .4s cubic-bezier(.16,1,.3,1) ${i * 100}ms, transform .5s cubic-bezier(.22,1.2,.36,1) ${i * 100}ms`,
            }}
          >
            <span className="mb-2 inline-block max-w-full truncate rounded bg-[#1E40AF]/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#1E40AF]">{tag}</span>
            <p className="text-[13.5px] font-medium leading-[1.45] text-slate-800">{q}</p>
          </div>
        ))}
      </div>

      {/* footer row in user mode */}
      <div
        className="mt-3.5 flex items-center justify-between text-[12px] transition-opacity duration-300"
        style={{ opacity: userMode && dealt ? 1 : 0, pointerEvents: userMode && dealt ? 'auto' : 'none' }}
      >
        <span className="text-slate-400">Sign in to save this deck — and 20 more cards like it.</span>
        <button type="button" onClick={reset} className="flex items-center gap-1.5 font-semibold text-[#1E40AF] transition-colors hover:text-[#1B3A9E]">
          <RotateCcw className="h-3 w-3" /> Try another
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── Accordion item ──────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200/80 transition-colors duration-200 hover:bg-slate-50/60">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-6 px-2 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-[15px] font-semibold text-slate-900">{q}</span>
        <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors', open && 'border-[#1E40AF] bg-[#1E40AF] text-white')}>
          {open ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        </span>
      </button>
      <div
        className="grid transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)]"
        style={{ gridTemplateRows: open ? '1fr' : '0fr', opacity: open ? 1 : 0 }}
      >
        <div className="overflow-hidden">
          <p className="max-w-[600px] px-2 pb-5 text-[14px] leading-[1.6] text-slate-500">{a}</p>
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
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-slate-900 antialiased">
      {/* Universal ambient dot-grid — same texture as the dashboard */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(15,23,42,0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
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
      <section
        className="relative overflow-hidden border-b border-slate-200/70"
        onMouseMove={(e) => {
          const el = e.currentTarget;
          const r = el.getBoundingClientRect();
          el.style.setProperty('--hx', `${e.clientX - r.left}px`);
          el.style.setProperty('--hy', `${e.clientY - r.top}px`);
          el.style.setProperty('--hg', '1');
        }}
        onMouseLeave={(e) => e.currentTarget.style.setProperty('--hg', '0')}
      >
        {/* cursor-tracked ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden transition-opacity duration-500 lg:block"
          style={{
            opacity: 'var(--hg, 0)',
            background: 'radial-gradient(480px circle at var(--hx, 65%) var(--hy, 35%), rgba(37,99,235,0.09), transparent 65%)',
          }}
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 pb-24 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:pt-24">
          <div>
            <Reveal>
              <h1 className="max-w-[560px] text-balance font-display text-[clamp(2.8rem,5.8vw,4.2rem)] font-bold leading-[1.05] tracking-[-0.035em] text-slate-900">
                Learning that{' '}
                <span className="bg-gradient-to-r from-[#1E40AF] via-[#2563EB] to-[#0D9488] bg-clip-text text-transparent">sticks.</span>
              </h1>
            </Reveal>
            <Reveal index={1}>
              <p className="mt-5 max-w-[420px] text-[19px] leading-[1.55] text-slate-500">
                Spaced-repetition flashcards for schools. Free for students and teachers.
              </p>
            </Reveal>
            <Reveal index={2}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Magnetic>
                  <Button asChild size="lg" className="group h-12 rounded-xl bg-[#1E40AF] px-6 text-[15px] shadow-sm transition-all hover:bg-[#1B3A9E] hover:shadow-lg">
                    <Link href="/auth/login">
                      Get started
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </Magnetic>
                <Button asChild variant="outline" size="lg" className="h-12 rounded-xl border-slate-200 bg-white px-6 text-[15px] text-slate-700 hover:bg-slate-50">
                  <a href="#demo">Request a demo</a>
                </Button>
              </div>
            </Reveal>
          </div>
          <Reveal index={2} className="flex justify-center lg:justify-end">
            <HeroCard />
          </Reveal>
        </div>
      </section>

      {/* ── Trust marquee ─────────────────────────────────────────────── */}
      <section className="border-y border-slate-200/70 py-8">
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


      {/* ── Why FlashMingo — narrative ────────────────────────────────── */}
      <section id="why" className="border-t border-slate-200/70 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-16 max-w-2xl">
            <Eyebrow>Why FlashMingo</Eyebrow>
            <h2 className="text-balance font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.03em] text-slate-900">
              Built for how memory works.
            </h2>
          </Reveal>
          <div className="flex flex-col gap-4">
            {narrative.map(({ n, tone, icon: Icon, title, body }, i) => (
              <Reveal key={n} index={i}>
                <Spotlight
                  glow={tone === 'blue' ? 'rgba(30,64,175,0.10)' : 'rgba(13,148,136,0.10)'}
                  className="group grid grid-cols-1 items-center gap-6 rounded-3xl border border-slate-200/80 bg-white p-8 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_20px_50px_-30px_rgba(15,23,42,0.3)] md:grid-cols-[auto_1fr_auto]"
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
      <section className="relative overflow-hidden border-t border-slate-200/70 py-24">
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <Eyebrow tone="teal">AI deck generation</Eyebrow>
            <h2 className="mb-5 text-balance font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.03em] text-slate-900">
              Type a topic.
              <br />Watch the deck build itself.
            </h2>
            <p className="max-w-sm text-[15px] leading-[1.65] text-slate-500">
              Describe what the class is studying. Edit anything. Publish.
            </p>
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
            <div key={activeRole} className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2" style={{ animation: 'fade-in-up .3s cubic-bezier(.16,1,.3,1)' }}>
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
              {/* per-role UI preview */}
              <RoleMock role={roles[activeRole].key} />
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
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Spaced repetition</span>
            </div>
            <h2 className="mb-5 text-balance font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.03em] !text-white">
              Review right before you forget.
            </h2>
            <p className="max-w-md text-[15px] leading-[1.65] text-slate-300">
              The better you know a card, the further apart its reviews get.
            </p>
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
                Designed for district IT from day one.
              </p>
              <Button asChild variant="outline" className="mt-7 h-11 rounded-xl border-slate-200 px-5 text-slate-700 hover:bg-slate-50">
                <Link href="/privacy">Read our privacy policy<ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </Reveal>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {securityPoints.map(({ icon: Icon, title, desc }, i) => (
                <Reveal key={title} index={i}>
                  <Spotlight className="h-full rounded-2xl border border-slate-200/80 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]">
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
      <section id="pricing" className="border-t border-slate-200/70 py-24">
        <div className="mx-auto max-w-[900px] px-6">
          <Reveal className="mb-14 text-center">
            <Eyebrow tone="teal">Pricing</Eyebrow>
            <h2 className="mb-3 text-balance font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.03em] text-slate-900">
              Free for individuals. Priced for districts.
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Reveal index={0}>
              <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-8 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]">
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
                <Magnetic>
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
            <h2 className="mb-4 text-balance font-display text-[clamp(2rem,3.6vw,2.8rem)] font-bold leading-[1.08] tracking-[-0.03em] !text-white">
              See FlashMingo in your district.
            </h2>
            <p className="max-w-md text-[15px] leading-[1.65] text-slate-300">
              A 30-minute walkthrough. No commitment.
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
