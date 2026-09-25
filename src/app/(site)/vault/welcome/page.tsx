import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { absolute: 'Welcome to the Vault | VacationPro' },
  robots: { index: false },
};

/**
 * Stripe sends members here after a successful checkout. Access itself is
 * granted by the webhook, not by landing on this page, so nothing here reads
 * or writes membership state: if the webhook is a second behind, the next
 * page load on /deals picks it up.
 */
export default function VaultWelcomePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Vacation Vault</p>
      <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">Welcome in.</h1>
      <p className="mt-4 text-lg text-gray-600">
        Your membership is active. Every deal is unlocked, and concierge planning is open to you
        whenever you want a licensed advisor to build the trip.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/deals"
          className="inline-flex items-center justify-center rounded-xl bg-brand-700 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
        >
          Open the Vault
        </Link>
        <Link
          href="/concierge-planning"
          className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 ring-1 ring-brand-200 transition hover:bg-brand-50"
        >
          Request concierge planning
        </Link>
      </div>
      <p className="mt-8 text-sm text-gray-500">
        If the deals still look locked, give it a few seconds and refresh. Stripe confirms the
        payment to us a moment after it confirms it to you.
      </p>
    </div>
  );
}
