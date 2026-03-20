'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

function GoContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const deal = searchParams.get('deal');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!url) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = url;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [url]);

  if (!url) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Link</h1>
          <p className="text-gray-600 mb-6">This redirect link is missing a destination URL.</p>
          <Link
            href="/deals/all-inclusive"
            className="inline-flex items-center px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
          >
            Browse Deals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-lg w-full text-center px-4">
        {/* Logo / Brand */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Taking you to our partner
          </h1>
          {deal && (
            <p className="text-gray-500 text-sm mb-2">
              {deal}
            </p>
          )}
          <p className="text-gray-600">
            You&apos;re being redirected to complete your booking on our partner&apos;s website.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="bg-brand-600 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${((3 - countdown) / 3) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">
            Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
          </p>
        </div>

        {/* Manual link */}
        <div className="space-y-3">
          <a
            href={url}
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
          >
            Go Now &rarr;
          </a>
          <Link
            href="/deals/all-inclusive"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm"
          >
            &larr; Back to Deals
          </Link>
        </div>

        {/* Trust note */}
        <p className="text-xs text-gray-400 mt-8">
          VacationPro may earn a commission from partner bookings at no extra cost to you.
          See our{' '}
          <Link href="/legal/affiliate-disclosure" className="underline hover:text-gray-600">
            affiliate disclosure
          </Link>.
        </p>
      </div>
    </div>
  );
}

export default function GoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <p className="text-gray-600">Preparing your redirect...</p>
          </div>
        </div>
      }
    >
      <GoContent />
    </Suspense>
  );
}
