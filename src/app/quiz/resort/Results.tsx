'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type Dispatch, type FormEvent } from 'react';
import {
  type Recommendation,
  type ResortQuizAction,
  type ResortQuizState,
  type StepId,
  type TripAnswers,
} from '@vacationpro/engine';
import BookingActions from '@/components/booking/BookingActions';
import ResortVisual from '@/components/booking/ResortVisual';
import { trackFunnel } from '@/lib/analytics/journey';
import { ageLabel, destinationName, priceRangeLabel, transferLabel } from '@/lib/resorts/meta';
import type { RecommendationPayload } from '@/lib/resorts/recommend';
import { hasExactBookingLink, quoteHref, resortBookHref } from '@/lib/resorts/links';
import { getSessionId, postSession } from '../lib/session';
import { inputClass, primaryButton, secondaryButton } from './ui';

const ROLE_LABELS: Record<Recommendation['role'], string> = {
  'best-overall': 'Best overall fit',
  'best-value': 'Best value',
  'worth-the-upgrade': 'Worth the upgrade',
  'also-strong': 'Also a strong fit',
};

const MAX_COMPARE = 3;

function datesSummary(a: TripAnswers): string {
  const d = a.dates;
  if (!d) return 'Not set';
  if (d.mode === 'exact') return `${d.checkIn} to ${d.checkOut}`;
  const month = d.month
    ? new Date(`${d.month}-01T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    : 'Month flexible';
  return `${month}, ${d.nights} nights`;
}

function travelersSummary(a: TripAnswers): string {
  const kids = a.childAges.length;
  const parts = [`${a.adults} adult${a.adults === 1 ? '' : 's'}`];
  if (kids) parts.push(`${kids} child${kids === 1 ? '' : 'ren'} (${a.childAges.join(', ')})`);
  parts.push(`${a.rooms} room${a.rooms === 1 ? '' : 's'}`);
  return parts.join(', ');
}

function budgetSummary(a: TripAnswers): string {
  const b = a.budget;
  if (!b || b.amount === null) return 'Not sure yet';
  const flights = b.includesFlights === true ? 'with flights' : b.includesFlights === false ? 'resort only' : 'flights unsure';
  return `${b.amount.toLocaleString('en-US')} ${b.currency}, ${flights}`;
}

const VIBE_LABEL: Record<string, string> = {
  quiet: 'Quiet and romantic',
  balanced: 'Lively but relaxed',
  social: 'Energetic and social',
  unsure: 'Not sure',
};

export default function Results({
  state,
  dispatch,
  headingId,
}: {
  state: ResortQuizState;
  dispatch: Dispatch<ResortQuizAction>;
  headingId: string;
}) {
  const answers = state.answers;
  const answersKey = JSON.stringify(answers);
  const [result, setResult] = useState<RecommendationPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const viewedKey = useRef<string>('');

  // Matching runs on the server: the catalog is too large to ship to phones.
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoadError(null);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: answersKey.length ? JSON.stringify({ answers: JSON.parse(answersKey) }) : '{}',
        signal: signal ?? AbortSignal.timeout(20000),
      });
      const data = (await res.json().catch(() => null)) as (RecommendationPayload & { error?: string }) | null;
      if (!res.ok || !data || !Array.isArray(data.recommendations)) throw new Error(data?.error || 'We could not load your matches.');
      setResult(data);
    } catch (err) {
      if (signal?.aborted) return;
      setLoadError(err instanceof Error && err.message ? err.message : 'We could not load your matches.');
    }
  }, [answersKey]);

  useEffect(() => {
    const ctrl = new AbortController();
    void load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  const recIds = result ? result.recommendations.map((r) => r.resort.id) : [];

  // Persist the session (no personal data) and record the view once per distinct result set.
  useEffect(() => {
    if (!result) return;
    const key = recIds.join(',');
    if (viewedKey.current === key) return;
    viewedKey.current = key;
    setCompare(recIds.slice(0, MAX_COMPARE));
    trackFunnel('recommendations_viewed', { count: recIds.length, ids: key || null });
    void postSession({
      sessionId: getSessionId(),
      answers,
      topMatches: [...recIds, ...result.others.map((o) => o.id)].slice(0, 10).map((slug, i) => ({ slug, pct: i + 1 })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  function toggleCompare(id: string) {
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= MAX_COMPARE ? c : [...c, id]));
  }

  const edit = (step: StepId) => dispatch({ type: 'EDIT', step });
  const generalQuote = quoteHref({ destination: answers.destination, from: 'results' });

  const summary: { label: string; value: string; step: StepId }[] = [
    ...(answers.entry === 'known' ? [{ label: 'Destination', value: destinationName(answers.destination), step: 'destination' as StepId }] : []),
    { label: 'Travelers', value: travelersSummary(answers), step: 'travelers' },
    { label: 'Dates', value: datesSummary(answers), step: 'dates' },
    { label: 'Budget', value: budgetSummary(answers), step: 'budget' },
    ...(answers.childAges.length === 0
      ? [{ label: 'Adults-only', value: answers.adultsOnly === 'yes' ? 'Yes' : answers.adultsOnly === 'no' ? 'Prefer all-ages' : 'No preference', step: 'adults-only' as StepId }]
      : []),
    { label: 'Vibe', value: VIBE_LABEL[answers.atmosphere ?? 'unsure'], step: 'vibe' },
    { label: 'Priorities', value: answers.priorities.join(', ') || 'None', step: 'priorities' },
    { label: 'Dealbreakers', value: answers.dealbreakers.join(', ').replace(/-/g, ' ') || 'None', step: 'dealbreakers' },
  ];

  if (!result) {
    return (
      <div>
        <h1 id={headingId} tabIndex={-1} className="text-2xl font-extrabold text-gray-900 outline-none sm:text-3xl">
          {loadError ? 'We hit a snag' : 'Finding your resorts…'}
        </h1>
        {loadError ? (
          <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-900 ring-1 ring-red-200">
            <p>{loadError} Your answers are saved on this device.</p>
            <button type="button" onClick={() => void load()} className={`${primaryButton} mt-3`}>
              Try again
            </button>
          </div>
        ) : (
          <div aria-busy="true" className="mt-6 space-y-4">
            <p role="status" className="text-gray-600">Comparing resorts against your answers.</p>
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        )}
      </div>
    );
  }

  const others = result.others;

  return (
    <div>
      <h1 id={headingId} tabIndex={-1} className="text-2xl font-extrabold text-gray-900 outline-none sm:text-3xl">
        {result.recommendations.length > 0 ? 'Your resort matches' : 'No matches yet'}
      </h1>
      <p className="mt-2 text-gray-600">
        Ranked on what you told us across {result.eligibleCount.toLocaleString('en-US')} resorts that fit your requirements. We never rank by commission, and
        price ranges are estimates, not live rates.
      </p>

      <details className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
        <summary className="cursor-pointer font-bold text-gray-900">Your answers (tap to edit)</summary>
        <dl className="mt-3 divide-y divide-gray-100">
          {summary.map((s) => (
            <div key={s.label} className="flex items-center justify-between gap-3 py-2.5">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-gray-500">{s.label}</dt>
                <dd className="text-sm text-gray-900">{s.value}</dd>
              </div>
              <button
                type="button"
                onClick={() => edit(s.step)}
                className="min-h-11 rounded-lg px-3 text-sm font-bold text-brand-800 underline hover:no-underline focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-300"
                aria-label={`Edit ${s.label.toLowerCase()}`}
              >
                Edit
              </button>
            </div>
          ))}
        </dl>
      </details>

      {result.limitations.length > 0 && (
        <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-950 ring-1 ring-amber-200" role="status">
          <ul className="list-disc space-y-1 pl-5">
            {result.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <p className="mt-3">
            Adjust your answers above, or{' '}
            <Link href={generalQuote} className="font-bold underline">
              ask Brendan to find options
            </Link>
            .
          </p>
        </div>
      )}

      {result.context && (
        <div className="mt-5 rounded-xl bg-brand-50 p-4 text-sm text-brand-950">
          <strong>{result.context.name}</strong>
          {result.context.note}
        </div>
      )}

      <div className="mt-6 space-y-6">
        {result.recommendations.map((rec) => (
          <RecommendationCard
            key={rec.resort.id}
            rec={rec}
            answers={answers}
            alternates={[...recIds, ...others.map((o) => o.id)].filter((id) => id !== rec.resort.id).slice(0, 2)}
            comparing={compare.includes(rec.resort.id)}
            compareFull={compare.length >= MAX_COMPARE}
            onToggleCompare={() => toggleCompare(rec.resort.id)}
          />
        ))}
      </div>

      {others.length > 0 && (
        <section className="mt-8" aria-labelledby="more-options">
          <h2 id="more-options" className="text-lg font-extrabold text-gray-900">
            Other eligible resorts
          </h2>
          <p className="mb-3 text-sm text-gray-600">These also meet your requirements. Add any to your comparison.</p>
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {others.map((r) => {
              const checked = compare.includes(r.id);
              return (
                <li key={r.id} className="flex items-center justify-between gap-3 p-3">
                  <div>
                    <Link href={`/resorts/${r.id}`} className="font-bold text-gray-900 underline-offset-2 hover:underline">
                      {r.name}
                    </Link>
                    <p className="text-xs text-gray-600">
                      {r.destinationName} · {r.age}
                    </p>
                  </div>
                  <CompareToggle id={r.id} name={r.name} checked={checked} disabled={!checked && compare.length >= MAX_COMPARE} onChange={() => toggleCompare(r.id)} />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {result.recommendations.length > 0 && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-700" aria-live="polite">
            {compare.length} of {MAX_COMPARE} resorts selected to compare
          </p>
          {compare.length >= 2 ? (
            <Link
              href={`/compare?ids=${compare.join(',')}`}
              className={primaryButton}
            >
              Compare side by side
            </Link>
          ) : (
            <span className="text-sm text-gray-500">Select at least 2 to compare</span>
          )}
        </div>
      )}

      <EmailResults answers={answers} />

      <section className="mt-8 rounded-2xl bg-forest p-6 text-white">
        <h2 className="text-xl font-extrabold">Want a second opinion before you book?</h2>
        <p className="mt-2 text-white/85">
          I&apos;m Brendan, VacationPro&apos;s founder. I&apos;ll personally check rates, room options, and available offers for your trip.
          Requesting a quote does not reserve a room or complete a booking.
        </p>
        <Link href={generalQuote} className="mt-4 inline-flex min-h-12 items-center rounded-xl bg-white px-6 font-bold text-forest hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-300">
          Get a Quote from Brendan
        </Link>
      </section>

      <div className="mt-8 text-center">
        <button type="button" className={secondaryButton} onClick={() => dispatch({ type: 'RESET' })}>
          Start over
        </button>
      </div>
    </div>
  );
}

function CompareToggle({ id, name, checked, disabled, onChange }: { id: string; name: string; checked: boolean; disabled: boolean; onChange: () => void }) {
  return (
    <label className={`inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold ${disabled ? 'text-gray-400' : 'text-gray-800'}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-label={`Compare ${name}`}
        className="h-5 w-5 rounded border-gray-300 accent-brand-700"
        data-compare-id={id}
      />
      Compare
    </label>
  );
}

function RecommendationCard({
  rec,
  answers,
  alternates,
  comparing,
  compareFull,
  onToggleCompare,
}: {
  rec: Recommendation;
  answers: TripAnswers;
  alternates: string[];
  comparing: boolean;
  compareFull: boolean;
  onToggleCompare: () => void;
}) {
  const r = rec.resort;
  const transfer = transferLabel(r);
  const qs = new URLSearchParams({ resort: r.id, from: `results-${rec.role}` });
  if (alternates.length) qs.set('alts', alternates.join(','));
  const quote = `/concierge-planning?${qs.toString()}#quote`;

  return (
    <article className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white" aria-labelledby={`rec-${r.id}`}>
      <div className="relative">
        <ResortVisual resort={r} className="h-32 sm:h-40" />
        <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-brand-900 shadow">
          {ROLE_LABELS[rec.role]}
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <h2 id={`rec-${r.id}`} className="text-xl font-extrabold text-gray-900">
          {r.name}
        </h2>
        <p className="text-sm font-semibold text-gray-600">
          {r.area && r.area !== destinationName(r.destination) ? `${r.area}, ` : ''}{destinationName(r.destination)} · {ageLabel(r)}
          {transfer ? ` · ${transfer}` : ''}
        </p>

        <h3 className="mt-4 text-sm font-bold uppercase tracking-wide text-gray-700">Why it fits you</h3>
        <ul className="mt-2 space-y-1.5">
          {rec.whyItFits.map((w) => (
            <li key={w} className="flex gap-2 text-gray-800">
              <span aria-hidden="true" className="font-bold text-brand-700">✓</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-3">
            <dt className="font-bold text-gray-900">Main tradeoff</dt>
            <dd className="mt-1 text-gray-700">{rec.tradeoff}</dd>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <dt className="font-bold text-gray-900">Skip it if</dt>
            <dd className="mt-1 text-gray-700">{rec.skipIf}</dd>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <dt className="font-bold text-gray-900">Room tip</dt>
            <dd className="mt-1 text-gray-700">{rec.roomGuidance}</dd>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <dt className="font-bold text-gray-900">Price context</dt>
            <dd className="mt-1 text-gray-700">
              {rec.budget.fit === 'unknown' ? priceRangeLabel(r) : <>{rec.budget.explanation} Check current rates.</>}
            </dd>
          </div>
        </dl>

        {r.features.length > 0 && (
          <p className="mt-3 text-sm text-gray-700">
            <strong>Notable:</strong> {r.features.slice(0, 5).join(', ')}.
          </p>
        )}

        {rec.unknowns.length > 0 && (
          <p className="mt-3 text-sm text-gray-600">
            <strong>Confirm before booking:</strong> {rec.unknowns.join(', ').toLowerCase()} (not verified yet).
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Link href={`/resorts/${r.id}`} className="min-h-11 py-2 text-sm font-bold text-brand-800 underline hover:no-underline">
            Full resort details and sources
          </Link>
          <CompareToggle id={r.id} name={r.name} checked={comparing} disabled={!comparing && compareFull} onChange={onToggleCompare} />
        </div>

        <div className="mt-4">
          <BookingActions
            bookHref={resortBookHref(r, `results-${rec.role}`, answers)}
            exact={hasExactBookingLink(r)}
            resortName={r.name}
            quoteHref={quote}
            placement={`results-${rec.role}`}
            resortId={r.id}
          />
        </div>
      </div>
    </article>
  );
}

function EmailResults({ answers }: { answers: TripAnswers }) {
  const [email, setEmail] = useState('');
  const [marketing, setMarketing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setStatus('error');
      setMessage('Enter a valid email address.');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/quiz-results/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: getSessionId(), email: email.trim(), marketingConsent: marketing, answers }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || 'We could not send that email.');
      setStatus('sent');
      trackFunnel('results_emailed', { marketing_consent: marketing });
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'We could not send that email. Try again.');
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6" aria-labelledby="email-results">
      <h2 id="email-results" className="text-lg font-extrabold text-gray-900">
        Email me these results
      </h2>
      <p className="mt-1 text-sm text-gray-600">Optional. Your results stay on this device either way.</p>
      {status === 'sent' ? (
        <p role="status" className="mt-4 rounded-xl bg-brand-50 p-4 text-sm font-semibold text-brand-900">
          Sent. Check your inbox for your resort matches.
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="mt-4 space-y-3">
          <label htmlFor="results-email" className="block text-sm font-bold text-gray-800">
            Email
          </label>
          <input
            id="results-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            aria-invalid={status === 'error' ? true : undefined}
            aria-describedby={status === 'error' ? 'results-email-error' : undefined}
          />
          <label className="flex items-start gap-3 text-sm text-gray-700">
            <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 h-5 w-5 accent-brand-700" />
            <span>Also send me the VacationPro newsletter with deals and travel tips. Unsubscribe any time.</span>
          </label>
          {status === 'error' && (
            <p id="results-email-error" role="alert" className="text-sm font-semibold text-red-700">
              {message}
            </p>
          )}
          <button type="submit" disabled={status === 'sending'} className={primaryButton}>
            {status === 'sending' ? 'Sending...' : 'Send my results'}
          </button>
        </form>
      )}
    </section>
  );
}
