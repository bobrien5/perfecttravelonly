'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RefreshButton() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  function handleRefresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 1000);
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={refreshing}
      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
    >
      {refreshing ? 'Refreshing...' : 'Refresh'}
    </button>
  );
}
