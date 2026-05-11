'use client';

import Script from 'next/script';
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

export default function MetaPixel() {
  if (!PIXEL_ID) return null;

  return (
    <>
      <Script
        id="meta-pixel-loader"
        strategy="afterInteractive"
        src="https://connect.facebook.net/en_US/fbevents.js"
        onLoad={() => {
          if (typeof window === 'undefined') return;
          if (!window.fbq) {
            // Standard Meta Pixel queue shim, set up before the SDK installs its own fbq.
            type FbqShim = ((...args: unknown[]) => void) & {
              callMethod?: (...args: unknown[]) => void;
              queue: unknown[][];
              loaded: boolean;
              version: string;
            };
            const fbq: FbqShim = ((...args: unknown[]) => {
              if (fbq.callMethod) fbq.callMethod.apply(fbq, args);
              else fbq.queue.push(args);
            }) as FbqShim;
            fbq.queue = [];
            fbq.loaded = true;
            fbq.version = '2.0';
            window.fbq = fbq;
            window._fbq = window._fbq || fbq;
          }
          window.fbq!('init', PIXEL_ID);
          window.fbq!('track', 'PageView');
        }}
      />
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
      <Suspense fallback={null}>
        <PixelPageviewTracker />
      </Suspense>
    </>
  );
}
