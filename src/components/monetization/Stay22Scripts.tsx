'use client';

import Script from 'next/script';

const LMA_ID = '6a4fa10b1b2dc574185e339d';

/**
 * Loads Stay22's letmeallez.js, which activates LMA (auto-monetize accommodation
 * links), Spark (auto-insert affiliate links), and Nova (AI booking-intent popups).
 *
 * Mount this ONLY on guide/blog routes. It must never render on the concierge funnel
 * (/concierge-planning, /quote), the home page, or the studio: Nova detects booking
 * intent and can send the visitor to an OTA, which would poach a concierge lead that
 * Brendan earns advisor commission on.
 */
export default function Stay22Scripts() {
  return (
    <Script id="stay22-letmeallez" strategy="afterInteractive">
      {`(function (s, t, a, y, twenty, two) {
  s.Stay22 = s.Stay22 || {};
  s.Stay22.params = { lmaID: '${LMA_ID}' };
  twenty = t.createElement(a);
  two = t.getElementsByTagName(a)[0];
  twenty.async = 1;
  twenty.src = y;
  two.parentNode.insertBefore(twenty, two);
})(window, document, 'script', 'https://scripts.stay22.com/letmeallez.js');`}
    </Script>
  );
}
