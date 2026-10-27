import { CURRENCIES, MAX_PRIORITIES, PRIORITIES, type Currency, type Priority, type TripDates } from '@vacationpro/engine';
import { resortIdSet } from '@/lib/resorts/catalog';

/**
 * Server-side validation for quote requests. Pure and shared by the API
 * route and its tests; the form runs the same rules for inline errors.
 *
 * Collects only what Brendan needs to quote. No passports, payment details
 * or dates of birth, and notes that look like a card number are rejected.
 */

export const CONTACT_PREFERENCES = ['email', 'phone', 'text', 'whatsapp'] as const;
export const TRIP_SCOPES = ['hotel-only', 'flight-and-hotel', 'not-sure'] as const;
export const BOOKING_TIMEFRAMES = ['asap', 'within-month', '1-3-months', '3-plus-months', 'just-researching'] as const;
export const FLIGHTS_ANSWERS = ['yes', 'no', 'unsure'] as const;

export type ContactPreference = (typeof CONTACT_PREFERENCES)[number];
export type TripScope = (typeof TRIP_SCOPES)[number];
export type BookingTimeframe = (typeof BOOKING_TIMEFRAMES)[number];

export const MIN_FILL_MS = 2500;
const MAX_NOTES = 1500;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const CARD_RE = /\b(?:\d[ -]?){13,19}\b/;

const RESORT_IDS = resortIdSet();

export interface QuoteInput {
  idempotencyKey: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  contactPreference: ContactPreference;
  marketingConsent: boolean;
  selectedResortId: string | null;
  alternativeResortIds: string[];
  destination: string | null;
  dates: TripDates | null;
  datesNote: string | null;
  adults: number;
  childAges: number[];
  rooms: number;
  departureAirport: string | null;
  budgetAmount: number | null;
  budgetCurrency: Currency | null;
  budgetIncludesFlights: (typeof FLIGHTS_ANSWERS)[number] | null;
  tripScope: TripScope;
  bookingTimeframe: BookingTimeframe;
  priorities: Priority[];
  atmosphere: string | null;
  notes: string | null;
  quizAnswers: Record<string, unknown> | null;
  source: string | null;
  sourcePage: string | null;
  utm: Record<string, string>;
  journeyId: string | null;
  quizSessionId: string | null;
}

export type QuoteValidation =
  | { ok: true; value: QuoteInput }
  | { ok: false; errors: Record<string, string>; spam?: boolean };

function str(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

function isIsoDate(s: unknown): s is string {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
}

function oneOf<T extends string>(v: unknown, list: readonly T[]): T | null {
  return typeof v === 'string' && (list as readonly string[]).includes(v) ? (v as T) : null;
}

export function validateQuote(body: unknown, now: number = Date.now()): QuoteValidation {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, errors: { form: 'Invalid request.' } };
  }
  const b = body as Record<string, unknown>;
  const errors: Record<string, string> = {};

  // Spam signals. Reported without detail so bots learn nothing.
  const honeypot = typeof b.company === 'string' && b.company.trim() !== '';
  const startedAt = typeof b.startedAt === 'number' ? b.startedAt : null;
  const tooFast = startedAt !== null && now - startedAt < MIN_FILL_MS;
  if (honeypot || tooFast) return { ok: false, errors: { form: 'Please try again.' }, spam: true };

  const idempotencyKey = typeof b.idempotencyKey === 'string' && UUID_RE.test(b.idempotencyKey) ? b.idempotencyKey : null;
  if (!idempotencyKey) errors.form = 'Please refresh the page and try again.';

  const firstName = str(b.firstName, 80);
  if (!firstName) errors.firstName = 'Tell us your first name.';
  const email = str(b.email, 254)?.toLowerCase() ?? null;
  if (!email) errors.email = 'Enter your email.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email.';

  const phone = str(b.phone, 30);
  if (phone && (phone.replace(/\D/g, '').length < 7 || phone.replace(/\D/g, '').length > 15)) {
    errors.phone = 'Enter a valid phone number, or leave it blank.';
  }
  const contactPreference = oneOf(b.contactPreference, CONTACT_PREFERENCES) ?? 'email';
  if (contactPreference !== 'email' && !phone) errors.phone = 'Add a phone number so Brendan can reach you that way.';

  const selectedResortId = str(b.selectedResortId, 80);
  if (selectedResortId && !RESORT_IDS.has(selectedResortId)) errors.selectedResortId = 'Unknown resort.';
  const alternativeResortIds = Array.isArray(b.alternativeResortIds)
    ? b.alternativeResortIds.filter((x): x is string => typeof x === 'string' && RESORT_IDS.has(x) && x !== selectedResortId).slice(0, 5)
    : [];

  const destination = str(b.destination, 80);

  let dates: TripDates | null = null;
  const d = b.dates as Record<string, unknown> | null | undefined;
  if (d && typeof d === 'object') {
    if (d.mode === 'exact') {
      if (!isIsoDate(d.checkIn) || !isIsoDate(d.checkOut)) errors.dates = 'Choose check-in and check-out dates.';
      else {
        const today = new Date(now).toISOString().slice(0, 10);
        const nights = Math.round((Date.parse(`${d.checkOut}T00:00:00Z`) - Date.parse(`${d.checkIn}T00:00:00Z`)) / 86_400_000);
        if (d.checkIn < today) errors.dates = 'Check-in cannot be in the past.';
        else if (nights < 1) errors.dates = 'Check-out must be after check-in.';
        else if (nights > 60) errors.dates = 'For stays over 60 nights, describe your dates in the notes.';
        else dates = { mode: 'exact', checkIn: d.checkIn, checkOut: d.checkOut };
      }
    } else if (d.mode === 'flexible') {
      const month = typeof d.month === 'string' && /^\d{4}-\d{2}$/.test(d.month) ? d.month : null;
      const nights = typeof d.nights === 'number' && Number.isInteger(d.nights) && d.nights >= 1 && d.nights <= 60 ? d.nights : null;
      if (nights === null) errors.dates = 'How many nights?';
      else dates = { mode: 'flexible', month, nights };
    }
  }
  const datesNote = str(b.datesNote, 200);
  if (!dates && !datesNote && !errors.dates) errors.dates = 'Add dates, or tell us roughly when.';

  const adults = typeof b.adults === 'number' ? b.adults : NaN;
  if (!Number.isInteger(adults) || adults < 1 || adults > 12) errors.adults = 'Between 1 and 12 adults.';
  const childAges = Array.isArray(b.childAges) ? b.childAges : [];
  if (childAges.length > 8) errors.childAges = 'Up to 8 children. Tell us about larger groups in the notes.';
  else if (!childAges.every((a) => typeof a === 'number' && Number.isInteger(a) && a >= 0 && a <= 17)) {
    errors.childAges = 'Choose an age for each child.';
  }
  const rooms = typeof b.rooms === 'number' ? b.rooms : NaN;
  if (!Number.isInteger(rooms) || rooms < 1 || rooms > 6) errors.rooms = 'Between 1 and 6 rooms.';
  else if (Number.isInteger(adults) && rooms > adults) errors.rooms = 'Each room needs at least one adult.';

  const departureAirport = str(b.departureAirport, 60);

  let budgetAmount: number | null = null;
  if (b.budgetAmount !== null && b.budgetAmount !== undefined && b.budgetAmount !== '') {
    const n = Number(b.budgetAmount);
    if (!Number.isFinite(n) || n < 300 || n > 250_000) errors.budgetAmount = 'Enter a total between 300 and 250,000, or leave it blank.';
    else budgetAmount = Math.round(n * 100) / 100;
  }
  const budgetCurrency = oneOf(b.budgetCurrency, CURRENCIES as readonly Currency[]);
  const budgetIncludesFlights = oneOf(b.budgetIncludesFlights, FLIGHTS_ANSWERS);

  const tripScope = oneOf(b.tripScope, TRIP_SCOPES);
  if (!tripScope) errors.tripScope = 'Hotel only, or flights too?';
  const bookingTimeframe = oneOf(b.bookingTimeframe, BOOKING_TIMEFRAMES);
  if (!bookingTimeframe) errors.bookingTimeframe = 'When are you hoping to book?';

  const priorities = Array.isArray(b.priorities)
    ? (b.priorities.filter((p) => PRIORITIES.includes(p as Priority)) as Priority[]).slice(0, Math.max(MAX_PRIORITIES, 3))
    : [];
  const atmosphere = oneOf(b.atmosphere, ['quiet', 'balanced', 'social', 'unsure'] as const);

  const notes = str(b.notes, MAX_NOTES + 1);
  if (notes && notes.length > MAX_NOTES) errors.notes = `Keep notes under ${MAX_NOTES} characters.`;
  if (notes && CARD_RE.test(notes)) errors.notes = 'Please remove card or account numbers. Brendan never needs payment details here.';

  const quizAnswers =
    b.quizAnswers && typeof b.quizAnswers === 'object' && !Array.isArray(b.quizAnswers) && JSON.stringify(b.quizAnswers).length <= 8000
      ? (b.quizAnswers as Record<string, unknown>)
      : null;

  const utm: Record<string, string> = {};
  if (b.utm && typeof b.utm === 'object') {
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const v = str((b.utm as Record<string, unknown>)[k], 120);
      if (v) utm[k] = v;
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      idempotencyKey: idempotencyKey!,
      firstName: firstName!,
      lastName: str(b.lastName, 80),
      email: email!,
      phone,
      contactPreference,
      marketingConsent: b.marketingConsent === true,
      selectedResortId,
      alternativeResortIds,
      destination,
      dates,
      datesNote,
      adults,
      childAges: childAges as number[],
      rooms,
      departureAirport,
      budgetAmount,
      budgetCurrency: budgetAmount !== null ? budgetCurrency ?? 'USD' : budgetCurrency,
      budgetIncludesFlights,
      tripScope: tripScope!,
      bookingTimeframe: bookingTimeframe!,
      priorities,
      atmosphere,
      notes,
      quizAnswers,
      source: str(b.source, 80),
      sourcePage: str(b.sourcePage, 300),
      utm,
      journeyId: typeof b.journeyId === 'string' && UUID_RE.test(b.journeyId) ? b.journeyId : null,
      quizSessionId: typeof b.quizSessionId === 'string' && UUID_RE.test(b.quizSessionId) ? b.quizSessionId : null,
    },
  };
}

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Short, unambiguous reference like VP-7KQ3MX (no 0/O, 1/I). */
export function makeReference(random: () => number = Math.random): string {
  let s = '';
  for (let i = 0; i < 6; i++) s += REF_ALPHABET[Math.floor(random() * REF_ALPHABET.length)];
  return `VP-${s}`;
}
