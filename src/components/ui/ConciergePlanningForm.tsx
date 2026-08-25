'use client';

import { useState } from 'react';
import { trackLead } from '@/lib/meta-pixel';
import { CONCIERGE_FEE, CONCIERGE_FEE_ENABLED } from '@/lib/concierge';

// ─── Dropdown / Checkbox Options ─────────────────────────────

const DESTINATION_OPTIONS = [
  'Aruba',
  'Punta Cana / Dominican Republic',
  'Cancun / Riviera Maya',
  'Jamaica',
  'Bahamas',
  'St. Lucia',
  'Turks & Caicos',
  'Hawaii',
  'Caribbean (I\'m flexible)',
  'Other / Surprise me',
];

const TRIP_TYPE_OPTIONS = [
  'Couples getaway',
  'Family vacation',
  'Honeymoon',
  'Anniversary',
  'Group trip',
  'Solo',
  'Bachelor/Bachelorette',
  'Babymoon',
  'Other',
];

const BUDGET_OPTIONS = [
  'Under $1,000',
  '$1,000 to $2,000',
  '$2,000 to $3,500',
  '$3,500 to $5,000',
  '$5,000+',
  'Open / Recommend best value',
];

const PRIORITY_OPTIONS = [
  'Beach',
  'Adults-only',
  'Kid-friendly',
  'All-inclusive',
  'Adventure',
  'Relaxation',
  'Foodie scene',
  'Nightlife',
  'Spa',
  'Cultural / Local feel',
  'Privacy / Hidden gem',
  'Luxury',
];

const SOURCE_OPTIONS = [
  'TikTok',
  'Instagram',
  'Facebook',
  'Beacons / Deal PDF',
  'Referral',
  'Google',
  'Other',
];

const MAX_PRIORITIES = 3;

// ─── Types ───────────────────────────────────────────────────

interface FormData {
  // Section 1: Trip basics
  travelDates: string;
  adults: number;
  children: number;
  destination: string;
  departureAirport: string;
  tripType: string;
  budgetPerPerson: string;
  // Section 2: What matters most
  priorities: string[];
  specialRequests: string;
  // Section 3: Contact
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

// DOM ids of the inputs, in form order, so validation can scroll to the first problem.
const FIELD_IDS: Partial<Record<keyof FormData, string>> = {
  travelDates: 'cp-travelDates',
  adults: 'cp-adults',
  destination: 'cp-destination',
  tripType: 'cp-tripType',
  budgetPerPerson: 'cp-budget',
  priorities: 'cp-priorities',
  firstName: 'cp-firstName',
  lastName: 'cp-lastName',
  email: 'cp-email',
  phone: 'cp-phone',
};

export function firstErrorFieldId(errs: FormErrors): string | null {
  for (const key of Object.keys(FIELD_IDS) as (keyof FormData)[]) {
    if (errs[key]) return FIELD_IDS[key] ?? null;
  }
  return null;
}

const initialFormData: FormData = {
  travelDates: '',
  adults: 2,
  children: 0,
  destination: '',
  departureAirport: '',
  tripType: '',
  budgetPerPerson: '',
  priorities: [],
  specialRequests: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  source: '',
};

// ─── Styling Constants ───────────────────────────────────────

const inputClasses =
  'w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed';
const labelClasses = 'block text-sm font-medium text-gray-700 mb-1';
const errorClasses = 'text-xs text-red-600 mt-1';

// ─── Component ───────────────────────────────────────────────

interface ConciergePlanningFormProps {
  defaultDestination?: string;
  sourceLabel?: string;
}

export default function ConciergePlanningForm({ defaultDestination, sourceLabel }: ConciergePlanningFormProps = {}) {
  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
    destination: defaultDestination ?? initialFormData.destination,
    source: sourceLabel ?? initialFormData.source,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState('');
  const [intakeResult, setIntakeResult] = useState<{
    contactId?: string;
    opportunityId?: string;
  }>({});
  const hasUnlistedDefault = Boolean(
    defaultDestination && !DESTINATION_OPTIONS.includes(defaultDestination),
  );
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // ─── Handlers ────────────────────────────────────────────

  function handleChange(field: keyof FormData, value: string | number) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handlePriorityToggle(priority: string) {
    setFormData((prev) => {
      const current = prev.priorities;
      if (current.includes(priority)) {
        return { ...prev, priorities: current.filter((p) => p !== priority) };
      }
      if (current.length >= MAX_PRIORITIES) {
        return prev; // silently block; UI shows the limit
      }
      return { ...prev, priorities: [...current, priority] };
    });
    // Clear priority error on any change
    if (errors.priorities) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.priorities;
        return next;
      });
    }
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};

    if (!formData.travelDates.trim()) errs.travelDates = 'Required';
    if (!formData.adults || formData.adults < 1) errs.adults = 'At least 1 adult required';
    if (!formData.destination) errs.destination = 'Required';
    if (!formData.tripType) errs.tripType = 'Required';
    if (!formData.budgetPerPerson) errs.budgetPerPerson = 'Required';

    if (formData.priorities.length === 0) errs.priorities = 'Select at least 1 priority';

    if (!formData.firstName.trim()) errs.firstName = 'Required';
    if (!formData.lastName.trim()) errs.lastName = 'Required';

    if (!formData.email.trim()) {
      errs.email = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Invalid email';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Required';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Must be at least 10 digits';
    }

    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate();
    const errorCount = Object.keys(validationErrors).length;
    if (errorCount > 0) {
      setErrors(validationErrors);
      setServerError(
        errorCount === 1
          ? 'One field above needs attention before you can continue.'
          : `${errorCount} fields above need attention before you can continue.`
      );
      const targetId = firstErrorFieldId(validationErrors);
      const target = targetId ? document.getElementById(targetId) : null;
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (target instanceof HTMLElement && typeof target.focus === 'function') {
          target.focus({ preventScroll: true });
        }
      }
      return;
    }

    setStatus('submitting');
    setServerError('');

    const sourcePageUrl = typeof window !== 'undefined' ? window.location.href : '';
    const referrerUrl = typeof document !== 'undefined' ? document.referrer : '';
    const params =
      typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const utmSource = params?.get('utm_source') || '';
    const utmMedium = params?.get('utm_medium') || '';
    const utmCampaign = params?.get('utm_campaign') || '';

    try {
      const res = await fetch('/api/ghl/concierge-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          priorities: formData.priorities.join(', '),
          departureAirport: formData.departureAirport.trim(),
          sourcePageUrl,
          referrerUrl,
          utmSource,
          utmMedium,
          utmCampaign,
        }),
      });

      const intakeData = (await res.json()) as {
        contactId?: string;
        opportunityId?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(intakeData.error || 'Something went wrong');
      }
      setIntakeResult(intakeData);
      setStatus('success');
      trackLead({
        content_name: 'Concierge Planning',
        content_category: formData.destination,
        value: CONCIERGE_FEE ?? 0,
        currency: 'USD',
      });
    } catch (err) {
      setStatus('error');
      setServerError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    }
  }

  // ─── Success State ───────────────────────────────────────

  if (status === 'success') {
    async function startCheckout() {
      setCheckoutError('');
      setCheckoutLoading(true);
      try {
        const res = await fetch('/api/stripe/concierge-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactId: intakeResult.contactId,
            opportunityId: intakeResult.opportunityId,
            email: formData.email.trim().toLowerCase(),
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            destination: formData.destination,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.url) {
          throw new Error(data.error || 'Could not start checkout');
        }
        window.location.href = data.url;
      } catch (err) {
        setCheckoutError(
          err instanceof Error ? err.message : 'Could not start checkout. Try again.'
        );
        setCheckoutLoading(false);
      }
    }

    if (!CONCIERGE_FEE_ENABLED) {
      return (
        <div className="py-4">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">You&apos;re in. I&apos;ll take it from here.</h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
              I will reach out within 24 hours to confirm the details and schedule a quick discovery
              call (30 minutes by Zoom or phone). Then I build your proposal: resort, flights, and a
              full itinerary. No planning fee while I open up spots.
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Check your inbox for a confirmation from VacationPro.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="py-4">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Almost there. Lock it in with $99.</h3>
          <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
            Pay your $99 concierge fee below. This covers the research, resort and flight comparisons,
            and your travel advisor&apos;s time building your itinerary.
          </p>
        </div>

        <button
          type="button"
          onClick={startCheckout}
          disabled={checkoutLoading}
          className="block w-full text-center px-6 py-4 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors text-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {checkoutLoading ? 'Redirecting to checkout...' : 'Pay $99 Now'}
        </button>

        {checkoutError && (
          <p className="text-xs text-red-600 text-center mt-2">{checkoutError}</p>
        )}

        <p className="text-xs text-gray-400 text-center mt-3">
          Secure checkout powered by Stripe.
        </p>

        <p className="text-sm text-gray-500 text-center mt-4 leading-relaxed">
          After payment I will reach out within 24 hours to schedule your discovery call (30 min by
          Zoom or phone).
        </p>
      </div>
    );
  }

  // ─── Form ────────────────────────────────────────────────

  const isSubmitting = status === 'submitting';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Section 1: Trip Basics */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Your trip</h3>
        <p className="text-sm text-gray-500 mb-4">Tell me the basics and I will handle the rest.</p>
      </div>

      {/* Travel Dates */}
      <div>
        <label htmlFor="cp-travelDates" className={labelClasses}>Travel dates</label>
        <input
          type="text"
          id="cp-travelDates"
          className={inputClasses}
          placeholder="Aug 15 to 22, or 'flexible'"
          value={formData.travelDates}
          onChange={(e) => handleChange('travelDates', e.target.value)}
          disabled={isSubmitting}
        />
        {errors.travelDates && <p className={errorClasses}>{errors.travelDates}</p>}
      </div>

      {/* Home Airport */}
      <div>
        <label htmlFor="cp-departureAirport" className={labelClasses}>Home airport</label>
        <input
          type="text"
          id="cp-departureAirport"
          className={inputClasses}
          placeholder="e.g. Boston (BOS)"
          value={formData.departureAirport}
          onChange={(e) => handleChange('departureAirport', e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      {/* Adults + Children */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="cp-adults" className={labelClasses}>Adults</label>
          <input
            type="number"
            id="cp-adults"
            className={inputClasses}
            min={1}
            value={formData.adults}
            onChange={(e) => handleChange('adults', parseInt(e.target.value, 10) || 1)}
            disabled={isSubmitting}
          />
          {errors.adults && <p className={errorClasses}>{errors.adults}</p>}
        </div>
        <div>
          <label htmlFor="cp-children" className={labelClasses}>Children (optional)</label>
          <input
            type="number"
            id="cp-children"
            className={inputClasses}
            min={0}
            value={formData.children}
            onChange={(e) => handleChange('children', parseInt(e.target.value, 10) || 0)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Destination */}
      <div>
        <label htmlFor="cp-destination" className={labelClasses}>Destination</label>
        <select
          id="cp-destination"
          className={inputClasses}
          value={formData.destination}
          onChange={(e) => handleChange('destination', e.target.value)}
          disabled={isSubmitting}
        >
          <option value="" disabled>Select a destination</option>
          {hasUnlistedDefault && (
            <option value={defaultDestination}>{defaultDestination}</option>
          )}
          {DESTINATION_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {errors.destination && <p className={errorClasses}>{errors.destination}</p>}
      </div>

      {/* Trip Type + Budget */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="cp-tripType" className={labelClasses}>Trip type</label>
          <select
            id="cp-tripType"
            className={inputClasses}
            value={formData.tripType}
            onChange={(e) => handleChange('tripType', e.target.value)}
            disabled={isSubmitting}
          >
            <option value="" disabled>Select</option>
            {TRIP_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {errors.tripType && <p className={errorClasses}>{errors.tripType}</p>}
        </div>
        <div>
          <label htmlFor="cp-budget" className={labelClasses}>Budget per person</label>
          <select
            id="cp-budget"
            className={inputClasses}
            value={formData.budgetPerPerson}
            onChange={(e) => handleChange('budgetPerPerson', e.target.value)}
            disabled={isSubmitting}
          >
            <option value="" disabled>Select</option>
            {BUDGET_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {errors.budgetPerPerson && <p className={errorClasses}>{errors.budgetPerPerson}</p>}
        </div>
      </div>

      {/* Section 2: Priorities */}
      <div className="border-t border-gray-100 pt-5">
        <h3 className="text-base font-semibold text-gray-900 mb-1">What matters most</h3>
        <p className="text-sm text-gray-500 mb-3">
          Pick up to {MAX_PRIORITIES} priorities.{' '}
          {formData.priorities.length > 0 && (
            <span className="text-brand-600 font-medium">
              {formData.priorities.length}/{MAX_PRIORITIES} selected
            </span>
          )}
        </p>
        <div id="cp-priorities" tabIndex={-1} className="flex flex-wrap gap-2 outline-none">
          {PRIORITY_OPTIONS.map((priority) => {
            const selected = formData.priorities.includes(priority);
            const atMax = formData.priorities.length >= MAX_PRIORITIES && !selected;
            return (
              <button
                key={priority}
                type="button"
                onClick={() => handlePriorityToggle(priority)}
                disabled={isSubmitting || atMax}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  selected
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : atMax
                    ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-brand-400 hover:text-brand-700'
                }`}
              >
                {priority}
              </button>
            );
          })}
        </div>
        {errors.priorities && <p className={errorClasses}>{errors.priorities}</p>}
      </div>

      {/* Special Requests */}
      <div>
        <label htmlFor="cp-specialRequests" className={labelClasses}>
          Special requests{' '}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id="cp-specialRequests"
          className={`${inputClasses} resize-none`}
          rows={3}
          placeholder="Dietary needs, mobility, allergies, milestone celebration, etc."
          value={formData.specialRequests}
          onChange={(e) => handleChange('specialRequests', e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      {/* Section 3: Contact */}
      <div className="border-t border-gray-100 pt-5">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Your contact info</h3>
        <p className="text-sm text-gray-500 mb-4">So I know where to send the proposal.</p>
      </div>

      {/* Name Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="cp-firstName" className={labelClasses}>First name</label>
          <input
            type="text"
            id="cp-firstName"
            className={inputClasses}
            placeholder="First"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            disabled={isSubmitting}
          />
          {errors.firstName && <p className={errorClasses}>{errors.firstName}</p>}
        </div>
        <div>
          <label htmlFor="cp-lastName" className={labelClasses}>Last name</label>
          <input
            type="text"
            id="cp-lastName"
            className={inputClasses}
            placeholder="Last"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            disabled={isSubmitting}
          />
          {errors.lastName && <p className={errorClasses}>{errors.lastName}</p>}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="cp-email" className={labelClasses}>Email</label>
        <input
          type="email"
          id="cp-email"
          className={inputClasses}
          placeholder="you@example.com"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          disabled={isSubmitting}
        />
        {errors.email && <p className={errorClasses}>{errors.email}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="cp-phone" className={labelClasses}>Phone</label>
        <input
          type="tel"
          id="cp-phone"
          className={inputClasses}
          placeholder="(555) 555-5555"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          disabled={isSubmitting}
        />
        {errors.phone && <p className={errorClasses}>{errors.phone}</p>}
      </div>

      {/* Source */}
      <div>
        <label htmlFor="cp-source" className={labelClasses}>
          How did you find us?{' '}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <select
          id="cp-source"
          className={inputClasses}
          value={formData.source}
          onChange={(e) => handleChange('source', e.target.value)}
          disabled={isSubmitting}
        >
          <option value="">Select</option>
          {SOURCE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Server Error */}
      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-4 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors text-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Submitting...
          </>
        ) : CONCIERGE_FEE_ENABLED ? (
          `Continue to $${CONCIERGE_FEE} Payment`
        ) : (
          'Get my free trip plan'
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        No obligation until payment. Your info is never sold or shared.
      </p>
    </form>
  );
}
