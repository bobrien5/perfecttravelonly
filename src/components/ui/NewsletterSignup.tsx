'use client';

import { useState } from 'react';
import { useNewsletterSubscribe } from '@/hooks/useNewsletterSubscribe';

interface NewsletterSignupProps {
  variant?: 'default' | 'hero' | 'inline';
  heading?: string;
  subheading?: string;
  utmCampaign?: string;
}

export default function NewsletterSignup({
  variant = 'default',
  heading = 'Get the best vacation deals delivered to your inbox',
  subheading = 'Join 25,000+ travelers who never miss a deal. Free, no spam, unsubscribe anytime.',
  utmCampaign,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const { status, message, subscribe } = useNewsletterSubscribe({
    utmCampaign: utmCampaign || `deal_alerts_${variant}`,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await subscribe(email);
  };

  // --- INLINE VARIANT ---
  if (variant === 'inline') {
    if (status === 'success') {
      return (
        <p className="text-sm text-brand-600 font-medium py-3">
          ✓ {message}
        </p>
      );
    }

    return (
      <div>
        <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={status === 'loading'}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Subscribing...' : 'Get Deal Alerts'}
          </button>
        </form>
        {status === 'error' && (
          <p className="text-sm text-red-600 mt-2">{message}</p>
        )}
      </div>
    );
  }

  // --- HERO VARIANT ---
  if (variant === 'hero') {
    if (status === 'success') {
      return (
        <section className="bg-brand-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">You&apos;re Subscribed!</h3>
          <p className="text-brand-100">{message}</p>
        </section>
      );
    }

    return (
      <section className="bg-brand-600 rounded-2xl p-8 md:p-12 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">{heading}</h2>
        <p className="text-brand-100 mb-6 max-w-lg mx-auto">{subheading}</p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={status === 'loading'}
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 bg-white text-brand-700 font-semibold rounded-lg hover:bg-brand-50 transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe Free'}
          </button>
        </form>
        {status === 'error' && (
          <p className="text-sm text-red-200 mt-3">{message}</p>
        )}
        <p className="text-xs text-brand-200 mt-3">No spam, ever. Unsubscribe anytime.</p>
      </section>
    );
  }

  // --- DEFAULT VARIANT ---
  if (status === 'success') {
    return (
      <section className="bg-gradient-to-r from-brand-50 to-green-50 rounded-2xl p-8 md:p-12 text-center">
        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">You&apos;re Subscribed!</h3>
        <p className="text-gray-600">{message}</p>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-r from-brand-50 to-green-50 rounded-2xl p-8 md:p-12 text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{heading}</h2>
      <p className="text-gray-600 mb-6 max-w-lg mx-auto">{subheading}</p>
      <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={status === 'loading'}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Subscribing...' : 'Get Deal Alerts'}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-sm text-red-600 mt-3">{message}</p>
      )}
      <p className="text-xs text-gray-500 mt-3">No spam, ever. Unsubscribe anytime.</p>
    </section>
  );
}
