'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (username: string, password: string, role: 'student' | 'teacher' | 'administrator') => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signUp(username, password, role);

      if (!result.success) {
        setError(result.error || 'Signup failed');
        return;
      }

      // Redirect to dashboard on successful signup
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
          <p className="mt-2 text-gray-600">Create your account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* Signup Form */}
        <SignupForm onSubmit={handleSignup} isLoading={isLoading} />

        {/* Sign In Link */}
        <div className="text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{' '}
            <a href="/auth/login" className="font-semibold text-sakura-600 hover:text-sakura-700">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
