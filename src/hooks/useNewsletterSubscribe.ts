'use client';

import { useState } from 'react';

interface SubscribeOptions {
  utmSource?: string;
  utmCampaign?: string;
  referringSite?: string;
}

interface SubscribeState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

export function useNewsletterSubscribe(options?: SubscribeOptions) {
  const [state, setState] = useState<SubscribeState>({
    status: 'idle',
    message: '',
  });

  const subscribe = async (email: string, firstName?: string) => {
    if (!email || !email.includes('@')) {
      setState({ status: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setState({ status: 'loading', message: '' });

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName: firstName || undefined,
          utmSource: options?.utmSource || 'vacationpro',
          utmMedium: 'website',
          utmCampaign: options?.utmCampaign || 'deal_alerts',
          referringSite: options?.referringSite,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState({
          status: 'error',
          message: data.error || 'Something went wrong. Please try again.',
        });
        return;
      }

      setState({
        status: 'success',
        message: data.message || "You're subscribed! Check your inbox.",
      });
    } catch {
      setState({
        status: 'error',
        message: 'Network error. Please check your connection and try again.',
      });
    }
  };

  const reset = () => setState({ status: 'idle', message: '' });

  return { ...state, subscribe, reset };
}
