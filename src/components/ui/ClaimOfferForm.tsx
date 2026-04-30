'use client';

import { useState } from 'react';

// ─── Dropdown Options ────────────────────────────────────────

const AGE_RANGES = ['', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
const MARITAL_STATUSES = ['', 'Single', 'Married/Partner', 'Divorced', 'Widowed'];
const INCOME_RANGES = ['', 'Under $50K', '$50K-$75K', '$75K-$100K', '$100K-$150K', '$150K+'];
const OWN_RENT_OPTIONS = ['', 'Own', 'Rent'];

// ─── Types ───────────────────────────────────────────────────

interface ClaimOfferFormProps {
  dealTitle: string;
  dealDestination: string;
  dealPrice: number;
  ctaText: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ageRange: string;
  maritalStatus: string;
  householdIncome: string;
  ownOrRent: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  ageRange: '',
  maritalStatus: '',
  householdIncome: '',
  ownOrRent: '',
};

// ─── Styling Constants ───────────────────────────────────────

const inputClasses =
  'w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed';
const labelClasses = 'block text-sm font-medium text-gray-700 mb-1';
const errorClasses = 'text-xs text-red-600 mt-1';

// ─── Component ───────────────────────────────────────────────

export default function ClaimOfferForm({
  dealTitle,
  dealDestination,
  ctaText,
}: ClaimOfferFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  // ─── Handlers ────────────────────────────────────────────

  function handleChange(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};

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

    if (!formData.ageRange) errs.ageRange = 'Required';
    if (!formData.maritalStatus) errs.maritalStatus = 'Required';
    if (!formData.householdIncome) errs.householdIncome = 'Required';
    if (!formData.ownOrRent) errs.ownOrRent = 'Required';

    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
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
      const res = await fetch('/api/ghl/claim-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dealTitle,
          dealDestination,
          sourcePageUrl,
          referrerUrl,
          utmSource,
          utmMedium,
          utmCampaign,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setServerError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    }
  }

  // ─── Success State ───────────────────────────────────────

  if (status === 'success') {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">You&apos;re In!</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          We&apos;ve received your information for <strong>{dealTitle}</strong>. Our team
          will reach out within 24 hours to confirm your eligibility and next steps.
        </p>
      </div>
    );
  }

  // ─── Form ────────────────────────────────────────────────

  const isSubmitting = status === 'submitting';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Claim This Offer</h3>
        <p className="text-sm text-gray-500 mb-4">Fill out the form below to check your eligibility.</p>
      </div>

      {/* Name Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="co-firstName" className={labelClasses}>First Name</label>
          <input
            type="text"
            id="co-firstName"
            className={inputClasses}
            placeholder="First"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            disabled={isSubmitting}
          />
          {errors.firstName && <p className={errorClasses}>{errors.firstName}</p>}
        </div>
        <div>
          <label htmlFor="co-lastName" className={labelClasses}>Last Name</label>
          <input
            type="text"
            id="co-lastName"
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
        <label htmlFor="co-email" className={labelClasses}>Email</label>
        <input
          type="email"
          id="co-email"
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
        <label htmlFor="co-phone" className={labelClasses}>Phone</label>
        <input
          type="tel"
          id="co-phone"
          className={inputClasses}
          placeholder="(555) 555-5555"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          disabled={isSubmitting}
        />
        {errors.phone && <p className={errorClasses}>{errors.phone}</p>}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Eligibility Questions</p>
      </div>

      {/* Age + Marital Status */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="co-age" className={labelClasses}>Age Range</label>
          <select
            id="co-age"
            className={inputClasses}
            value={formData.ageRange}
            onChange={(e) => handleChange('ageRange', e.target.value)}
            disabled={isSubmitting}
          >
            <option value="" disabled>Select</option>
            {AGE_RANGES.filter(Boolean).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {errors.ageRange && <p className={errorClasses}>{errors.ageRange}</p>}
        </div>
        <div>
          <label htmlFor="co-marital" className={labelClasses}>Marital Status</label>
          <select
            id="co-marital"
            className={inputClasses}
            value={formData.maritalStatus}
            onChange={(e) => handleChange('maritalStatus', e.target.value)}
            disabled={isSubmitting}
          >
            <option value="" disabled>Select</option>
            {MARITAL_STATUSES.filter(Boolean).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {errors.maritalStatus && <p className={errorClasses}>{errors.maritalStatus}</p>}
        </div>
      </div>

      {/* Income + Own/Rent */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="co-income" className={labelClasses}>Income</label>
          <select
            id="co-income"
            className={inputClasses}
            value={formData.householdIncome}
            onChange={(e) => handleChange('householdIncome', e.target.value)}
            disabled={isSubmitting}
          >
            <option value="" disabled>Select</option>
            {INCOME_RANGES.filter(Boolean).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {errors.householdIncome && <p className={errorClasses}>{errors.householdIncome}</p>}
        </div>
        <div>
          <label htmlFor="co-ownrent" className={labelClasses}>Own or Rent</label>
          <select
            id="co-ownrent"
            className={inputClasses}
            value={formData.ownOrRent}
            onChange={(e) => handleChange('ownOrRent', e.target.value)}
            disabled={isSubmitting}
          >
            <option value="" disabled>Select</option>
            {OWN_RENT_OPTIONS.filter(Boolean).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {errors.ownOrRent && <p className={errorClasses}>{errors.ownOrRent}</p>}
        </div>
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
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Submitting...
          </>
        ) : (
          ctaText || 'Claim This Offer'
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        No obligation. Our team will verify your eligibility.
      </p>
    </form>
  );
}
