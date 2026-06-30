import type { Metadata } from 'next';
import { LoginCard } from '@/components/auth/LoginCard';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to FlashMingo with your school Google account.',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Left — branding panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12"
        style={{ background: 'hsl(224 44% 11%)' }}
      >
        {/* Top */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M14 3L6 13h7l-3 8 11-12h-8L14 3z" fill="white" />
            </svg>
          </div>
          <span className="font-display text-base font-bold text-white" style={{ letterSpacing: '-0.025em' }}>
            FlashMingo
          </span>
        </div>

        {/* Center copy */}
        <div className="space-y-6">
          <h2
            className="font-display font-bold text-white leading-tight"
            style={{ fontSize: '2.25rem', letterSpacing: '-0.03em' }}
          >
            The study platform<br />built for schools.
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'hsl(218 27% 65%)' }}>
            Spaced repetition, AI deck generation, and classroom tools in one FERPA-compliant platform.
          </p>

          {/* Social proof */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {['#3B82F6','#10B981','#8B5CF6','#F59E0B'].map((c) => (
                <div
                  key={c}
                  className="h-8 w-8 rounded-full border-2 flex items-center justify-center text-white text-xs font-bold"
                  style={{ borderColor: 'hsl(224 44% 11%)', background: c }}
                >
                  S
                </div>
              ))}
            </div>
            <p className="text-sm" style={{ color: 'hsl(218 27% 65%)' }}>
              Trusted by students and teachers
            </p>
          </div>
        </div>

        {/* Bottom */}
        <p className="text-xs" style={{ color: 'hsl(218 27% 40%)' }}>
          © {new Date().getFullYear()} FlashMingo. FERPA compliant.
        </p>
      </div>

      {/* Right — login form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <LoginCard />
      </div>
    </main>
  );
}
