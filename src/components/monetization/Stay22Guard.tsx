'use client';

import { useEffect } from 'react';

/**
 * Stay22 must never run on the conversion pages or the home page. Mounting
 * Stay22Scripts only on the guide routes is not enough: this is an SPA, so a
 * client-side navigation from a guide to one of these pages does NOT reload the
 * document, and the Stay22 script it injected (plus its observer, its Nova
 * element, and its patched window.open) survives the route change.
 *
 * Nova hijacks window.open to push the visitor to an OTA. On a concierge page
 * that means poaching a lead we earn advisor commission on. So if we ever land
 * here with Stay22 already in the document, force one clean reload. The reload
 * produces a fresh document, and because this page never mounts Stay22Scripts,
 * Stay22 is gone and the guard is a no-op from then on (no reload loop).
 */
export default function Stay22Guard() {
  useEffect(() => {
    const w = window as unknown as { Stay22?: unknown };
    if (typeof w.Stay22 !== 'undefined') {
      window.location.reload();
    }
  }, []);

  return null;
}
