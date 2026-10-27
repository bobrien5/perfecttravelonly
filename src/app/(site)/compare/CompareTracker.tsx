'use client';

import { useEffect } from 'react';
import { trackFunnel } from '@/lib/analytics/journey';

/** Records a comparison view (resort ids only). */
export default function CompareTracker({ ids }: { ids: string[] }) {
  const key = ids.join(',');
  useEffect(() => {
    trackFunnel('resorts_compared', { count: key.split(',').length, ids: key, placement: 'compare-page' });
  }, [key]);
  return null;
}
