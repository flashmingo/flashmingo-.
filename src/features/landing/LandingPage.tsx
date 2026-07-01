'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Brain, Zap, Users, Globe, BarChart2, Shield,
  GraduationCap, Lock, FileText, Mail, Check, RefreshCw,
} from 'lucide-react';
import { FlashMingoLogo } from '@/components/brand/FlashMingoLogo';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/* ────────────────────────────── Data ─────────────────────────────────── */
const features = [
  { icon: Brain,     tone: 'blue',  title: 'Spaced Repetition',      desc: "The SM-2 algorithm resurfaces each card right before you'd forget it." },
  { icon: Zap,       tone: 'amber', title: 'AI Deck Generator',      desc: 'Describe a topic and get a complete flashcard deck in seconds.' },
  { icon: Users,     tone: 'blue',  title: 'Classroom Management',   desc: 'Create classrooms, enrol students, share decks, and track progress.' },
  { icon: Globe,     tone: 'amber', title: 'District Deck Library',  desc: 'Publish and browse peer-reviewed decks across your district.' },
  { icon: BarChart2, tone: 'blue',  title: 'Analytics & Leaderboards', desc: 'Streaks, activity charts, and opt-in district leaderboards.' },
  { icon: Shield,    tone: 'amber', title: 'District Admin Controls', desc: 'Approve accounts, manage roles, and audit every action.' },
] as const;

const audiences = [
  {
    icon: GraduationCap, tone: 'blue', title: 'For students',
    intro: 'Study smarter and stay motivated.',
    points: ['AI-built decks in seconds', 'Spaced-repetition review', 'Streaks & leaderboards'],
  },
  {
    icon: Users, tone: 'amber', title: 'For teachers',
    intro: 'Run classrooms and see who needs help.',
    points: ['Create & manage classrooms', 'Progress dashboard', 'Publish decks to the district'],
  },
  {
    icon: Shield, tone: 'blue', title: 'For admins',
    intro: 'Keep the district compliant and in control.',
    points: ['Approve & manage accounts', 'Roles & full audit log', 'District-scoped data'],
  },
] as const;

const securityPoints = [
  { icon: Lock,     title: 'Google SSO only',   desc: 'No passwords to manage or breach.' },
  { icon: Shield,   title: 'FERPA compliant',   desc: 'Student data never sold or shared.' },
  { icon: FileText, title: 'Full audit log',    desc: 'Every action logged with a timestamp.' },
  { icon: Users,    title: 'Role-based access', desc: 'District-scoped — no cross-district visibility.' },
] as const;

const freeFeatures = ['Unlimited personal decks', 'AI deck generation', 'Spaced repetition', 'Join classrooms'];
const districtFeatures = ['Everything in Free', 'Admin dashboard & approvals', 'Full audit logs', 'District-scoped library', 'Priority support & DPA'];

const faqs = [
  { q: 'Is FlashMingo FERPA compliant?', a: 'Yes. Student data is never sold, shared, or used for advertising.' },
  { q: 'Do students need a separate password?', a: 'No — everyone signs in with their existing school Google account.' },
  { q: 'How does account approval work?', a: 'New accounts start as "pending" until a district admin approves them.' },
  { q: 'What is spaced repetition?', a: 'A technique that reviews cards at growing intervals. We use SM-2 — the algorithm behind Anki.' },
  { q: 'Is there a mobile app?', a: 'FlashMingo is a responsive web app; a native app is planned.' },
];

/* ────────────────────────── Scroll reveal ────────────────────────────── */
/**
 * Progressive-enhancement wrapper: below-the-fold children start hidden and
 * fade/rise in on scroll. Content is visible by default (no JS ⇒ no hiding)
 * and the effect is skipped when IntersectionObserver is missing or the user
 * prefers reduced motion.
 */
function Reveal({
  children,
  index = 0,
  className,
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const vh = window.innerHeight || 800;
    if (el.getBoundingClientRect().top < vh * 0.92) return; // already in view

    setHidden(true);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setHidden(false);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: 'opacity .6s cubic-bezier(.2,.7,.2,1), transform .6s cubic-bezier(.2,.7,.2,1)',
        transitionDelay: `${Math.min(index, 6) * 70}ms`,
        opacity: hidden ? 0 : 1,
        transform: hidden ? 'translateY(20px)' : 'none',
        willChange: hidden ? 'opacity, transform' : undefined,
      }}
    >
      {children}
    </div>
  );
}

/* ────────────────────────── Small helpers ────────────────────────────── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#B45309]">
      {children}
    </p>
  );
}

const iconTile = (tone: 'blue' | 'amber', size: string, radius: string) =>
  cn('flex items-center justify-center', size, radius, tone === 'blue' ? 'bg-[#EAF1FE]' : 'bg-[#FBEFD8]');
const iconStroke = (tone: 'blue' | 'amber') => (tone === 'blue' ? 'text-[#2563EB]' : 'text-[#D97706]');

/* ────────────────────────── Hero flashcard ───────────────────────────── */
function HeroFlashcard() {
  return (
    <div className="flex flex-none basis-[380px] justify-center">
      <div className="relative w-[340px]">
        {/* deck stack behind */}
        <div className="absolute left-4 right-[-16px] top-[14px] h-56 rounded-[20px] border border-[#E9E3D7] bg-[#F1ECE2]" />
        <div className="absolute left-2 right-[-8px] top-[7px] h-56 rounded-[20px] border border-[#EDE7DB] bg-[#FBFAF7] shadow-[0_8px_20px_-12px_rgba(27,26,24,0.15)]" />

        {/* flip card */}
        <div className="relative animate-fm-float [perspective:1400px] motion-reduce:animate-none">
          <div className="group relative h-56 w-full animate-fm-flip [transform-style:preserve-3d] hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:[transform:none]">
            {/* front */}
            <div className="absolute inset-0 flex flex-col rounded-[20px] border border-[#E9E3D7] bg-white p-[22px] shadow-[0_20px_40px_-18px_rgba(27,26,24,0.28)] [backface-visibility:hidden]">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-[#FBEFD8] px-[9px] py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#B45309]">Biology</span>
                <span className="text-xs font-medium text-[#A39E93]">Card 1 of 24</span>
              </div>
              <div className="flex flex-1 items-center">
                <p className="font-display text-[23px] font-bold leading-[1.25] text-[#1B1A18]">What&apos;s the powerhouse of the cell?</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#A39E93]">
                <RefreshCw className="h-3.5 w-3.5" />
                Flips to reveal the answer
              </div>
            </div>
            {/* back */}
            <div className="absolute inset-0 flex flex-col rounded-[20px] border border-[#1E3A8A] bg-[#1E3A8A] p-[22px] text-white shadow-[0_20px_40px_-18px_rgba(30,58,138,0.45)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#FBBF24]">Answer</span>
              <div className="flex flex-1 flex-col justify-center gap-2">
                <p className="font-display text-[26px] font-bold leading-[1.2]">The mitochondria</p>
                <p className="text-[13px] leading-[1.5] text-[#C7D2FE]">Generates most of the cell&apos;s energy through respiration (ATP).</p>
              </div>
            </div>
          </div>
        </div>

        {/* rating chips */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          <span className="rounded-lg border border-[#FECACA] bg-white py-[7px] text-center text-xs font-semibold text-[#DC2626]">Again</span>
          <span className="rounded-lg border border-[#FED7AA] bg-white py-[7px] text-center text-xs font-semibold text-[#EA580C]">Hard</span>
          <span className="rounded-lg border border-[#BFDBFE] bg-white py-[7px] text-center text-xs font-semibold text-[#2563EB]">Good</span>
          <span className="rounded-lg bg-[#0D9488] py-[7px] text-center text-xs font-semibold text-white">Easy</span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────── Page ─────────────────────────────────── */
export function LandingPage() {
  const year = new Date().getFullYear();
  const router = useRouter();
  const [demoForm, setDemoForm] = useState({ name: '', email: '', school: '', useCase: '' });
  const [demoStatus, setDemoStatus] = useState<string | null>(null);
  const [demoSubmitting, setDemoSubmitting] = useState(false);

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

      setDemoStatus('Thanks! Your demo request has been received.');
      setDemoForm({ name: '', email: '', school: '', useCase: '' });
    } catch (error) {
      setDemoStatus(error instanceof Error ? error.message : 'Unable to submit demo request.');
    } finally {
      setDemoSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FBFAF7] font-sans text-[#1B1A18]">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[#E9E3D7] bg-[#FBFAF7]/85 backdrop-blur-[8px]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <FlashMingoLogo size="sm" variant="dark" />
          <nav className="hidden items-center gap-6 text-sm text-[#6E6A62] md:flex">
            <a href="#features" className="transition-colors hover:text-[#1B1A18]">Features</a>
            <a href="#roles" className="transition-colors hover:text-[#1B1A18]">Who it&apos;s for</a>
            <a href="#pricing" className="transition-colors hover:text-[#1B1A18]">Pricing</a>
            <a href="#faq" className="transition-colors hover:text-[#1B1A18]">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="h-[30px] hover:bg-[#F1ECE2]">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="h-[30px] bg-[#2563EB] hover:bg-[#1D4ED8]">
              <a href="#demo">Request demo</a>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#FBFAF7]">
        {/* notebook grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right,rgba(27,26,24,0.05) 1px,transparent 1px),linear-gradient(to bottom,rgba(27,26,24,0.05) 1px,transparent 1px)',
            backgroundSize: '27px 27px',
            WebkitMaskImage: 'radial-gradient(115% 82% at 50% 26%,#000 32%,transparent 82%)',
            maskImage: 'radial-gradient(115% 82% at 50% 26%,#000 32%,transparent 82%)',
          }}
        />
        {/* amber glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-6%] top-[4%] h-[440px] w-[540px]"
          style={{ background: 'radial-gradient(46% 46% at 62% 42%,rgba(245,158,11,0.18),transparent 72%)' }}
        />
        <div className="relative z-[1] mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-14 px-6 pb-[88px] pt-[72px]">
          <div className="max-w-[540px] flex-1 basis-[440px]">
            <h1 className="mb-5 text-balance font-display text-[56px] font-extrabold leading-[1.05] tracking-[-0.03em] text-[#1B1A18]">
              Flashcard learning built for{' '}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-[1]">schools</span>
                <span
                  aria-hidden
                  className="absolute bottom-[7px] left-[-7px] right-[-7px] z-0 h-[38%] opacity-55"
                  style={{
                    background: 'linear-gradient(90deg,#FBBF24,#FCD34D)',
                    transform: 'rotate(-1.4deg)',
                    borderRadius: '5px 7px 4px 8px',
                  }}
                />
              </span>
            </h1>
            <p className="mb-8 max-w-[460px] text-[19px] leading-[1.55] text-[#6E6A62]">
              Study smarter. Remember longer.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild className="h-11 rounded-[10px] bg-[#2563EB] px-[22px] text-[15px] hover:bg-[#1D4ED8]">
                <Link href="/auth/login">
                  <GraduationCap className="h-[18px] w-[18px]" />
                  Sign in with Google
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-[10px] border-[#E0D9CB] bg-white px-[22px] text-[15px] text-[#1B1A18] hover:bg-[#F4F0E8]">
                <a href="#demo">Request a demo</a>
              </Button>
            </div>
          </div>
          <HeroFlashcard />
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="border-y border-[#E9E3D7] bg-[#F4F0E8] py-[76px]">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-11 text-center">
            <Eyebrow>Features</Eyebrow>
            <h2 className="text-balance font-display text-[34px] font-bold tracking-[-0.025em] text-[#1B1A18]">
              Everything your school needs
            </h2>
          </Reveal>
          <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
            {features.map(({ icon: Icon, tone, title, desc }, i) => (
              <Reveal key={title} index={i}>
                <div className="h-full rounded-[16px] border border-[#E9E3D7] bg-white p-[22px] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_rgba(27,26,24,0.16)]">
                  <div className={cn(iconTile(tone, 'h-10 w-10', 'rounded-[11px]'), 'mb-4')}>
                    <Icon className={cn('h-[18px] w-[18px]', iconStroke(tone))} />
                  </div>
                  <h3 className="mb-1.5 font-display text-[16px] font-bold text-[#1B1A18]">{title}</h3>
                  <p className="text-sm leading-[1.55] text-[#6E6A62]">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for ────────────────────────────────────────────────── */}
      <section id="roles" className="py-[76px]">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-11 text-center">
            <Eyebrow>Who it&apos;s for</Eyebrow>
            <h2 className="text-balance font-display text-[34px] font-bold tracking-[-0.025em] text-[#1B1A18]">
              One platform, three roles
            </h2>
          </Reveal>
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
            {audiences.map(({ icon: Icon, tone, title, intro, points }, i) => (
              <Reveal key={title} index={i}>
                <div className="h-full rounded-[18px] border border-[#E9E3D7] bg-white p-[26px] shadow-[0_1px_2px_rgba(27,26,24,0.03)]">
                  <div className={cn(iconTile(tone, 'h-11 w-11', 'rounded-[12px]'), 'mb-[18px]')}>
                    <Icon className={cn('h-5 w-5', iconStroke(tone))} />
                  </div>
                  <h3 className="mb-2 font-display text-[19px] font-bold text-[#1B1A18]">{title}</h3>
                  <p className="mb-[18px] text-sm leading-[1.55] text-[#6E6A62]">{intro}</p>
                  <ul className="flex flex-col gap-2.5">
                    {points.map((p) => (
                      <li key={p} className="flex items-center gap-[9px] text-sm text-[#3B3A36]">
                        <Check className={cn('h-[15px] w-[15px] shrink-0 [stroke-width:2.5]', iconStroke(tone))} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security & Compliance ───────────────────────────────────────── */}
      <section id="security" className="border-y border-[#E9E3D7] bg-[#F4F0E8] py-[76px]">
        <div className="mx-auto max-w-[1000px] px-6">
          <Reveal className="mb-11 text-center">
            <Eyebrow>Security &amp; Compliance</Eyebrow>
            <h2 className="mb-3 text-balance font-display text-[34px] font-bold tracking-[-0.025em] text-[#1B1A18]">
              Built with student privacy first
            </h2>
            <p className="mx-auto max-w-[520px] text-[#6E6A62]">
              Designed for district IT from day one — not bolted on after launch.
            </p>
          </Reveal>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            {securityPoints.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} index={i}>
                <div className="h-full rounded-[14px] border border-[#E9E3D7] bg-white p-5">
                  <div className={cn(iconTile('blue', 'h-9 w-9', 'rounded-[9px]'), 'mb-3.5')}>
                    <Icon className="h-[17px] w-[17px] text-[#2563EB]" />
                  </div>
                  <p className="mb-1 text-sm font-semibold text-[#1B1A18]">{title}</p>
                  <p className="text-[13px] leading-[1.5] text-[#6E6A62]">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-[76px]">
        <div className="mx-auto max-w-[880px] px-6">
          <Reveal className="mb-11 text-center">
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="mb-3 text-balance font-display text-[34px] font-bold tracking-[-0.025em] text-[#1B1A18]">
              Simple, transparent pricing
            </h2>
            <p className="text-[#6E6A62]">
              Free for individuals. District plans for schools that need admin controls.
            </p>
          </Reveal>
          <div className="grid gap-[22px] [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]">
            {/* Free */}
            <Reveal index={0} className="h-full">
              <div className="flex h-full flex-col rounded-[18px] border border-[#E9E3D7] bg-white p-[26px]">
                <p className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#6E6A62]">Free</p>
                <div className="mb-1 mt-2">
                  <span className="font-display text-[40px] font-extrabold text-[#1B1A18]">$0</span>
                  <span className="ml-1.5 text-sm text-[#6E6A62]">forever</span>
                </div>
                <p className="mb-5 text-sm text-[#6E6A62]">For individual students and teachers.</p>
                <ul className="mb-6 flex flex-1 flex-col gap-2.5">
                  {freeFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-[9px] text-sm text-[#3B3A36]">
                      <Check className="h-[15px] w-[15px] shrink-0 text-[#0D9488] [stroke-width:2.5]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="h-[42px] w-full rounded-[10px] border-[#E0D9CB] bg-white text-[#1B1A18] hover:bg-[#F4F0E8]">
                  <Link href="/auth/login">Get started free</Link>
                </Button>
              </div>
            </Reveal>
            {/* District */}
            <Reveal index={1} className="h-full">
              <div className="flex h-full flex-col rounded-[18px] border-[1.5px] border-[#2563EB] bg-[#EAF1FE] p-[26px] shadow-[0_16px_40px_-18px_rgba(37,99,235,0.35)]">
                <span className="mb-3 self-start rounded-full bg-[#F59E0B] px-[11px] py-[3px] text-[11px] font-bold uppercase tracking-[0.04em] text-white">
                  Recommended
                </span>
                <p className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#6E6A62]">District</p>
                <div className="mb-1 mt-2">
                  <span className="font-display text-[40px] font-extrabold text-[#1B1A18]">Custom</span>
                  <span className="ml-1.5 text-sm text-[#6E6A62]">per school year</span>
                </div>
                <p className="mb-5 text-sm text-[#6E6A62]">For districts that need admin controls and compliance.</p>
                <ul className="mb-6 flex flex-1 flex-col gap-2.5">
                  {districtFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-[9px] text-sm text-[#3B3A36]">
                      <Check className="h-[15px] w-[15px] shrink-0 text-[#0D9488] [stroke-width:2.5]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className="h-[42px] w-full rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8]">
                  <a href="#demo">Request a demo</a>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Request a demo ──────────────────────────────────────────────── */}
      <section id="demo" className="relative overflow-hidden border-t border-[#E9E3D7] bg-[#F4F0E8] py-[76px]">
        <svg aria-hidden viewBox="0 0 32 32" fill="#F59E0B" className="pointer-events-none absolute left-[-70px] top-1/2 h-[380px] w-[380px] -translate-y-1/2 rotate-[-8deg] opacity-[0.06]">
          <path d="M19 5L9 18h8L13 27l14-16h-9L19 5z" />
        </svg>
        <svg aria-hidden viewBox="0 0 32 32" fill="#F59E0B" className="pointer-events-none absolute bottom-[-56px] right-[-48px] h-[260px] w-[260px] rotate-12 opacity-[0.05]">
          <path d="M19 5L9 18h8L13 27l14-16h-9L19 5z" />
        </svg>
        <div className="relative z-[1] mx-auto max-w-[660px] px-6 text-center">
          <Reveal>
            <Eyebrow>Request a demo</Eyebrow>
            <h2 className="mb-3 text-balance font-display text-[34px] font-bold tracking-[-0.025em] text-[#1B1A18]">
              See FlashMingo in your district
            </h2>
            <p className="mb-8 text-[#6E6A62]">
              A 30-minute walkthrough of setup, SSO, and the compliance checklist.
            </p>
          </Reveal>
          <form onSubmit={handleDemoSubmit} className="flex flex-col gap-3 rounded-[18px] border border-[#E9E3D7] bg-white p-6 text-left shadow-[0_1px_2px_rgba(27,26,24,0.03)]">
            <input value={demoForm.name} onChange={(e) => setDemoForm((prev) => ({ ...prev, name: e.target.value }))} type="text" placeholder="Your name" className="w-full rounded-[10px] border border-[#E0D9CB] bg-[#FBFAF7] px-[13px] py-[11px] text-sm focus:border-[#2563EB] focus:bg-white focus:outline-none" required />
            <input value={demoForm.email} onChange={(e) => setDemoForm((prev) => ({ ...prev, email: e.target.value }))} type="email" placeholder="School email address" className="w-full rounded-[10px] border border-[#E0D9CB] bg-[#FBFAF7] px-[13px] py-[11px] text-sm focus:border-[#2563EB] focus:bg-white focus:outline-none" required />
            <input value={demoForm.school} onChange={(e) => setDemoForm((prev) => ({ ...prev, school: e.target.value }))} type="text" placeholder="School / district name" className="w-full rounded-[10px] border border-[#E0D9CB] bg-[#FBFAF7] px-[13px] py-[11px] text-sm focus:border-[#2563EB] focus:bg-white focus:outline-none" required />
            <textarea value={demoForm.useCase} onChange={(e) => setDemoForm((prev) => ({ ...prev, useCase: e.target.value }))} rows={3} placeholder="Tell us about your use case (optional)" className="w-full resize-none rounded-[10px] border border-[#E0D9CB] bg-[#FBFAF7] px-[13px] py-[11px] text-sm focus:border-[#2563EB] focus:bg-white focus:outline-none" />
            <Button type="submit" disabled={demoSubmitting} className="h-[46px] w-full rounded-[11px] bg-[#2563EB] text-[15px] hover:bg-[#1D4ED8]">
              <Mail className="h-[18px] w-[18px]" />
              {demoSubmitting ? 'Submitting…' : 'Request a demo'}
            </Button>
            {demoStatus ? <p className="text-center text-[12px] text-[#1B1A18]">{demoStatus}</p> : null}
            <p className="text-center text-[11px] text-[#A39E93]">No commitment. We&apos;ll respond within one business day.</p>
          </form>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section id="faq" className="border-t border-[#E9E3D7] py-[76px]">
        <div className="mx-auto max-w-[720px] px-6">
          <Reveal className="mb-10 text-center">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="font-display text-[34px] font-bold tracking-[-0.025em] text-[#1B1A18]">
              Common questions
            </h2>
          </Reveal>
          <div className="flex flex-col gap-3.5">
            {faqs.map(({ q, a }, i) => (
              <Reveal key={q} index={i}>
                <div className="rounded-[14px] border border-[#E9E3D7] bg-white p-5">
                  <p className="mb-1.5 text-[15px] font-semibold text-[#1B1A18]">{q}</p>
                  <p className="text-sm leading-[1.55] text-[#6E6A62]">{a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#E9E3D7] bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-[#6E6A62]">
          <FlashMingoLogo size="sm" variant="dark" />
          <div className="flex items-center gap-6">
            <a href="#features" className="transition-colors hover:text-[#1B1A18]">Features</a>
            <a href="#pricing" className="transition-colors hover:text-[#1B1A18]">Pricing</a>
            <a href="#faq" className="transition-colors hover:text-[#1B1A18]">FAQ</a>
            <Link href="/auth/login" className="transition-colors hover:text-[#1B1A18]">Sign in</Link>
          </div>
          <p className="text-xs">© {year} FlashMingo. FERPA compliant.</p>
        </div>
      </footer>
    </div>
  );
}
