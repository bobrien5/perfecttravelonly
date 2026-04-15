'use client';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-8">
      <h2 className="text-xl font-bold text-red-600 mb-4">Dashboard Error</h2>
      <p className="text-gray-700 mb-2">
        {error.message || 'An unexpected error occurred while loading the dashboard.'}
      </p>
      <p className="text-sm text-gray-500 mb-2">
        {error.digest && <>Digest: {error.digest}</>}
      </p>
      <pre className="text-xs bg-gray-100 p-3 rounded mb-4 overflow-auto max-h-40 text-gray-600">
        {error.stack || error.toString()}
      </pre>
      <button
        onClick={reset}
        className="px-4 py-2 bg-brand-500 text-white rounded-lg"
      >
        Try Again
      </button>
    </div>
  );
}
