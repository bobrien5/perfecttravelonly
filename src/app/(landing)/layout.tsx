import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Landing-page layout for ad traffic.
 * Strips the main site nav and footer to remove conversion-killing distractions.
 * Keeps a minimal logo bar at top and a slim trust footer.
 */
export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      {/* Minimal logo bar */}
      <header className="bg-white border-b border-gray-100 py-3 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="VacationPro">
            <Image
              src="/logo.svg"
              alt="VacationPro"
              width={140}
              height={28}
              priority
              className="h-7 w-auto"
            />
          </Link>
          <span className="text-xs text-gray-500 font-medium hidden sm:inline">
            Verified pricing · 24h response
          </span>
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1">{children}</div>

      {/* Slim footer */}
      <footer className="border-t border-gray-100 py-6 px-4">
        <div className="max-w-2xl mx-auto text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} VacationPro · Travel like a pro.</p>
          <p className="mt-1">
            <Link href="/privacy" className="underline hover:text-gray-700">
              Privacy
            </Link>
            {' · '}
            <Link href="/terms" className="underline hover:text-gray-700">
              Terms
            </Link>
            {' · '}
            <Link href="/contact" className="underline hover:text-gray-700">
              Contact
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
