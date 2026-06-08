'use client';

import { useRole } from '@/hooks/useRole';
import { getGreeting } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading, isStudent, isTeacher, isAdmin } = useRole();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sakura-200 border-t-sakura-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Unable to load user profile</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-sakura-600">
              {getGreeting()}, {user.username}!
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome to Kenmei • Role: <span className="font-semibold capitalize">{user.role}</span>
            </p>
          </div>
        </div>

        {/* Account Status Banner */}
        {user.account_status !== 'approved' && (
          <div className="mb-8 rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              Your account is awaiting administrator approval. You can still explore the platform, but some features may be limited.
            </p>
          </div>
        )}

        {/* Role-Specific Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Student Dashboard */}
          {isStudent && (
            <>
              <div className="rounded-lg border-2 border-sakura-200 bg-sakura-50 p-6">
                <h2 className="font-display text-xl font-semibold text-sakura-600 mb-2">
                  My Decks
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Create and organize your flashcard decks.
                </p>
                <Link
                  href="/decks"
                  className="inline-block rounded-lg bg-sakura-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sakura-700"
                >
                  View Decks
                </Link>
              </div>

              <div className="rounded-lg border-2 border-sage-200 bg-sage-50 p-6">
                <h2 className="font-display text-xl font-semibold text-sage-600 mb-2">
                  Study
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Study your flashcards with spaced repetition.
                </p>
                <Link
                  href="/study"
                  className="inline-block rounded-lg bg-sage-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sage-700"
                >
                  Start Studying
                </Link>
              </div>

              <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-6">
                <h2 className="font-display text-xl font-semibold text-indigo-600 mb-2">
                  Progress
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Track your learning progress.
                </p>
                <button
                  disabled
                  className="inline-block rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-500 cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </>
          )}

          {/* Teacher Dashboard */}
          {isTeacher && (
            <>
              <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-6">
                <h2 className="font-display text-xl font-semibold text-indigo-600 mb-2">
                  My Classrooms
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Create and manage your classrooms.
                </p>
                <button
                  disabled
                  className="inline-block rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-500 cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>

              <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
                <h2 className="font-display text-xl font-semibold text-blue-600 mb-2">
                  Student Progress
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Monitor student study activity.
                </p>
                <button
                  disabled
                  className="inline-block rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-500 cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>

              <div className="rounded-lg border-2 border-sakura-200 bg-sakura-50 p-6">
                <h2 className="font-display text-xl font-semibold text-sakura-600 mb-2">
                  Study Materials
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Create and share flashcard decks with your class.
                </p>
                <Link
                  href="/decks"
                  className="inline-block rounded-lg bg-sakura-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sakura-700"
                >
                  Manage Decks
                </Link>
              </div>
            </>
          )}

          {/* Administrator Dashboard */}
          {isAdmin && (
            <>
              <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-6">
                <h2 className="font-display text-xl font-semibold text-purple-600 mb-2">
                  Admin Panel
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  District management and approvals.
                </p>
                <button
                  disabled
                  className="inline-block rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-500 cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>

              <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-6">
                <h2 className="font-display text-xl font-semibold text-orange-600 mb-2">
                  User Management
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Manage users and their roles.
                </p>
                <button
                  disabled
                  className="inline-block rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-500 cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>

              <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6">
                <h2 className="font-display text-xl font-semibold text-red-600 mb-2">
                  Audit Logs
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  View system audit logs.
                </p>
                <button
                  disabled
                  className="inline-block rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-500 cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
