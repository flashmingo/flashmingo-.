import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist.',
};

export default function NotFoundPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="font-display text-6xl font-bold text-sakura-600">404</h1>
          <p className="font-display text-2xl font-semibold text-indigo-900">
            Page Not Found
          </p>
        </div>
        <p className="text-gray-600">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-sakura-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-sakura-700"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
