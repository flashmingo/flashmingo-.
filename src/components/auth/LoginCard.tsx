'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Shield, AlertCircle, BookOpen, Brain, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

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
    <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
      {messages[error] ?? 'An error occurred. Please try again.'}
    </div>
  );
}

const features = [
  { icon: BookOpen, label: 'Smart flashcards', desc: 'Create and organize decks' },
  { icon: Brain,    label: 'Spaced repetition', desc: 'SM-2 algorithm built in' },
  { icon: Users,    label: 'Classroom tools',  desc: 'Share decks with students' },
];

export function LoginCard() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Wordmark */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path d="M14 3L6 13h7l-3 8 11-12h-8L14 3z" fill="white" />
          </svg>
        </div>
        <span className="font-display text-xl font-bold text-foreground" style={{ letterSpacing: '-0.025em' }}>
          FlashMingo
        </span>
      </div>

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Sign in to your account</h1>
        <p className="text-sm text-muted-foreground">Use your school Google Workspace account to continue.</p>
      </div>

      {/* Card */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-card space-y-4">
        <Suspense fallback={null}>
          <LoginError />
        </Suspense>

        <Button
          onClick={signInWithGoogle}
          variant="outline"
          size="xl"
          className="w-full gap-2.5 font-semibold"
        >
          <GoogleIcon />
          Continue with Google
        </Button>

        <p className="text-center text-xs text-muted-foreground leading-relaxed">
          By signing in you agree to our{' '}
          <Link href="/terms" className="underline hover:text-foreground">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
        </p>
      </div>

      {/* Feature list */}
      <div className="space-y-2.5">
        {features.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Shield className="h-3 w-3 text-teal-500" />
        FERPA compliant · School accounts only
      </div>
    </div>
  );
}
