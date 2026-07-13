'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNewsletterSubscribe } from '@/hooks/useNewsletterSubscribe';

const STORAGE_SUBSCRIBED = 'vp_newsletter_subscribed';
const STORAGE_DISMISSED = 'vp_newsletter_dismissed_at';
const DISMISS_SUPPRESS_DAYS = 30;
const SCROLL_TRIGGER_RATIO = 0.35; // show after scrolling 35% of the page

export default function EmailPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const { status, message, subscribe } = useNewsletterSubscribe({
    utmCampaign: 'scroll_popup',
  });

  const suppressed = useCallback(() => {
    if (typeof window === 'undefined') return true;
    if (localStorage.getItem(STORAGE_SUBSCRIBED) === '1') return true;
    const dismissedAt = localStorage.getItem(STORAGE_DISMISSED);
    if (dismissedAt) {
      const days = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (days < DISMISS_SUPPRESS_DAYS) return true;
    }
    return false;
  }, []);

  // Scroll trigger: reveal once the reader scrolls past the threshold.
  useEffect(() => {
    if (suppressed()) return;
    let fired = false;
    const onScroll = () => {
      if (fired) return;
      const scrolled = window.scrollY;
      const reach = document.documentElement.scrollHeight - window.innerHeight;
      if (reach > 0 && scrolled / reach >= SCROLL_TRIGGER_RATIO) {
        fired = true;
        setOpen(true);
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [suppressed]);

  const close = useCallback(() => {
    setOpen(false);
    if (status !== 'success') {
      localStorage.setItem(STORAGE_DISMISSED, String(Date.now()));
    }
  }, [status]);

  // Persist the subscribed flag so it never shows again after joining.
  useEffect(() => {
    if (status === 'success' && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_SUBSCRIBED, '1');
    }
  }, [status]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await subscribe(email);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Subscribe to VacationPro deal alerts"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} aria-hidden="true" />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-500 transition hover:bg-white hover:text-gray-800"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Branded header band */}
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 px-7 pt-8 pb-6 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-brand-50">VacationPro</p>
          {status === 'success' ? (
            <h2 className="mt-2 text-2xl font-extrabold text-white">You are in.</h2>
          ) : (
            <h2 className="mt-2 text-2xl font-extrabold leading-tight text-white">
              Want the best all-inclusive deals?
            </h2>
          )}
        </div>

        <div className="px-7 pb-7 pt-5">
          {status === 'success' ? (
            <div className="text-center">
              <p className="text-gray-600">
                {message || 'Check your inbox to confirm. We will send you our best resort picks, deals, and travel tips.'}
              </p>
              <button
                onClick={close}
                className="mt-5 w-full rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <p className="text-center text-gray-600">
                Get our best all-inclusive deals, resort picks, and travel tips in your inbox. No spam, unsubscribe anytime.
              </p>
              <form onSubmit={onSubmit} className="mt-5 space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                  autoComplete="email"
                  disabled={status === 'loading'}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                />
                {status === 'error' && <p className="text-sm text-danger">{message}</p>}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full rounded-xl bg-brand-500 px-6 py-3 font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
                >
                  {status === 'loading' ? 'Joining...' : 'Send me deals'}
                </button>
              </form>
              <button onClick={close} className="mt-3 w-full text-center text-sm text-gray-400 transition hover:text-gray-600">
                No thanks
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
