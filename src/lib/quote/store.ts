import { createClient } from '@supabase/supabase-js';
import type { QuoteInput } from './validate';

/**
 * Persistence for quote requests. The interface keeps the route logic
 * testable without a database; the Supabase implementation uses the
 * service-role client (the table has RLS on and no policies).
 */

/**
 * Dedicated service-role client with a request timeout. A hung database call
 * must turn into an honest, retryable error for the traveler rather than a
 * request that never finishes.
 */
const STORE_TIMEOUT_MS = 8000;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key',
  {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(STORE_TIMEOUT_MS) }) },
  },
);

export interface StoredQuote {
  id: string;
  reference: string;
}

export interface NotificationResult {
  travelerEmail: 'sent' | 'failed' | 'skipped';
  advisorEmail: 'sent' | 'failed' | 'skipped';
  crm: 'sent' | 'failed' | 'skipped';
  errors?: string[];
  at: string;
}

export interface QuoteStore {
  findByIdempotencyKey(key: string): Promise<StoredQuote | null>;
  findRecentDuplicate(email: string, resortId: string | null, sinceIso: string): Promise<StoredQuote | null>;
  countRecentByIp(ipHash: string, sinceIso: string): Promise<number>;
  insert(input: QuoteInput, extra: { reference: string; ipHash: string | null; commissionRate: number }): Promise<StoredQuote>;
  recordNotification(id: string, result: NotificationResult): Promise<void>;
}

export class StoreError extends Error {
  constructor(message: string, readonly code?: string) {
    super(message);
    this.name = 'StoreError';
  }
}

export function toRow(input: QuoteInput, extra: { reference: string; ipHash: string | null; commissionRate: number }) {
  return {
    reference: extra.reference,
    idempotency_key: input.idempotencyKey,
    source: input.source,
    source_page: input.sourcePage,
    utm: input.utm,
    journey_id: input.journeyId,
    quiz_session_id: input.quizSessionId,
    ip_hash: extra.ipHash,
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    phone: input.phone,
    contact_preference: input.contactPreference,
    marketing_consent: input.marketingConsent,
    selected_resort_id: input.selectedResortId,
    alternative_resort_ids: input.alternativeResortIds,
    destination: input.destination,
    dates: input.dates,
    dates_note: input.datesNote,
    adults: input.adults,
    child_ages: input.childAges,
    rooms: input.rooms,
    departure_airport: input.departureAirport,
    budget_amount: input.budgetAmount,
    budget_currency: input.budgetCurrency,
    budget_includes_flights: input.budgetIncludesFlights,
    trip_scope: input.tripScope,
    booking_timeframe: input.bookingTimeframe,
    priorities: input.priorities,
    atmosphere: input.atmosphere,
    notes: input.notes,
    quiz_answers: input.quizAnswers,
    commission_rate: extra.commissionRate,
    status: 'new',
    status_history: [{ status: 'new', at: new Date().toISOString() }],
  };
}

export const supabaseQuoteStore: QuoteStore = {
  async findByIdempotencyKey(key) {
    const { data, error } = await supabase.from('quote_requests').select('id, reference').eq('idempotency_key', key).maybeSingle();
    if (error) throw new StoreError(error.message, error.code);
    return data;
  },
  async findRecentDuplicate(email, resortId, sinceIso) {
    let q = supabase.from('quote_requests').select('id, reference').eq('email', email).gte('created_at', sinceIso);
    q = resortId ? q.eq('selected_resort_id', resortId) : q.is('selected_resort_id', null);
    const { data, error } = await q.order('created_at', { ascending: false }).limit(1);
    if (error) throw new StoreError(error.message, error.code);
    return data?.[0] ?? null;
  },
  async countRecentByIp(ipHash, sinceIso) {
    const { count, error } = await supabase
      .from('quote_requests')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', sinceIso);
    if (error) throw new StoreError(error.message, error.code);
    return count ?? 0;
  },
  async insert(input, extra) {
    const { data, error } = await supabase.from('quote_requests').insert(toRow(input, extra)).select('id, reference').single();
    if (error) throw new StoreError(error.message, error.code);
    return data;
  },
  async recordNotification(id, result) {
    const { error } = await supabase.from('quote_requests').update({ notification: result }).eq('id', id);
    if (error) throw new StoreError(error.message, error.code);
  },
};
