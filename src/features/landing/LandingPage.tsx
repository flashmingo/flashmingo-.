'use client';

import Link from 'next/link';
import {
  Shield, BookOpen, Users, BarChart2, Brain, Zap,
  CheckCircle2, ChevronRight, Lock, FileText, Globe,
  GraduationCap, Trophy, Mail,
} from 'lucide-react';
import { FlashMingoLogo } from '@/components/brand/FlashMingoLogo';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/* ─────────────────────────── Feature data ────────────────────────────── */
const features = [
  {
    icon: Brain,
    title: 'Spaced Repetition',
    desc: 'SM-2 algorithm surfaces the right cards at the right time — maximising retention with minimal effort.',
    color: 'text-primary',
    bg: 'bg-primary/5',
  },
  {
    icon: Zap,
    title: 'AI Deck Generator',
    desc: 'Describe what you\'re studying and FlashMingo builds a complete flashcard deck in seconds.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    icon: Users,
    title: 'Classroom Management',
    desc: 'Teachers create classrooms, enrol students, and share decks. Track progress from a PowerSchool-style dashboard.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Globe,
    title: 'District Deck Library',
    desc: 'Teachers publish decks to a district-scoped library. Students browse and study peer-reviewed content.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: BarChart2,
    title: 'Analytics & Leaderboards',
    desc: 'Study streaks, 30-day activity charts, and opt-in district leaderboards keep students motivated.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Shield,
    title: 'District Admin Controls',
    desc: 'Approve accounts, change roles, suspend users, and audit every action in the full audit log.',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
  },
];

const securityPoints = [
  'FERPA compliant — student data never sold or shared',
  'Google Workspace SSO — no separate passwords',
  'Role-based access: student, teacher, administrator',
  'Pending-approval workflow for all new accounts',
  'Full admin audit log for every user action',
  'District-scoped data — no cross-district visibility',
];

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'For individual students and teachers getting started.',
    features: [
      'Unlimited personal decks',
      'AI deck generation',
      'Spaced repetition',
      'Join classrooms',
      'Browse public decks',
    ],
    cta: 'Get started free',
    href: '/auth/login',
    highlight: false,
  },
  {
    name: 'District',
    price: 'Custom',
    period: 'per school year',
    desc: 'For districts that need admin controls and compliance.',
    features: [
      'Everything in Free',
      'Admin dashboard',
      'Account approval workflow',
      'Full audit logs',
      'District-scoped library',
      'Priority support',
      'FERPA data processing agreement',
    ],
    cta: 'Request a demo',
    href: '#demo',
    highlight: true,
  },
];

const faqs = [
  {
    q: 'Is FlashMingo FERPA compliant?',
    a: 'Yes. FlashMingo collects only the information your school provides via Google Workspace. No student data is sold, shared, or used for advertising.',
  },
  {
    q: 'Do students need a separate password?',
    a: 'No. FlashMingo uses Google Workspace SSO exclusively. Students and teachers sign in with their existing school Google account.',
  },
  {
    q: 'How does the approval workflow work?',
    a: 'When a new user signs in for the first time, their account is set to "pending." A district administrator reviews and approves each account before it becomes active.',
  },
  {
    q: 'Can teachers see student progress?',
    a: 'Yes. Teachers have a dedicated dashboard showing each student\'s sessions, cards reviewed, and accuracy over the last 30 days for their classrooms.',
  },
  {
    q: 'What is spaced repetition?',
    a: 'Spaced repetition is a learning technique that shows you cards at increasing intervals based on how well you know them. FlashMingo uses the SM-2 algorithm — the same system used by Anki.',
  },
  {
    q: 'Is there a mobile app?',
    a: 'FlashMingo is a responsive web app that works on phones and tablets. A native app is planned for a future release.',
  },
];

/* ─────────────────────────── Components ──────────────────────────────── */
function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <FlashMingoLogo size="sm" variant="dark" />
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#security" className="hover:text-foreground transition-colors">Security</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <a href="#demo">Request Demo</a>
          </Button>
        </div>
      </div>
    </header>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
      {children}
    </p>
  );
}

/* ─────────────────────────── Main page ──────────────────────────────── */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <NavBar />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6 shadow-sm">
          <Shield className="h-3.5 w-3.5 text-primary" />
          FERPA-compliant · Google SSO · District-controlled
        </div>

        <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
          Flashcard learning{' '}
          <span className="text-primary">built for schools</span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed mb-10">
          FlashMingo brings spaced repetition, AI deck generation, and classroom
          management together in a privacy-first platform your district can trust.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/auth/login">
              <GraduationCap className="h-4 w-4" />
              Sign in with Google
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="#demo">
              <Mail className="h-4 w-4" />
              Request a demo
            </a>
          </Button>
        </div>

        {/* Social proof */}
        <div className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" />Free for students & teachers</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" />No credit card required</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" />Google Workspace SSO</span>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section id="features" className="bg-muted/30 border-y border-border py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <SectionLabel>Features</SectionLabel>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-3">
              Everything your school needs
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From student study tools to district admin controls — FlashMingo covers the full workflow.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="rounded-xl border border-border bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow">
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg mb-4', bg)}>
                  <Icon className={cn('h-4 w-4', color)} />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security / Compliance ─────────────────────────────────────── */}
      <section id="security" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionLabel>Security &amp; Compliance</SectionLabel>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-4">
                Built with student privacy first
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                School data is sensitive. FlashMingo is designed from the ground up for
                district IT requirements — not bolted on after launch.
              </p>
              <ul className="space-y-3">
                {securityPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-card space-y-4">
              {[
                { icon: Lock,     title: 'Google SSO only',   desc: 'No passwords to manage or breach. School Google accounts are the only way in.' },
                { icon: Shield,   title: 'FERPA compliant',   desc: 'Student data stays within your district. No advertising, no data brokering.' },
                { icon: FileText, title: 'Audit log',         desc: 'Every admin and user action is logged with timestamps and user IDs.' },
                { icon: Users,    title: 'Role-based access',  desc: 'Students, teachers, and admins each see only what they\'re allowed to see.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-border shadow-sm">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────── */}
      <section id="pricing" className="bg-muted/30 border-y border-border py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <SectionLabel>Pricing</SectionLabel>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-3">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground">
              Free for individuals. District-wide plans for schools that need admin controls.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {pricingTiers.map(({ name, price, period, desc, features: feats, cta, href, highlight }) => (
              <div
                key={name}
                className={cn(
                  'rounded-2xl border p-6 flex flex-col',
                  highlight
                    ? 'border-primary bg-primary/5 shadow-lg ring-1 ring-primary/20'
                    : 'border-border bg-white shadow-card'
                )}
              >
                {highlight && (
                  <span className="mb-3 self-start rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-white uppercase tracking-wide">
                    Recommended
                  </span>
                )}
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{name}</p>
                <div className="mt-2 mb-1">
                  <span className="text-4xl font-bold text-foreground">{price}</span>
                  <span className="text-sm text-muted-foreground ml-1">/{period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-5">{desc}</p>
                <ul className="space-y-2 flex-1 mb-6">
                  {feats.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant={highlight ? 'default' : 'outline'} className="w-full">
                  <a href={href}>{cta}<ChevronRight className="h-3.5 w-3.5 ml-1" /></a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Request Demo ──────────────────────────────────────────────── */}
      <section id="demo" className="py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <SectionLabel>Request Demo</SectionLabel>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-3">
            See FlashMingo in your district
          </h2>
          <p className="text-muted-foreground mb-8">
            We&apos;ll walk you through admin setup, SSO configuration, and the compliance checklist.
            Takes 30 minutes.
          </p>
          <div className="rounded-2xl border border-border bg-white p-6 shadow-card space-y-3 text-left">
            <input
              type="text"
              placeholder="Your name"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="email"
              placeholder="School email address"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="School / district name"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              rows={3}
              placeholder="Tell us about your use case (optional)"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
            <Button className="w-full" size="lg">
              <Mail className="h-4 w-4" />
              Request a demo
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              No commitment required. We&apos;ll respond within one business day.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section id="faq" className="bg-muted/30 border-t border-border py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-12">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Common questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-border bg-white p-5 shadow-card">
                <p className="text-sm font-semibold text-foreground mb-1.5">{q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-white py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FlashMingoLogo size="sm" variant="dark" />
          </div>
          <div className="flex items-center gap-6">
            <a href="#features"  className="hover:text-foreground transition-colors">Features</a>
            <a href="#security"  className="hover:text-foreground transition-colors">Security</a>
            <a href="#pricing"   className="hover:text-foreground transition-colors">Pricing</a>
            <Link href="/auth/login" className="hover:text-foreground transition-colors">Sign in</Link>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} FlashMingo. FERPA compliant.</p>
        </div>
      </footer>
    </div>
  );
}
