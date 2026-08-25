'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

/**
 * Mediavine display ads (ScriptWrapper tag) and the Grow.me engagement widget.
 *
 * These load on content routes only. They are deliberately skipped on conversion
 * pages: a display ad or a Grow overlay on the $99 concierge checkout flow costs
 * far more in lost bookings than it earns in RPM. Add any future checkout or
 * quote route to AD_FREE_PREFIXES.
 */
export const AD_FREE_PREFIXES = ['/concierge-planning', '/quote', '/links', '/studio', '/admin'];

export function isAdFreePath(pathname: string | null): boolean {
  if (!pathname) return false;
  return AD_FREE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export default function AdScripts() {
  const pathname = usePathname();
  if (isAdFreePath(pathname)) return null;

  return (
    <>
      <Script id="grow-me-faves" strategy="afterInteractive" data-grow-initializer="">
        {`!(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id","U2l0ZTpmMGUxZTFjOS05NTNmLTQzNDItOTAyMi1kNjk4NDMzNjgyMjY=");var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();`}
      </Script>
      <Script
        id="scriptwrapper-ads"
        strategy="afterInteractive"
        data-noptimize="1"
        data-cfasync="false"
        src="https://scripts.scriptwrapper.com/tags/e826f3a3-1424-4081-9650-1fad60b84735.js"
      />
    </>
  );
}
