export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import PeriodSelector from '@/components/admin/PeriodSelector';
import AnalyticsClient from './AnalyticsClient';

export default function SEODashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Vercel Web Analytics overview
          </p>
        </div>
        <Suspense>
          <PeriodSelector />
        </Suspense>
      </div>

      <Suspense
        fallback={
          <div className="text-center py-16 text-gray-400">
            Loading analytics…
          </div>
        }
      >
        <AnalyticsClient />
      </Suspense>
    </div>
  );
}
