'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-16">
      <div className="max-w-2xl space-y-8 text-center">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="font-display text-5xl font-bold text-sakura-600 md:text-6xl">
            Kenmei
          </h1>
          <p className="font-display text-xl font-semibold text-indigo-600">
            Wisdom Through Learning
          </p>
          <p className="mx-auto max-w-lg text-lg text-gray-600">
            A secure, comprehensive learning platform designed for K-12 students. Master
            any subject with spaced repetition, active recall, and intelligent study tools.
          </p>
        </div>

        {/* Key Features */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-sakura-200 bg-sakura-50 p-6">
            <h3 className="mb-2 font-display text-lg font-semibold text-sakura-600">
              Smart Flashcards
            </h3>
            <p className="text-sm text-gray-600">
              Create beautiful flashcards with text and images. Study smarter with our
              spaced repetition algorithm.
            </p>
          </div>

          <div className="rounded-lg border-2 border-sage-200 bg-sage-50 p-6">
            <h3 className="mb-2 font-display text-lg font-semibold text-sage-600">
              Track Progress
            </h3>
            <p className="text-sm text-gray-600">
              Monitor your learning journey with detailed progress metrics and memory
              growth scores.
            </p>
          </div>

          <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-6">
            <h3 className="mb-2 font-display text-lg font-semibold text-indigo-600">
              Teacher Tools
            </h3>
            <p className="text-sm text-gray-600">
              Teachers can create classrooms, monitor student progress, and share study
              materials.
            </p>
          </div>

          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
            <h3 className="mb-2 font-display text-lg font-semibold text-blue-600">
              Data Privacy
            </h3>
            <p className="text-sm text-gray-600">
              Full compliance with Ohio Senate Bill 29. Your data is secure and private.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          {isLoading ? (
            <div className="animate-pulse">Loading...</div>
          ) : isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-block rounded-lg bg-sakura-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-sakura-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sakura-600"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/signup"
                className="inline-block rounded-lg bg-sakura-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-sakura-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sakura-600"
              >
                Get Started
              </Link>
              <Link
                href="/auth/login"
                className="inline-block rounded-lg border-2 border-sakura-600 px-8 py-3 font-semibold text-sakura-600 transition-colors hover:bg-sakura-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sakura-600"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
        <p>
          Kenmei © 2024. Secure learning platform designed for K-12 education with
          full privacy compliance.
        </p>
      </footer>
    </main>
  );
}
