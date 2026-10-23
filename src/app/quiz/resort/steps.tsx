'use client';

import type { Dispatch } from 'react';
import {
  CURRENCIES,
  MAX_ADULTS,
  MAX_CHILDREN,
  MAX_NIGHTS,
  MAX_NOTES,
  MAX_PRIORITIES,
  MAX_ROOMS,
  type Currency,
  type ResortQuizAction,
  type StepErrors,
  type TripAnswers,
} from '@vacationpro/engine';
import { DESTINATIONS, destinationName, destinationsByCountry } from '@/lib/resorts/meta';
import { Choice, ChoiceGroup, FieldError, StepHeading, Stepper, inputClass } from './ui';

export interface StepProps {
  answers: TripAnswers;
  dispatch: Dispatch<ResortQuizAction>;
  errors: StepErrors;
  headingId: string;
}

// ─── Start ───────────────────────────────────────────────────

export function StartStep({ answers, dispatch, errors, headingId, contextResortName }: StepProps & { contextResortName?: string | null }) {
  const knownDest = answers.destination && answers.destination !== 'open' ? destinationName(answers.destination) : null;
  return (
    <div>
      <StepHeading
        id={headingId}
        title="Find your kind of all-inclusive."
        hint="A few quick questions about your trip, then up to three resort picks with honest tradeoffs. Free, and no account needed."
      />
      {contextResortName && (
        <p className="mb-5 rounded-xl bg-brand-50 p-4 text-sm text-brand-900">
          You were looking at <strong>{contextResortName}</strong>. We will show how it compares for your trip.
        </p>
      )}
      <ChoiceGroup legend="How do you want to start?" errorId="err-entry" error={errors.entry}>
        <Choice
          type="radio"
          name="entry"
          value="discover"
          checked={answers.entry === 'discover'}
          onChange={() => dispatch({ type: 'CHOOSE_ENTRY', entry: 'discover' })}
          label="Help me choose where to go"
          description={`We will compare ${DESTINATIONS.reduce((n, d) => n + d.count, 0).toLocaleString('en-US')} all-inclusive resorts across Mexico and the Caribbean.`}
          icon="🧭"
        />
        <Choice
          type="radio"
          name="entry"
          value="known"
          checked={answers.entry === 'known'}
          onChange={() => dispatch({ type: 'CHOOSE_ENTRY', entry: 'known' })}
          label="I already know my destination"
          description={knownDest ? `We will focus on ${knownDest}.` : 'Pick it on the next screen.'}
          icon="📍"
        />
      </ChoiceGroup>
    </div>
  );
}

// ─── Destination ─────────────────────────────────────────────

const FEATURED_DESTINATIONS = DESTINATIONS.slice(0, 8);

export function DestinationStep({ answers, dispatch, errors, headingId }: StepProps) {
  const featured = FEATURED_DESTINATIONS.some((d) => d.slug === answers.destination);
  const other = answers.destination && answers.destination !== 'open' && !featured ? answers.destination : '';
  return (
    <div>
      <StepHeading id={headingId} title="Where are you headed?" />
      <ChoiceGroup legend="Popular destinations" errorId="err-destination" error={errors.destination} columns={2}>
        {FEATURED_DESTINATIONS.map((d) => (
          <Choice
            key={d.slug}
            type="radio"
            name="destination"
            value={d.slug}
            checked={answers.destination === d.slug}
            onChange={() => dispatch({ type: 'SET', patch: { destination: d.slug } })}
            label={d.name}
            description={`${d.count} resorts`}
          />
        ))}
      </ChoiceGroup>
      <label htmlFor="q-destination-other" className="mb-1.5 block text-sm font-bold text-gray-800">
        Somewhere else
      </label>
      <select
        id="q-destination-other"
        value={other}
        onChange={(e) => dispatch({ type: 'SET', patch: { destination: e.target.value || null } })}
        className={inputClass}
      >
        <option value="">Choose a destination</option>
        {destinationsByCountry().map((g) => (
          <optgroup key={g.country} label={g.country}>
            {g.destinations
              .filter((d) => !FEATURED_DESTINATIONS.includes(d))
              .map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name} ({d.count} {d.count === 1 ? 'resort' : 'resorts'})
                </option>
              ))}
          </optgroup>
        ))}
      </select>
      <div className="mt-5">
        <Choice
          type="radio"
          name="destination"
          value="open"
          checked={answers.destination === 'open'}
          onChange={() => dispatch({ type: 'SET', patch: { destination: 'open' } })}
          label="Open to suggestions"
          description="Compare resorts everywhere we cover."
        />
      </div>
    </div>
  );
}

// ─── Travelers ───────────────────────────────────────────────

const PARTIES: { value: TripAnswers['party'] & string; label: string; icon: string }[] = [
  { value: 'couple', label: 'Couple', icon: '❤️' },
  { value: 'friends', label: 'Friends', icon: '🥂' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧' },
  { value: 'solo', label: 'Solo', icon: '🧳' },
];

export function TravelersStep({ answers, dispatch, errors, headingId }: StepProps) {
  const solo = answers.party === 'solo';
  return (
    <div>
      <StepHeading id={headingId} title="Who is traveling?" />
      <ChoiceGroup legend="Trip type" errorId="err-party" error={errors.party} columns={2}>
        {PARTIES.map((p) => (
          <Choice
            key={p.value}
            type="radio"
            name="party"
            value={p.value}
            checked={answers.party === p.value}
            onChange={() => {
              const patch: Partial<TripAnswers> = { party: p.value };
              if (p.value !== 'solo' && answers.party === 'solo' && answers.adults < 2) patch.adults = 2;
              dispatch({ type: 'SET', patch });
            }}
            label={p.label}
            icon={p.icon}
          />
        ))}
      </ChoiceGroup>

      <div className="mb-6 grid gap-5 sm:grid-cols-3">
        <Stepper
          id="q-adults"
          label="Adults"
          value={answers.adults}
          min={1}
          max={MAX_ADULTS}
          disabled={solo}
          error={errors.adults}
          onChange={(n) => dispatch({ type: 'SET', patch: { adults: Math.max(1, Math.min(MAX_ADULTS, n)) } })}
        />
        <Stepper
          id="q-children"
          label="Children"
          value={answers.childAges.length}
          min={0}
          max={MAX_CHILDREN}
          disabled={solo}
          error={errors.children}
          onChange={(n) => dispatch({ type: 'SET_CHILD_COUNT', count: n })}
        />
        <Stepper
          id="q-rooms"
          label="Rooms"
          value={answers.rooms}
          min={1}
          max={MAX_ROOMS}
          disabled={solo}
          error={errors.rooms}
          onChange={(n) => dispatch({ type: 'SET', patch: { rooms: Math.max(1, Math.min(MAX_ROOMS, n)) } })}
        />
      </div>

      {answers.childAges.length > 0 && (
        <fieldset className="mb-6">
          <legend className="mb-1 text-sm font-bold uppercase tracking-wide text-gray-700">Children&apos;s ages at travel</legend>
          <p className="mb-3 text-sm text-gray-600">Age decides which resorts accept your family, so we ask for each child.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {answers.childAges.map((age, i) => (
              <div key={i}>
                <label htmlFor={`q-child-${i}`} className="mb-1 block text-sm font-semibold text-gray-800">
                  Child {i + 1}
                </label>
                <select
                  id={`q-child-${i}`}
                  value={age < 0 ? '' : String(age)}
                  aria-invalid={errors[`child-${i}`] ? true : undefined}
                  aria-describedby={errors[`child-${i}`] ? `q-child-${i}-error` : undefined}
                  onChange={(e) => dispatch({ type: 'SET_CHILD_AGE', index: i, age: e.target.value === '' ? -1 : Number(e.target.value) })}
                  className={inputClass}
                >
                  <option value="">Age</option>
                  {Array.from({ length: 18 }, (_, a) => (
                    <option key={a} value={a}>
                      {a === 0 ? 'Under 1' : a}
                    </option>
                  ))}
                </select>
                <FieldError id={`q-child-${i}-error`} message={errors[`child-${i}`]} />
              </div>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}

// ─── Dates ───────────────────────────────────────────────────

function upcomingMonths(count = 18): { value: string; label: string }[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1));
    return {
      value: d.toISOString().slice(0, 7),
      label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
    };
  });
}

export function DatesStep({ answers, dispatch, errors, headingId }: StepProps) {
  const d = answers.dates;
  const mode = d?.mode ?? null;
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div>
      <StepHeading id={headingId} title="When do you want to go?" />
      <ChoiceGroup legend="Your dates" errorId="err-dates" error={errors.dates} columns={2}>
        <Choice
          type="radio"
          name="date-mode"
          value="exact"
          checked={mode === 'exact'}
          onChange={() => dispatch({ type: 'SET', patch: { dates: { mode: 'exact', checkIn: '', checkOut: '' } } })}
          label="I have dates"
        />
        <Choice
          type="radio"
          name="date-mode"
          value="flexible"
          checked={mode === 'flexible'}
          onChange={() => dispatch({ type: 'SET', patch: { dates: { mode: 'flexible', month: null, nights: 5 } } })}
          label="I'm flexible"
        />
      </ChoiceGroup>

      {d?.mode === 'exact' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="q-checkin" className="mb-1.5 block text-sm font-bold text-gray-800">Check-in</label>
            <input
              id="q-checkin"
              type="date"
              min={today}
              value={d.checkIn}
              aria-invalid={errors.checkIn ? true : undefined}
              aria-describedby={errors.checkIn ? 'q-checkin-error' : undefined}
              onChange={(e) => dispatch({ type: 'SET', patch: { dates: { ...d, checkIn: e.target.value } } })}
              className={inputClass}
            />
            <FieldError id="q-checkin-error" message={errors.checkIn} />
          </div>
          <div>
            <label htmlFor="q-checkout" className="mb-1.5 block text-sm font-bold text-gray-800">Check-out</label>
            <input
              id="q-checkout"
              type="date"
              min={d.checkIn || today}
              value={d.checkOut}
              aria-invalid={errors.checkOut ? true : undefined}
              aria-describedby={errors.checkOut ? 'q-checkout-error' : undefined}
              onChange={(e) => dispatch({ type: 'SET', patch: { dates: { ...d, checkOut: e.target.value } } })}
              className={inputClass}
            />
            <FieldError id="q-checkout-error" message={errors.checkOut} />
          </div>
        </div>
      )}

      {d?.mode === 'flexible' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="q-month" className="mb-1.5 block text-sm font-bold text-gray-800">Travel month</label>
            <select
              id="q-month"
              value={d.month ?? ''}
              aria-invalid={errors.month ? true : undefined}
              onChange={(e) => dispatch({ type: 'SET', patch: { dates: { ...d, month: e.target.value || null } } })}
              className={inputClass}
            >
              <option value="">Not sure yet</option>
              {upcomingMonths().map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <FieldError id="q-month-error" message={errors.month} />
          </div>
          <Stepper
            id="q-nights"
            label="Nights"
            value={d.nights}
            min={1}
            max={MAX_NIGHTS}
            error={errors.nights}
            onChange={(n) => dispatch({ type: 'SET', patch: { dates: { ...d, nights: Math.max(1, Math.min(MAX_NIGHTS, n)) } } })}
          />
        </div>
      )}
    </div>
  );
}

// ─── Airport ─────────────────────────────────────────────────

export function AirportStep({ answers, dispatch, errors, headingId }: StepProps) {
  const value = answers.airport && answers.airport !== 'skip' ? answers.airport : '';
  return (
    <div>
      <StepHeading
        id={headingId}
        title="Where would you fly from?"
        hint="This helps Brendan plan your quote. We do not look up live flights or fares here."
      />
      <label htmlFor="q-airport" className="mb-1.5 block text-sm font-bold text-gray-800">City or airport code</label>
      <input
        id="q-airport"
        type="text"
        autoComplete="off"
        maxLength={60}
        placeholder="e.g. Boston or BOS"
        value={value}
        aria-invalid={errors.airport ? true : undefined}
        aria-describedby={errors.airport ? 'q-airport-error' : undefined}
        onChange={(e) => dispatch({ type: 'SET', patch: { airport: e.target.value || null } })}
        className={inputClass}
      />
      <FieldError id="q-airport-error" message={errors.airport} />
      <div className="mt-4">
        <Choice
          type="checkbox"
          name="airport-skip"
          value="skip"
          checked={answers.airport === 'skip'}
          onChange={() => dispatch({ type: 'SET', patch: { airport: answers.airport === 'skip' ? null : 'skip' } })}
          label="Skip, I haven't decided"
        />
      </div>
    </div>
  );
}

// ─── Budget ──────────────────────────────────────────────────

export function BudgetStep({ answers, dispatch, errors, headingId }: StepProps) {
  const b = answers.budget;
  const unsure = b !== null && b.amount === null;
  const setBudget = (patch: Partial<NonNullable<TripAnswers['budget']>>) =>
    dispatch({ type: 'SET', patch: { budget: { amount: null, currency: 'USD', includesFlights: null, ...(b ?? {}), ...patch } } });

  return (
    <div>
      <StepHeading
        id={headingId}
        title="What is your total trip budget?"
        hint="For everyone, for the whole trip. We use it to estimate fit. We do not have live rates."
      />
      <div className="mb-5 grid grid-cols-[1fr_auto] gap-3">
        <div>
          <label htmlFor="q-amount" className="mb-1.5 block text-sm font-bold text-gray-800">Total budget</label>
          <input
            id="q-amount"
            type="number"
            inputMode="numeric"
            min={0}
            step={100}
            placeholder="e.g. 5000"
            disabled={unsure}
            value={b?.amount ?? ''}
            aria-invalid={errors.amount ? true : undefined}
            aria-describedby={errors.amount ? 'q-amount-error' : undefined}
            onChange={(e) => {
              const n = e.target.value === '' ? null : Number(e.target.value);
              setBudget({ amount: n === null || Number.isNaN(n) ? null : n });
            }}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="q-currency" className="mb-1.5 block text-sm font-bold text-gray-800">Currency</label>
          <select
            id="q-currency"
            value={b?.currency ?? 'USD'}
            disabled={unsure}
            onChange={(e) => setBudget({ currency: e.target.value as Currency })}
            className={inputClass}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <FieldError id="q-amount-error" message={errors.amount} />
      {b?.currency && b.currency !== 'USD' && !unsure && (
        <p className="mb-4 text-sm text-gray-600">We can only estimate budget fit in USD for now. Brendan can still quote in your currency.</p>
      )}

      {!unsure && (
        <ChoiceGroup legend="Does this budget include flights?" errorId="err-flights" error={errors.includesFlights} columns={2}>
          <Choice type="radio" name="flights" value="yes" checked={b?.includesFlights === true} onChange={() => setBudget({ includesFlights: true })} label="Yes, flights included" />
          <Choice type="radio" name="flights" value="no" checked={b?.includesFlights === false} onChange={() => setBudget({ includesFlights: false })} label="No, resort only" />
          <Choice type="radio" name="flights" value="unsure" checked={b?.includesFlights === 'unsure'} onChange={() => setBudget({ includesFlights: 'unsure' })} label="Not sure" description="We will assume flights come out of it." />
        </ChoiceGroup>
      )}

      <Choice
        type="checkbox"
        name="budget-unsure"
        value="unsure"
        checked={unsure}
        onChange={() =>
          dispatch({ type: 'SET', patch: { budget: unsure ? null : { amount: null, currency: b?.currency ?? 'USD', includesFlights: null } } })
        }
        label="Not sure yet"
        description="We will skip the budget check and show price context instead."
      />
      <FieldError id="err-budget" message={errors.budget} />
    </div>
  );
}

// ─── Adults-only ─────────────────────────────────────────────

export function AdultsOnlyStep({ answers, dispatch, errors, headingId }: StepProps) {
  const opts: { value: NonNullable<TripAnswers['adultsOnly']>; label: string; description: string }[] = [
    { value: 'yes', label: 'Adults-only, please', description: 'Only resorts with a confirmed adults-only policy.' },
    { value: 'either', label: 'No preference', description: 'Adults-only and all-ages resorts both work.' },
    { value: 'no', label: 'I prefer all-ages resorts', description: 'We will favor resorts that welcome everyone.' },
  ];
  return (
    <div>
      <StepHeading id={headingId} title="Adults-only?" />
      <ChoiceGroup legend="Resort type" errorId="err-adultsOnly" error={errors.adultsOnly}>
        {opts.map((o) => (
          <Choice
            key={o.value}
            type="radio"
            name="adults-only"
            value={o.value}
            checked={answers.adultsOnly === o.value}
            onChange={() => dispatch({ type: 'SET', patch: { adultsOnly: o.value } })}
            label={o.label}
            description={o.description}
          />
        ))}
      </ChoiceGroup>
    </div>
  );
}

// ─── Vibe ────────────────────────────────────────────────────

export function VibeStep({ answers, dispatch, errors, headingId }: StepProps) {
  const opts: { value: NonNullable<TripAnswers['atmosphere']>; label: string; description: string; icon: string }[] = [
    { value: 'quiet', label: 'Quiet and romantic', description: 'Calm pools, slow dinners, early nights.', icon: '🌙' },
    { value: 'balanced', label: 'Lively but relaxed', description: 'Some buzz by day, easy evenings.', icon: '🌴' },
    { value: 'social', label: 'Energetic and social', description: 'Busy pools, shows and late nights.', icon: '🎶' },
    { value: 'unsure', label: 'Not sure', description: 'We will leave atmosphere out of the ranking.', icon: '🤷' },
  ];
  return (
    <div>
      <StepHeading id={headingId} title="What vibe do you want?" />
      <ChoiceGroup legend="Atmosphere" errorId="err-atmosphere" error={errors.atmosphere}>
        {opts.map((o) => (
          <Choice
            key={o.value}
            type="radio"
            name="atmosphere"
            value={o.value}
            checked={answers.atmosphere === o.value}
            onChange={() => dispatch({ type: 'SET', patch: { atmosphere: o.value } })}
            label={o.label}
            description={o.description}
            icon={o.icon}
          />
        ))}
      </ChoiceGroup>
    </div>
  );
}

// ─── Priorities ──────────────────────────────────────────────

const PRIORITY_OPTIONS: { value: TripAnswers['priorities'][number]; label: string; icon: string }[] = [
  { value: 'beach', label: 'Great beach', icon: '🏝️' },
  { value: 'food', label: 'Great food', icon: '🍽️' },
  { value: 'pools', label: 'Pools', icon: '🏊' },
  { value: 'rooms', label: 'Rooms', icon: '🛏️' },
  { value: 'nightlife', label: 'Nightlife and shows', icon: '🎭' },
  { value: 'value', label: 'Value for money', icon: '💰' },
  { value: 'family', label: 'Family fun', icon: '🧒' },
];

export function PrioritiesStep({ answers, dispatch, errors, headingId }: StepProps) {
  const full = answers.priorities.length >= MAX_PRIORITIES;
  return (
    <div>
      <StepHeading id={headingId} title="What matters most?" hint={`Pick your top ${MAX_PRIORITIES}. The first one you pick counts most.`} />
      <p className="mb-3 text-sm font-semibold text-gray-700" aria-live="polite">
        {answers.priorities.length} of {MAX_PRIORITIES} selected
      </p>
      <ChoiceGroup legend="Top priorities" errorId="err-priorities" error={errors.priorities} columns={2}>
        {PRIORITY_OPTIONS.map((o) => {
          const checked = answers.priorities.includes(o.value);
          return (
            <Choice
              key={o.value}
              type="checkbox"
              name="priorities"
              value={o.value}
              checked={checked}
              disabled={!checked && full}
              onChange={() => dispatch({ type: 'TOGGLE_PRIORITY', priority: o.value })}
              label={o.label}
              icon={o.icon}
            />
          );
        })}
      </ChoiceGroup>
    </div>
  );
}

// ─── Dealbreakers ────────────────────────────────────────────

export function DealbreakersStep({ answers, dispatch, errors, headingId }: StepProps) {
  const opts: { value: TripAnswers['dealbreakers'][number]; label: string; description: string; hideForKids?: boolean }[] = [
    { value: 'long-transfer', label: 'Long airport transfer', description: 'Over 45 minutes each way.' },
    { value: 'mega-resort', label: 'Huge resort', description: 'Over 600 rooms.' },
    { value: 'party-scene', label: 'Party scene', description: 'Resorts known for an energetic, social crowd.' },
    { value: 'rough-beach', label: 'Beach not good for swimming' , description: 'Only where we have confirmed it.' },
    { value: 'lots-of-kids', label: 'Lots of kids', description: 'Rules out resorts that welcome children.', hideForKids: true },
  ];
  const hasKids = answers.childAges.length > 0;
  return (
    <div>
      <StepHeading
        id={headingId}
        title="Any dealbreakers?"
        hint="Optional. We only rule a resort out when we know the fact. Anything we have not confirmed is flagged for you to check."
      />
      <ChoiceGroup legend="Rule out">
        {opts
          .filter((o) => !(o.hideForKids && hasKids))
          .map((o) => (
            <Choice
              key={o.value}
              type="checkbox"
              name="dealbreakers"
              value={o.value}
              checked={answers.dealbreakers.includes(o.value)}
              onChange={() => dispatch({ type: 'TOGGLE_DEALBREAKER', dealbreaker: o.value })}
              label={o.label}
              description={o.description}
            />
          ))}
      </ChoiceGroup>
      <label htmlFor="q-notes" className="mb-1.5 block text-sm font-bold text-gray-800">Anything else? (optional)</label>
      <textarea
        id="q-notes"
        rows={3}
        maxLength={MAX_NOTES}
        value={answers.notes}
        placeholder="Celebrating something, a room type you want, a resort you are already considering..."
        aria-describedby="q-notes-hint"
        onChange={(e) => dispatch({ type: 'SET', patch: { notes: e.target.value } })}
        className={`${inputClass} h-auto py-3`}
      />
      <p id="q-notes-hint" className="mt-1 text-xs text-gray-500">
        {answers.notes.length}/{MAX_NOTES}. These go to Brendan if you request a quote. Please do not include payment or passport details.
      </p>
      <FieldError id="q-notes-error" message={errors.notes} />
    </div>
  );
}
