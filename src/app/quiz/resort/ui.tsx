'use client';

import type { ReactNode } from 'react';

/** Shared, accessible building blocks for the resort quiz steps. */

export function StepHeading({ title, hint, id }: { title: string; hint?: string; id: string }) {
  return (
    <div className="mb-6">
      <h1 id={id} tabIndex={-1} className="text-2xl font-extrabold leading-tight text-gray-900 outline-none sm:text-3xl">
        {title}
      </h1>
      {hint && <p className="mt-2 text-base text-gray-600">{hint}</p>}
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm font-semibold text-red-700">
      {message}
    </p>
  );
}

interface ChoiceProps {
  type: 'radio' | 'checkbox';
  name: string;
  value: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  label: string;
  description?: string;
  icon?: string;
}

/** Native radio/checkbox, visually a large card. Keyboard and screen-reader friendly by default. */
export function Choice({ type, name, value, checked, disabled, onChange, label, description, icon }: ChoiceProps) {
  return (
    <label className={`block ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className="flex min-h-14 items-start gap-3 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 transition peer-checked:border-brand-700 peer-checked:bg-brand-50 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-300 peer-disabled:opacity-50">
        {icon && (
          <span aria-hidden="true" className="text-xl leading-6">
            {icon}
          </span>
        )}
        <span className="flex-1">
          <span className="block font-bold text-gray-900">{label}</span>
          {description && <span className="mt-0.5 block text-sm text-gray-600">{description}</span>}
        </span>
        <span
          aria-hidden="true"
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border-2 text-xs font-bold ${
            type === 'radio' ? 'rounded-full' : 'rounded'
          } ${checked ? 'border-brand-700 bg-brand-700 text-white' : 'border-gray-300'}`}
        >
          {checked ? '✓' : ''}
        </span>
      </span>
    </label>
  );
}

export function ChoiceGroup({
  legend,
  children,
  errorId,
  error,
  columns = 1,
}: {
  legend: string;
  children: ReactNode;
  errorId?: string;
  error?: string;
  columns?: 1 | 2;
}) {
  return (
    <fieldset className="mb-6" aria-describedby={error && errorId ? errorId : undefined}>
      <legend className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">{legend}</legend>
      <div className={`grid gap-3 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>{children}</div>
      {errorId && <FieldError id={errorId} message={error} />}
    </fieldset>
  );
}

export function Stepper({
  id,
  label,
  value,
  min,
  max,
  onChange,
  error,
  disabled,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  error?: string;
  disabled?: boolean;
}) {
  const btn =
    'flex h-12 w-12 items-center justify-center rounded-xl border-2 border-gray-300 text-xl font-bold text-gray-800 hover:border-brand-700 disabled:opacity-40 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-300';
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-gray-800">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={disabled || value <= min} aria-label={`Fewer ${label.toLowerCase()}`}>
          −
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            onChange(Number.isNaN(n) ? min : n);
          }}
          className="h-12 w-16 rounded-xl border-2 border-gray-300 text-center text-lg font-bold text-gray-900 focus:border-brand-700 focus:outline-none"
        />
        <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={disabled || value >= max} aria-label={`More ${label.toLowerCase()}`}>
          +
        </button>
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export const inputClass =
  'h-12 w-full rounded-xl border-2 border-gray-300 bg-white px-4 text-base text-gray-900 focus:border-brand-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200';

export const primaryButton =
  'inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-700 px-6 py-3 font-bold text-white transition hover:bg-brand-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 disabled:opacity-50';

export const secondaryButton =
  'inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-gray-300 bg-white px-6 py-3 font-bold text-gray-800 transition hover:border-brand-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-300';
