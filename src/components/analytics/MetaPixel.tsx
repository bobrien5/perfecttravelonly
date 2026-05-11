'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

function PixelPageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!PIXEL_ID || typeof window === 'undefined' || !window.fbq) return;
    window.fbq('track', 'PageView');
  }, [pathname, searchParams]);

  return null;
}

/**
 * Client wrapper that handles only client-side route-change PageView events.
 * The initial pixel install, init, and first PageView are emitted from the
 * inline <script> in layout.tsx's <head> (same pattern as gtag) so that the
 * SDK has a queue shim before fbevents.js executes.
 */
export default function MetaPixel() {
  if (!PIXEL_ID) return null;
  return (
    <Suspense fallback={null}>
      <PixelPageviewTracker />
    </Suspense>
  );
}

/**
 * Renders the noscript pixel fallback. Used inside <body>.
 */
export function MetaPixelNoScript() {
  if (!PIXEL_ID) return null;
  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
