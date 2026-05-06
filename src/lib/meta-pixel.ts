/**
 * Meta Pixel event helpers.
 * Use from client components to fire standard or custom events.
 *
 * Standard events: https://www.facebook.com/business/help/402791146561655
 *
 * Examples:
 *   trackLead({ content_name: 'Punta Cana Quote Form', value: 697, currency: 'USD' });
 *   trackViewContent({ content_ids: ['punta-cana-697'], content_type: 'product', value: 697, currency: 'USD' });
 *   trackEvent('Schedule', { content_name: 'Webinar Booking' });
 */

type FbqArgs = unknown[];

function fbq(...args: FbqArgs) {
  if (typeof window === 'undefined') return;
  const w = window as typeof window & { fbq?: (...args: FbqArgs) => void };
  if (w.fbq) w.fbq(...args);
}

interface LeadEventParams {
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
}

interface ViewContentParams {
  content_ids?: string[];
  content_name?: string;
  content_category?: string;
  content_type?: 'product' | 'product_group';
  value?: number;
  currency?: string;
}

interface PurchaseParams {
  value: number;
  currency: string;
  content_ids?: string[];
  content_name?: string;
  content_type?: 'product' | 'product_group';
  num_items?: number;
}

export function trackLead(params: LeadEventParams = {}) {
  fbq('track', 'Lead', params);
}

export function trackViewContent(params: ViewContentParams = {}) {
  fbq('track', 'ViewContent', params);
}

export function trackPurchase(params: PurchaseParams) {
  fbq('track', 'Purchase', params);
}

export function trackInitiateCheckout(params: ViewContentParams = {}) {
  fbq('track', 'InitiateCheckout', params);
}

export function trackCompleteRegistration(params: { content_name?: string; value?: number; currency?: string } = {}) {
  fbq('track', 'CompleteRegistration', params);
}

export function trackSubscribe(params: { value?: number; currency?: string; predicted_ltv?: number } = {}) {
  fbq('track', 'Subscribe', params);
}

export function trackEvent(event: string, params: Record<string, unknown> = {}) {
  fbq('track', event, params);
}

export function trackCustomEvent(event: string, params: Record<string, unknown> = {}) {
  fbq('trackCustom', event, params);
}
