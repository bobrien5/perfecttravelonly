import { FormEvent, useState } from 'react';
import { track } from '@vercel/analytics';
import { trackLead } from '@/lib/meta-pixel';
import { createBrowserSupabase } from '@/lib/supabase/browser';
import { EMAIL_RE } from '@/app/api/quiz-session/validate';

interface SaveGateProps {
  onClose: () => void;
}

type Provider = 'google' | 'apple';

const CLAIM_NEXT = '/quiz?claim=1';

function getCallbackUrl(): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/auth/callback?next=${encodeURIComponent(CLAIM_NEXT)}`;
}

/**
 * Account gate shown from the matches / build-my-trip screens. Google and
 * Apple sign-in run through Supabase OAuth; email runs through Supabase's
 * OTP magic link. Either way the callback lands back on /quiz?claim=1,
 * where the quiz wizard claims the anonymous session and creates the trip.
 */
export default function SaveGate({ onClose }: SaveGateProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState<'email' | Provider | null>(null);

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();

    if (!EMAIL_RE.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setLoading('email');
    track('quiz_save', { hasEmail: true });
    trackLead({ content_name: 'Quiz Save Matches' });

    try {
      const supabase = createBrowserSupabase();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo: getCallbackUrl() },
      });

      if (otpError) {
        setError(otpError.message);
      } else {
        setEmailSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(null);
    }
  }

  async function handleOAuth(provider: Provider) {
    setError(null);
    setLoading(provider);
    track('quiz_save', { hasEmail: false, provider });
    trackLead({ content_name: 'Quiz Save Matches' });

    try {
      const supabase = createBrowserSupabase();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: getCallbackUrl() },
      });

      if (oauthError) {
        setError(oauthError.message);
        setLoading(null);
      }
      // On success Supabase navigates the browser away; no further state change needed.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
      setLoading(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
        >
          &times;
        </button>

        {emailSent ? (
          <div className="text-center py-6">
            <h2 className="text-lg font-extrabold text-gray-900 mb-2">Check your inbox</h2>
            <p className="text-sm text-gray-500">
              We sent a sign-in link to <span className="font-semibold text-gray-700">{email}</span>.
              Open it on this device to continue.
            </p>
            <button
              type="button"
              onClick={() => setEmailSent(false)}
              className="mt-4 text-sm text-brand-600 hover:text-brand-700 font-semibold"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Save your matches</h2>
            <p className="text-gray-600 mb-5">
              Create a free VacationPro account to save your trip and build your personalized itinerary.
            </p>

            <div className="space-y-2.5 mb-4">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-2.5 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.89c2.27-2.09 3.57-5.17 3.57-8.83z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.89-3.02c-1.08.72-2.46 1.15-4.04 1.15-3.11 0-5.74-2.1-6.68-4.92H1.3v3.11C3.27 21.3 7.31 24 12 24z" />
                  <path fill="#FBBC05" d="M5.32 14.31a7.2 7.2 0 0 1 0-4.62V6.58H1.3a11.98 11.98 0 0 0 0 10.84l4.02-3.11z" />
                  <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.27 2.7 1.3 6.58l4.02 3.11c.94-2.82 3.57-4.92 6.68-4.92z" />
                </svg>
                {loading === 'google' ? 'Redirecting...' : 'Continue with Google'}
              </button>

              <button
                type="button"
                onClick={() => handleOAuth('apple')}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-2.5 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.365 1.43c0 1.14-.462 2.245-1.208 3.043-.822.876-2.186 1.55-3.32 1.55-.13 0-.26-.02-.354-.033-.017-.11-.03-.24-.03-.372 0-1.096.51-2.24 1.278-3.006C13.51.79 14.99.06 16.05 0c.017.144.03.267.03.394 0 1.037-.462 2.245-1.208 3.043zM20.5 17.2c-.5 1.15-.74 1.66-1.38 2.68-.9 1.43-2.16 3.2-3.72 3.22-1.4.02-1.76-.9-3.66-.9-1.9 0-2.3.88-3.7.92-1.55.05-2.73-1.55-3.63-2.98C2.1 16.86 1.4 13.24 2.34 10.72c.65-1.75 1.9-2.85 3.24-2.87 1.42-.02 2.32.95 3.7.95 1.38 0 2.24-.95 3.7-.95 1.15 0 2.37.62 3.23 1.7-2.84 1.55-2.38 5.58.29 6.65z" />
                </svg>
                {loading === 'apple' ? 'Redirecting...' : 'Continue with Apple'}
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">Or</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <form onSubmit={handleEmailSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mb-2 text-gray-900 focus:border-brand-500 focus:outline-none"
              />
              {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
              <button
                type="submit"
                disabled={loading !== null}
                className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl py-3.5 font-bold w-full"
              >
                {loading === 'email' ? 'Sending...' : 'Continue with email'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
