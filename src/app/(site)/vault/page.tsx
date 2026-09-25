import type { Metadata } from 'next';
import Link from 'next/link';
import { getVaultMembership } from '@/lib/vault/membership';
import JoinVaultButtons from './JoinVaultButtons';
import ManageMembershipButton from './ManageMembershipButton';

export const metadata: Metadata = {
  title: { absolute: 'The Vacation Vault | VacationPro' },
  description:
    'Members-only access to every handpicked vacation deal with the booking links, plus concierge trip planning from a licensed travel advisor. $5.99 a month or $59 a year.',
  alternates: { canonical: '/vault' },
};

// Reads the session cookie, so this page is rendered per request.
export const dynamic = 'force-dynamic';

const INCLUDED = [
  ['Every deal, fully unlocked', 'The exact resort, the dates we found the price, the flight routes, and the booking link. Non-members see the deal; you get to book it.'],
  ['Concierge trip planning', 'Tell us where and when, and a licensed advisor builds real options around your budget and dates. Members only.'],
  ['New deals every week', 'Handpicked all-inclusive, Caribbean and Mexico deals added as we find them, with expired ones taken down.'],
  ['Why we picked it', 'The honest note on each deal: what is genuinely good about it and what to watch for.'],
];

export default async function VaultPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const [{ isMember, user, status, periodEnd, interval }, params] = await Promise.all([
    getVaultMembership(),
    searchParams,
  ]);

  if (isMember) {
    const renews = periodEnd
      ? new Date(periodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : null;
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Vacation Vault</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">You are in.</h1>
        <p className="mt-3 text-lg text-gray-600">
          Every deal is unlocked and concierge planning is open to you.
          {renews && status === 'active' && ` Your ${interval === 'year' ? 'annual' : 'monthly'} membership renews on ${renews}.`}
          {status === 'past_due' && ' Your last payment did not go through; update your card to keep access.'}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
        <div className="mt-10 border-t border-gray-100 pt-6">
          <ManageMembershipButton />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      {params.canceled && (
        <p className="mb-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
          Checkout was cancelled. Nothing was charged.
        </p>
      )}

      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Vacation Vault</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-gray-900 sm:text-5xl">
            The deals, the booking links, and a real advisor.
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            We search the deals so you do not have to. The Vault is where the whole thing lives:
            every handpicked vacation with the link to book it, and concierge trip planning when
            you want a licensed travel advisor to build the trip for you.
          </p>

          <ul className="mt-8 space-y-5">
            {INCLUDED.map(([title, body]) => (
              <li key={title} className="flex gap-3">
                <span aria-hidden className="mt-1 text-brand-600">
                  &#10003;
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{title}</p>
                  <p className="text-gray-600">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm text-gray-500">
            Want to see what is inside first?{' '}
            <Link href="/deals" className="font-semibold text-brand-700 underline underline-offset-4">
              Browse the current deals
            </Link>
            . The resort and price are open to everyone; the booking details are for members.
          </p>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <p className="text-sm font-semibold text-gray-900">Membership</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              $5.99<span className="text-base font-medium text-gray-500">/month</span>
            </p>
            <p className="text-sm text-gray-500">or $59 a year</p>
            <div className="mt-5">
              <JoinVaultButtons signedIn={!!user} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
