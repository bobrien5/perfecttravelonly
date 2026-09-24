'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { createBrowserSupabase } from '@/lib/supabase/browser';

// Apple was removed 2026-09-24: never configured, and the button errored for
// anyone who tried it. Kept as a union so a second provider slots back in
// without touching handleOAuth.
type Provider = 'google';

function getNextParam(searchParams: URLSearchParams): string {
  return searchParams.get('next') ?? '/trips';
}

function getCallbackUrl(next: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

export function SignInForm() {
  const searchParams = useSearchParams();
  const next = getNextParam(searchParams);
  const oauthError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState<'email' | Provider | null>(null);
  const [error, setError] = useState(oauthError ?? '');

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading('email');

    try {
      const supabase = createBrowserSupabase();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getCallbackUrl(next),
        },
      });

      if (otpError) {
        setError(otpError.message);
      } else {
        setEmailSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  async function handleOAuth(provider: Provider) {
    setError('');
    setLoading(provider);

    try {
      const supabase = createBrowserSupabase();
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getCallbackUrl(next),
        },
      });

      if (oauthErr) {
        setError(oauthErr.message);
        setLoading(null);
      }
      // On success, Supabase redirects the browser away, so no further
      // state change is needed here.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(null);
    }
  }

  if (emailSent) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-brand-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
            />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-gray-900 mb-1">Check your inbox</h2>
        <p className="text-sm text-gray-500">
          We sent a sign-in link to <span className="font-medium text-gray-700">{email}</span>.
          Open it on this device to continue.
        </p>
        <button
          type="button"
          onClick={() => setEmailSent(false)}
          className="mt-4 text-sm text-brand-600 hover:text-brand-700 font-medium"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={loading !== null || !email}
          className="w-full bg-brand-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'email' ? 'Sending...' : 'Continue with email'}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400 uppercase tracking-wide">Or</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => handleOAuth('google')}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-2.5 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.89c2.27-2.09 3.57-5.17 3.57-8.83z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.89-3.02c-1.08.72-2.46 1.15-4.04 1.15-3.11 0-5.74-2.1-6.68-4.92H1.3v3.11C3.27 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.32 14.31a7.2 7.2 0 0 1 0-4.62V6.58H1.3a11.98 11.98 0 0 0 0 10.84l4.02-3.11z"
            />
            <path
              fill="#EA4335"
              d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.27 2.7 1.3 6.58l4.02 3.11c.94-2.82 3.57-4.92 6.68-4.92z"
            />
          </svg>
          {loading === 'google' ? 'Redirecting...' : 'Continue with Google'}
        </button>

      </div>

      {error && (
        <p className="text-sm text-danger text-center" role="alert">
          {error}
        </p>
      )}

    </div>
  );
}
