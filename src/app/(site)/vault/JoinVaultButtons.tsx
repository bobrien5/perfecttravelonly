'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Interval = 'month' | 'year';

/**
 * The two "join" buttons on /vault. Posts to the checkout route and follows
 * the Stripe URL it returns. A 401 means the visitor is not signed in, in
 * which case they go to sign-in with a return path back here, because the
 * membership has to be attached to an account before Stripe is involved.
 */
export default function JoinVaultButtons({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState<Interval | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function join(interval: Interval) {
    setError(null);
    if (!signedIn) {
      router.push(`/auth/signin?next=${encodeURIComponent('/vault')}`);
      return;
    }
    setLoading(interval);
    try {
      const res = await fetch('/api/stripe/vault-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval }),
      });
      const data = (await res.json()) as { url?: string; error?: string; signIn?: boolean };
      if (res.status === 401 || data.signIn) {
        router.push(`/auth/signin?next=${encodeURIComponent('/vault')}`);
        return;
      }
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not start checkout');
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => join('year')}
        disabled={loading !== null}
        className="w-full rounded-xl bg-brand-700 px-6 py-4 text-lg font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {loading === 'year' ? 'Opening checkout...' : 'Join for $59 a year'}
        <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
          Save 18%
        </span>
      </button>
      <button
        type="button"
        onClick={() => join('month')}
        disabled={loading !== null}
        className="w-full rounded-xl bg-white px-6 py-4 text-lg font-semibold text-brand-700 ring-1 ring-brand-200 transition hover:bg-brand-50 disabled:opacity-60"
      >
        {loading === 'month' ? 'Opening checkout...' : 'Join for $5.99 a month'}
      </button>
      {!signedIn && (
        <p className="text-center text-xs text-gray-500">
          You will be asked to sign in first so your membership is tied to your account.
        </p>
      )}
      {error && (
        <p className="text-center text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      <p className="text-center text-xs text-gray-400">
        Cancel any time from your account. Secure checkout by Stripe.
      </p>
    </div>
  );
}
