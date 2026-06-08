'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signIn(username, password);

      if (!result.success) {
        setError(result.error || 'Login failed');
        return;
      }

      // Redirect to dashboard on successful login
      router.push('/dashboard');
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-sakura-600">Kenmei</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* Login Form */}
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

        {/* Sign Up Link */}
        <div className="text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <a href="/auth/signup" className="font-semibold text-sakura-600 hover:text-sakura-700">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
