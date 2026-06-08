'use client';

import Link from 'next/link';
import { useRole } from '@/hooks/useRole';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const { isStudent, isTeacher, isAdmin } = useRole();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 border-r border-gray-200 bg-white p-6">
      <nav className="space-y-2">
        {/* Common Navigation */}
        <Link
          href="/dashboard"
          className={`block rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            isActive('/dashboard')
              ? 'bg-sakura-100 text-sakura-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Dashboard
        </Link>

        <Link
          href="/settings"
          className={`block rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            isActive('/settings')
              ? 'bg-sakura-100 text-sakura-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Settings
        </Link>

        {/* Student Navigation */}
        {isStudent && (
          <>
            <hr className="my-4" />
            <p className="px-4 text-xs font-semibold uppercase text-gray-500">Student</p>

            <Link
              href="/decks"
              className={`block rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                isActive('/decks')
                  ? 'bg-sakura-100 text-sakura-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              My Decks
            </Link>

            <Link
              href="/study"
              className={`block rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                isActive('/study')
                  ? 'bg-sakura-100 text-sakura-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Study
            </Link>
          </>
        )}

        {/* Teacher Navigation */}
        {isTeacher && (
          <>
            <hr className="my-4" />
            <p className="px-4 text-xs font-semibold uppercase text-gray-500">Teacher</p>

            <Link
              href="/decks"
              className={`block rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                isActive('/decks')
                  ? 'bg-sakura-100 text-sakura-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Study Materials
            </Link>

            <button
              disabled
              className="w-full text-left block rounded-lg px-4 py-2 text-sm font-semibold text-gray-400 cursor-not-allowed"
            >
              Classrooms (Coming Soon)
            </button>
          </>
        )}

        {/* Admin Navigation */}
        {isAdmin && (
          <>
            <hr className="my-4" />
            <p className="px-4 text-xs font-semibold uppercase text-gray-500">Admin</p>

            <button
              disabled
              className="w-full text-left block rounded-lg px-4 py-2 text-sm font-semibold text-gray-400 cursor-not-allowed"
            >
              District Management (Coming Soon)
            </button>
          </>
        )}
      </nav>
    </aside>
  );
}
