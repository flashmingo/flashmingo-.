'use client';
//test 
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md space-y-6 text-center">
        <h1 className="font-display text-4xl font-bold text-red-600">
          Something went wrong
        </h1>
        <p className="text-gray-600">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-sakura-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-sakura-700"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
