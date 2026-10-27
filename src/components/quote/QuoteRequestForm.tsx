'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  CURRENCIES,
  RESORT_QUIZ_STORAGE_KEY,
  deserializeQuiz,
  type Currency,
  type Priority,
  type TripAnswers,
  type TripDates,
} from '@vacationpro/engine';
import { Choice, ChoiceGroup, FieldError, Stepper, inputClass, primaryButton } from '@/app/quiz/resort/ui';
import { getJourneyId, trackFunnel } from '@/lib/analytics/journey';
import { destinationsByCountry } from '@/lib/resorts/meta';
import { trackLead } from '@/lib/meta-pixel';

interface ResortRef {
  id: string;
  name: string;
  destination?: string;
  status?: 'active' | 'hidden';
  hiddenReason?: string;
}

interface Props {
  /** Resolved on the server, so the browser never loads the catalog. */
  initialResort?: ResortRef | null;
  initialAlternatives?: ResortRef[];
  initialDestination?: string | null;
  source?: string | null;
  responseCopy: string;
}

const PRIORITY_LABELS: Record<Priority, string> = {
  beach: 'Beach', food: 'Food', pools: 'Pools', rooms: 'Rooms', nightlife: 'Nightlife', value: 'Value', family: 'Family amenities',
};

const TIMEFRAMES = [
  { value: 'asap', label: 'As soon as possible' },
  { value: 'within-month', label: 'Within a month' },
  { value: '1-3-months', label: 'In 1 to 3 months' },
  { value: '3-plus-months', label: 'More than 3 months out' },
  { value: 'just-researching', label: 'Just researching' },
];

type Flights = 'yes' | 'no' | 'unsure' | '';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  contactPreference: 'email' | 'phone' | 'text' | 'whatsapp';
  marketingConsent: boolean;
  selectedResortId: string;
  alternativeResortIds: string[];
  destination: string;
  dates: TripDates | null;
  datesNote: string;
  adults: number;
  childAges: number[];
  rooms: number;
  departureAirport: string;
  budgetAmount: string;
  budgetCurrency: Currency;
  budgetIncludesFlights: Flights;
  tripScope: '' | 'hotel-only' | 'flight-and-hotel' | 'not-sure';
  bookingTimeframe: string;
  priorities: Priority[];
  atmosphere: string | null;
  notes: string;
}

function fromQuiz(a: TripAnswers): Partial<FormState> {
  const flights: Flights = a.budget?.includesFlights === true ? 'yes' : a.budget?.includesFlights === false ? 'no' : a.budget?.includesFlights === 'unsure' ? 'unsure' : '';
  return {
    destination: a.destination ?? '',
    dates: a.dates,
    adults: a.adults,
    childAges: a.childAges.filter((x) => x >= 0),
    rooms: a.rooms,
    departureAirport: a.airport && a.airport !== 'skip' ? a.airport : '',
    budgetAmount: a.budget?.amount != null ? String(a.budget.amount) : '',
    budgetCurrency: a.budget?.currency ?? 'USD',
    budgetIncludesFlights: flights,
    tripScope: a.budget?.includesFlights === true ? 'flight-and-hotel' : a.budget?.includesFlights === false ? 'hotel-only' : '',
    priorities: a.priorities,
    atmosphere: a.atmosphere,
    notes: a.notes,
  };
}

function newKey(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return '00000000-0000-4000-8000-' + String(Date.now()).padStart(12, '0').slice(-12);
  }
}

export default function QuoteRequestForm({ initialResort = null, initialAlternatives = [], initialDestination, source, responseCopy }: Props) {
  const [f, setF] = useState<FormState>({
    firstName: '', lastName: '', email: '', phone: '', contactPreference: 'email', marketingConsent: false,
    selectedResortId: initialResort?.status === 'active' ? initialResort.id : '',
    alternativeResortIds: initialAlternatives.map((a) => a.id),
    destination: initialDestination ?? initialResort?.destination ?? '',
    dates: null, datesNote: '', adults: 2, childAges: [], rooms: 1, departureAirport: '',
    budgetAmount: '', budgetCurrency: 'USD', budgetIncludesFlights: '', tripScope: '', bookingTimeframe: '',
    priorities: [], atmosphere: null, notes: '',
  });
  const [quiz, setQuiz] = useState<TripAnswers | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState('');
  const [reference, setReference] = useState('');
  const keyRef = useRef<string>('');
  const startedAt = useRef<number>(0);
  const startedTracked = useRef(false);
  const [names, setNames] = useState<Record<string, string>>(() =>
    Object.fromEntries([...(initialResort ? [initialResort] : []), ...initialAlternatives].map((r) => [r.id, r.name])),
  );
  const [options, setOptions] = useState<{ id: string; name: string }[]>([]);

  // Resorts for the chosen destination, fetched on demand (the full catalog stays on the server).
  useEffect(() => {
    if (!f.destination || f.destination === 'open') {
      setOptions([]);
      return;
    }
    const ctrl = new AbortController();
    fetch(`/api/resorts?destination=${encodeURIComponent(f.destination)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : { resorts: [] }))
      .then((d: { resorts: { id: string; name: string }[] }) => {
        setOptions(d.resorts);
        setNames((n) => ({ ...n, ...Object.fromEntries(d.resorts.map((r) => [r.id, r.name])) }));
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [f.destination]);

  // Prefill from the quiz saved on this device. Never sent anywhere until
  // submit. Read after mount (localStorage is client-only) so the server and
  // first client render match.
  useEffect(() => {
    keyRef.current = newKey();
    startedAt.current = Date.now();
    const frame = requestAnimationFrame(() => {
      let stored = null;
      try {
        stored = deserializeQuiz(window.localStorage.getItem(RESORT_QUIZ_STORAGE_KEY));
      } catch {
        stored = null;
      }
      if (!stored || stored.answers.priorities.length === 0) return;
      const a = stored.answers;
      setQuiz(a);
      setF((prev) => {
        const q = fromQuiz(a);
        // Keep a destination implied by the chosen resort over the quiz's "open".
        const destination = prev.destination && prev.destination !== 'open' ? prev.destination : q.destination || prev.destination || '';
        return { ...prev, ...q, destination, alternativeResortIds: prev.alternativeResortIds, selectedResortId: prev.selectedResortId };
      });
      // Fill alternatives from the visitor's own matches when none were passed in.
      if (initialAlternatives.length === 0) {
        fetch('/api/recommendations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: a }) })
          .then((r) => (r.ok ? r.json() : null))
          .then((d: { recommendations: { resort: { id: string; name: string } }[]; others: { id: string; name: string }[] } | null) => {
            if (!d) return;
            const ranked = [...d.recommendations.map((x) => x.resort), ...d.others];
            setNames((n) => ({ ...n, ...Object.fromEntries(ranked.map((r) => [r.id, r.name])) }));
            setF((prev) => ({
              ...prev,
              alternativeResortIds: prev.alternativeResortIds.length
                ? prev.alternativeResortIds
                : ranked.map((r) => r.id).filter((id) => id !== prev.selectedResortId).slice(0, 2),
            }));
          })
          .catch(() => {});
      }
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    // Arrivals from a "Get a Quote" button already logged quote_start on click.
    if (!startedTracked.current) {
      startedTracked.current = true;
      if (!source)
        trackFunnel('quote_start', { placement: 'quote-page', resort_id: f.selectedResortId || null, from_quiz: Boolean(quiz) });
    }
    setF((p) => ({ ...p, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k as string]: '' }));
  };

  const alternatives = f.alternativeResortIds.filter((id) => names[id]).map((id) => ({ id, name: names[id] }));

  function clientErrors(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!f.firstName.trim()) e.firstName = 'Tell us your first name.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) e.email = 'Enter a valid email.';
    if (f.contactPreference !== 'email' && !f.phone.trim()) e.phone = 'Add a phone number so Brendan can reach you that way.';
    if (!f.dates && !f.datesNote.trim()) e.dates = 'Add dates, or tell us roughly when.';
    if (f.dates?.mode === 'exact' && (!f.dates.checkIn || !f.dates.checkOut)) e.dates = 'Choose check-in and check-out dates.';
    if (f.childAges.some((a) => a < 0)) e.childAges = 'Choose an age for each child.';
    if (f.rooms > f.adults) e.rooms = 'Each room needs at least one adult.';
    if (f.budgetAmount && f.budgetIncludesFlights === '') e.budgetIncludesFlights = 'Does this budget include flights?';
    if (!f.tripScope) e.tripScope = 'Hotel only, or flights too?';
    if (!f.bookingTimeframe) e.bookingTimeframe = 'When are you hoping to book?';
    return e;
  }

  function focusFirstError() {
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>('#quote-form [aria-invalid="true"], #quote-form [role="alert"]');
      el?.focus?.();
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const ce = clientErrors();
    if (Object.values(ce).some(Boolean)) {
      setErrors(ce);
      setServerError('Please check the highlighted fields.');
      focusFirstError();
      return;
    }
    setStatus('submitting');
    setServerError('');
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const v = params.get(k);
      if (v) utm[k] = v;
    }
    let sessionId: string | null = null;
    try {
      sessionId = window.localStorage.getItem('vacationpro.quiz.session.v1');
    } catch {
      sessionId = null;
    }
    const payload = {
      idempotencyKey: keyRef.current,
      startedAt: startedAt.current,
      company: String(form.get('company') ?? ''),
      ...f,
      selectedResortId: f.selectedResortId || null,
      destination: f.destination || null,
      budgetAmount: f.budgetAmount ? Number(f.budgetAmount) : null,
      budgetIncludesFlights: f.budgetIncludesFlights || null,
      quizAnswers: quiz,
      source: source ?? null,
      sourcePage: window.location.pathname,
      utm,
      journeyId: getJourneyId() || null,
      quizSessionId: sessionId,
    };
    try {
      const res = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; reference?: string; error?: string; fields?: Record<string, string> } | null;
      if (res.ok && data?.ok && data.reference) {
        setReference(data.reference);
        setStatus('success');
        trackFunnel('quote_submitted', { placement: source ?? 'quote-page', resort_id: f.selectedResortId || null, from_quiz: Boolean(quiz) });
        trackLead({ content_name: 'Quote Request' });
        requestAnimationFrame(() => document.getElementById('quote-success')?.focus());
        return;
      }
      if (data?.fields) setErrors(data.fields);
      setStatus('error');
      setServerError(data?.error || 'We could not send your request. Please try again.');
      trackFunnel('quote_failed', { http_status: res.status });
      focusFirstError();
    } catch {
      setStatus('error');
      // Timeout or network failure. The idempotency key is kept, so a retry can
      // never create a second request even if the first one did land.
      setServerError('We could not confirm your request was saved. Please try again; you will not be sent a duplicate.');
      trackFunnel('quote_failed', { http_status: 0 });
    }
  }

  if (status === 'success') {
    return (
      <div id="quote-success" tabIndex={-1} role="status" className="rounded-2xl bg-brand-50 p-6 outline-none ring-1 ring-brand-200 sm:p-8">
        <h2 className="text-2xl font-extrabold text-gray-900">Your request is in.</h2>
        <p className="mt-2 text-gray-800">
          Reference <strong className="font-mono">{reference}</strong>. {responseCopy}
        </p>
        <p className="mt-3 text-gray-700">
          A confirmation is on its way to <strong>{f.email}</strong> if email delivery is working. Your request is saved either way.
        </p>
        <p className="mt-3 text-gray-700">
          Requesting a quote does not reserve a room or complete a booking. Rates, availability and any extras depend on the actual quote.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link href="/quiz" className={primaryButton}>Back to my resort matches</Link>
          <Link href="/blog" className="inline-flex min-h-12 items-center justify-center px-4 font-bold text-brand-800 underline">Read our guides</Link>
        </div>
      </div>
    );
  }

  const submitting = status === 'submitting';
  const kids = f.childAges.length;

  return (
    <form id="quote-form" onSubmit={submit} noValidate className="space-y-8">
      {/* Honeypot: hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="q-company">Company</label>
        <input id="q-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {quiz && (
        <p className="rounded-xl bg-brand-50 p-4 text-sm text-brand-950">
          We filled in your trip from the resort quiz on this device. Check it, then add how to reach you.
        </p>
      )}

      <section aria-labelledby="qs-resort">
        <h3 id="qs-resort" className="mb-3 text-lg font-extrabold text-gray-900">Resort</h3>
        <label htmlFor="qf-destination" className="mb-1.5 block text-sm font-bold text-gray-800">Destination</label>
        <select id="qf-destination" value={f.destination} onChange={(e) => set('destination', e.target.value)} className={inputClass}>
          <option value="">Not sure yet</option>
          <option value="open">Open to suggestions</option>
          {destinationsByCountry().map((g) => (
            <optgroup key={g.country} label={g.country}>
              {g.destinations.map((d) => (
                <option key={d.slug} value={d.slug}>{d.name}</option>
              ))}
            </optgroup>
          ))}
        </select>

        <div className="mt-4">
          <label htmlFor="qf-resort" className="mb-1.5 block text-sm font-bold text-gray-800">Resort you want a quote for</label>
          <select id="qf-resort" value={f.selectedResortId} onChange={(e) => set('selectedResortId', e.target.value)} className={inputClass}>
            <option value="">Not sure yet, help me choose</option>
            {f.selectedResortId && !options.some((o) => o.id === f.selectedResortId) && names[f.selectedResortId] && (
              <option value={f.selectedResortId}>{names[f.selectedResortId]}</option>
            )}
            {options.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          {!f.destination || f.destination === 'open' ? (
            <p className="mt-1 text-xs text-gray-600">Choose a destination to see its resorts, or leave this for Brendan.</p>
          ) : null}
        </div>
        {initialResort && initialResort.status === 'hidden' && (
          <p className="mt-2 text-sm text-amber-900">{initialResort.name} is not currently offered: {initialResort.hiddenReason}</p>
        )}
        {alternatives.length > 0 && (
          <div className="mt-3 text-sm text-gray-700">
            <p>
              Also compare:{' '}
              {alternatives.map((r, i) => (
                <span key={r.id}>
                  {i > 0 && ', '}
                  <strong>{r.name}</strong>
                </span>
              ))}
            </p>
            <button type="button" className="mt-1 min-h-11 font-semibold text-brand-800 underline" onClick={() => set('alternativeResortIds', [])}>
              Remove alternatives
            </button>
          </div>
        )}
      </section>

      <section aria-labelledby="qs-trip">
        <h3 id="qs-trip" className="mb-3 text-lg font-extrabold text-gray-900">Trip</h3>
        <ChoiceGroup legend="Dates" errorId="qf-dates-error" error={errors.dates} columns={2}>
          <Choice type="radio" name="qf-date-mode" value="exact" checked={f.dates?.mode === 'exact'} onChange={() => set('dates', { mode: 'exact', checkIn: '', checkOut: '' })} label="I have dates" />
          <Choice type="radio" name="qf-date-mode" value="flexible" checked={f.dates?.mode === 'flexible'} onChange={() => set('dates', { mode: 'flexible', month: null, nights: 5 })} label="I'm flexible" />
        </ChoiceGroup>
        {f.dates?.mode === 'exact' && (
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="qf-in" className="mb-1.5 block text-sm font-bold text-gray-800">Check-in</label>
              <input id="qf-in" type="date" value={f.dates.checkIn} onChange={(e) => set('dates', { ...(f.dates as Extract<TripDates, { mode: 'exact' }>), checkIn: e.target.value })} className={inputClass} aria-invalid={errors.dates ? true : undefined} />
            </div>
            <div>
              <label htmlFor="qf-out" className="mb-1.5 block text-sm font-bold text-gray-800">Check-out</label>
              <input id="qf-out" type="date" value={f.dates.checkOut} onChange={(e) => set('dates', { ...(f.dates as Extract<TripDates, { mode: 'exact' }>), checkOut: e.target.value })} className={inputClass} aria-invalid={errors.dates ? true : undefined} />
            </div>
          </div>
        )}
        {f.dates?.mode === 'flexible' && (
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="qf-month" className="mb-1.5 block text-sm font-bold text-gray-800">Month (optional)</label>
              <input id="qf-month" type="month" value={f.dates.month ?? ''} onChange={(e) => set('dates', { mode: 'flexible', nights: (f.dates as Extract<TripDates, { mode: 'flexible' }>).nights, month: e.target.value || null })} className={inputClass} />
            </div>
            <Stepper id="qf-nights" label="Nights" value={f.dates.nights} min={1} max={60} onChange={(n) => set('dates', { mode: 'flexible', month: (f.dates as Extract<TripDates, { mode: 'flexible' }>).month, nights: Math.max(1, Math.min(60, n)) })} />
          </div>
        )}
        <label htmlFor="qf-dates-note" className="mb-1.5 block text-sm font-bold text-gray-800">Date flexibility (optional)</label>
        <input id="qf-dates-note" type="text" maxLength={200} placeholder="e.g. Any week in March, or plus or minus 3 days" value={f.datesNote} onChange={(e) => set('datesNote', e.target.value)} className={inputClass} />

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <Stepper id="qf-adults" label="Adults" value={f.adults} min={1} max={12} onChange={(n) => set('adults', Math.max(1, Math.min(12, n)))} />
          <Stepper id="qf-children" label="Children" value={kids} min={0} max={8} error={errors.childAges} onChange={(n) => set('childAges', Array.from({ length: Math.max(0, Math.min(8, n)) }, (_, i) => f.childAges[i] ?? -1))} />
          <Stepper id="qf-rooms" label="Rooms" value={f.rooms} min={1} max={6} error={errors.rooms} onChange={(n) => set('rooms', Math.max(1, Math.min(6, n)))} />
        </div>
        {kids > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {f.childAges.map((age, i) => (
              <div key={i}>
                <label htmlFor={`qf-child-${i}`} className="mb-1 block text-sm font-semibold text-gray-800">Child {i + 1} age</label>
                <select id={`qf-child-${i}`} value={age < 0 ? '' : String(age)} aria-invalid={age < 0 && errors.childAges ? true : undefined} onChange={(e) => set('childAges', f.childAges.map((v, j) => (j === i ? (e.target.value === '' ? -1 : Number(e.target.value)) : v)))} className={inputClass}>
                  <option value="">Age</option>
                  {Array.from({ length: 18 }, (_, a) => (
                    <option key={a} value={a}>{a === 0 ? 'Under 1' : a}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5">
          <label htmlFor="qf-airport" className="mb-1.5 block text-sm font-bold text-gray-800">Departure airport (optional)</label>
          <input id="qf-airport" type="text" maxLength={60} placeholder="City or airport code" value={f.departureAirport} onChange={(e) => set('departureAirport', e.target.value)} className={inputClass} />
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
          <div>
            <label htmlFor="qf-budget" className="mb-1.5 block text-sm font-bold text-gray-800">Total budget (optional)</label>
            <input id="qf-budget" type="number" inputMode="numeric" min={0} step={100} value={f.budgetAmount} onChange={(e) => set('budgetAmount', e.target.value)} className={inputClass} aria-invalid={errors.budgetAmount ? true : undefined} />
          </div>
          <div>
            <label htmlFor="qf-currency" className="mb-1.5 block text-sm font-bold text-gray-800">Currency</label>
            <select id="qf-currency" value={f.budgetCurrency} onChange={(e) => set('budgetCurrency', e.target.value as Currency)} className={inputClass}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <FieldError id="qf-budget-error" message={errors.budgetAmount} />
        {f.budgetAmount && (
          <div className="mt-4">
            <ChoiceGroup legend="Does that budget include flights?" errorId="qf-flights-error" error={errors.budgetIncludesFlights} columns={2}>
              <Choice type="radio" name="qf-flights" value="yes" checked={f.budgetIncludesFlights === 'yes'} onChange={() => set('budgetIncludesFlights', 'yes')} label="Yes" />
              <Choice type="radio" name="qf-flights" value="no" checked={f.budgetIncludesFlights === 'no'} onChange={() => set('budgetIncludesFlights', 'no')} label="No" />
              <Choice type="radio" name="qf-flights" value="unsure" checked={f.budgetIncludesFlights === 'unsure'} onChange={() => set('budgetIncludesFlights', 'unsure')} label="Not sure" />
            </ChoiceGroup>
          </div>
        )}

        <div className="mt-5">
          <ChoiceGroup legend="What should the quote cover?" errorId="qf-scope-error" error={errors.tripScope}>
            <Choice type="radio" name="qf-scope" value="hotel-only" checked={f.tripScope === 'hotel-only'} onChange={() => set('tripScope', 'hotel-only')} label="Resort only" />
            <Choice type="radio" name="qf-scope" value="flight-and-hotel" checked={f.tripScope === 'flight-and-hotel'} onChange={() => set('tripScope', 'flight-and-hotel')} label="Flights and resort" />
            <Choice type="radio" name="qf-scope" value="not-sure" checked={f.tripScope === 'not-sure'} onChange={() => set('tripScope', 'not-sure')} label="Not sure yet" />
          </ChoiceGroup>
        </div>

        <label htmlFor="qf-timeframe" className="mb-1.5 block text-sm font-bold text-gray-800">When are you hoping to book?</label>
        <select id="qf-timeframe" value={f.bookingTimeframe} aria-invalid={errors.bookingTimeframe ? true : undefined} aria-describedby={errors.bookingTimeframe ? 'qf-timeframe-error' : undefined} onChange={(e) => set('bookingTimeframe', e.target.value)} className={inputClass}>
          <option value="">Choose one</option>
          {TIMEFRAMES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <FieldError id="qf-timeframe-error" message={errors.bookingTimeframe} />

        <fieldset className="mt-5">
          <legend className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">What matters most (optional)</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => {
              const on = f.priorities.includes(p);
              return (
                <label key={p} className="cursor-pointer">
                  <input type="checkbox" className="peer sr-only" checked={on} onChange={() => set('priorities', on ? f.priorities.filter((x) => x !== p) : [...f.priorities, p].slice(0, 3))} />
                  <span className="inline-flex min-h-11 items-center rounded-full border-2 border-gray-300 px-4 text-sm font-semibold text-gray-800 peer-checked:border-brand-700 peer-checked:bg-brand-50 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-300">
                    {PRIORITY_LABELS[p]}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5">
          <label htmlFor="qf-notes" className="mb-1.5 block text-sm font-bold text-gray-800">Notes (optional)</label>
          <textarea id="qf-notes" rows={4} maxLength={1500} value={f.notes} onChange={(e) => set('notes', e.target.value)} aria-invalid={errors.notes ? true : undefined} aria-describedby="qf-notes-hint" className={`${inputClass} h-auto py-3`} placeholder="Celebrations, room preferences, accessibility needs, anything that helps." />
          <p id="qf-notes-hint" className="mt-1 text-xs text-gray-500">Please do not include passport, payment card, or account details.</p>
          <FieldError id="qf-notes-error" message={errors.notes} />
        </div>
      </section>

      <section aria-labelledby="qs-contact">
        <h3 id="qs-contact" className="mb-3 text-lg font-extrabold text-gray-900">How to reach you</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="qf-first" className="mb-1.5 block text-sm font-bold text-gray-800">First name</label>
            <input id="qf-first" type="text" autoComplete="given-name" maxLength={80} value={f.firstName} onChange={(e) => set('firstName', e.target.value)} className={inputClass} aria-invalid={errors.firstName ? true : undefined} aria-describedby={errors.firstName ? 'qf-first-error' : undefined} />
            <FieldError id="qf-first-error" message={errors.firstName} />
          </div>
          <div>
            <label htmlFor="qf-last" className="mb-1.5 block text-sm font-bold text-gray-800">Last name (optional)</label>
            <input id="qf-last" type="text" autoComplete="family-name" maxLength={80} value={f.lastName} onChange={(e) => set('lastName', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="qf-email" className="mb-1.5 block text-sm font-bold text-gray-800">Email</label>
            <input id="qf-email" type="email" autoComplete="email" maxLength={254} value={f.email} onChange={(e) => set('email', e.target.value)} className={inputClass} aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? 'qf-email-error' : undefined} />
            <FieldError id="qf-email-error" message={errors.email} />
          </div>
          <div>
            <label htmlFor="qf-phone" className="mb-1.5 block text-sm font-bold text-gray-800">Phone (optional)</label>
            <input id="qf-phone" type="tel" autoComplete="tel" maxLength={30} value={f.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} aria-invalid={errors.phone ? true : undefined} aria-describedby={errors.phone ? 'qf-phone-error' : undefined} />
            <FieldError id="qf-phone-error" message={errors.phone} />
          </div>
        </div>
        <div className="mt-4">
          <ChoiceGroup legend="Best way to reach you" columns={2}>
            {(['email', 'phone', 'text', 'whatsapp'] as const).map((c) => (
              <Choice key={c} type="radio" name="qf-contact" value={c} checked={f.contactPreference === c} onChange={() => set('contactPreference', c)} label={c === 'whatsapp' ? 'WhatsApp' : c.charAt(0).toUpperCase() + c.slice(1)} />
            ))}
          </ChoiceGroup>
        </div>
        <label className="flex items-start gap-3 text-sm text-gray-700">
          <input type="checkbox" checked={f.marketingConsent} onChange={(e) => set('marketingConsent', e.target.checked)} className="mt-0.5 h-5 w-5 accent-brand-700" />
          <span>Also send me the VacationPro newsletter with deals and travel tips. Optional, and separate from this quote.</span>
        </label>
      </section>

      {serverError && (
        <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800 ring-1 ring-red-200">
          {serverError}
        </div>
      )}

      <div>
        <button type="submit" disabled={submitting} className={`${primaryButton} w-full sm:w-auto`}>
          {submitting ? 'Sending...' : status === 'error' ? 'Try again' : 'Request my quote'}
        </button>
        <p className="mt-3 text-xs text-gray-600">
          Requesting a quote does not reserve a room or complete a booking. By submitting you agree to our{' '}
          <Link href="/legal/privacy" className="underline">Privacy Policy</Link>. Your details are used to prepare your quote and are never sold.
        </p>
      </div>
    </form>
  );
}
