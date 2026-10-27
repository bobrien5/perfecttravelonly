import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { isAdminSession } from '@/lib/admin/auth';
import { parseQuoteUpdate, statusSideEffects, type StatusHistoryEntry } from '@/lib/quote/admin';
import { COMMISSION_STATUSES, LEAD_STATUSES, type LeadStatus } from '@/lib/quote/config';
import { destinationName, getResortRecord } from '@/lib/resorts/catalog';
import { supabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Quote Request' };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function saveQuote(formData: FormData) {
  'use server';
  // Server actions are reachable by POST, so check the session here too.
  if (!(await isAdminSession())) redirect('/admin/login');
  const id = String(formData.get('id') ?? '');
  if (!UUID_RE.test(id)) return;
  const parsed = parseQuoteUpdate((k) => {
    const v = formData.get(k);
    return typeof v === 'string' ? v : null;
  });
  if (!parsed.ok) {
    redirect(`/admin/quotes/${id}?error=${encodeURIComponent(Object.values(parsed.errors).join(' '))}`);
  }
  const { data: prev, error: readErr } = await supabase
    .from('quote_requests')
    .select('status, status_history, quoted_at, booked_at')
    .eq('id', id)
    .single();
  if (readErr || !prev) redirect(`/admin/quotes/${id}?error=${encodeURIComponent('Could not read the request.')}`);
  const side = statusSideEffects(
    prev as { status: LeadStatus; status_history: StatusHistoryEntry[]; quoted_at: string | null; booked_at: string | null },
    parsed.value.status,
    new Date().toISOString(),
  );
  const { error } = await supabase.from('quote_requests').update({ ...parsed.value, ...side }).eq('id', id);
  if (error) redirect(`/admin/quotes/${id}?error=${encodeURIComponent(`Save failed: ${error.message}`)}`);
  revalidatePath('/admin/quotes');
  redirect(`/admin/quotes/${id}?saved=1`);
}

const input = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none';
const label = 'block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1';

export default async function QuoteDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  if (!(await isAdminSession())) redirect('/admin/login');
  const { id } = await params;
  const { saved, error } = await searchParams;
  if (!UUID_RE.test(id)) notFound();
  const { data: q } = await supabase.from('quote_requests').select('*').eq('id', id).maybeSingle();
  if (!q) notFound();

  const resort = q.selected_resort_id ? getResortRecord(q.selected_resort_id) : null;
  const alts: string[] = (q.alternative_resort_ids ?? []).map((a: string) => getResortRecord(a)?.name ?? a);
  const dates = q.dates
    ? q.dates.mode === 'exact'
      ? `${q.dates.checkIn} to ${q.dates.checkOut}`
      : `${q.dates.month ?? 'Month flexible'}, ${q.dates.nights} nights`
    : 'Not given';
  const facts: [string, string][] = [
    ['Created', new Date(q.created_at).toLocaleString()],
    ['Source', [q.source ?? 'direct', q.source_page].filter(Boolean).join(' · ')],
    ['Email', q.email],
    ['Phone', q.phone ?? 'Not given'],
    ['Prefers', q.contact_preference],
    ['Marketing consent', q.marketing_consent ? 'Yes' : 'No'],
    ['Resort', resort?.name ?? 'Not chosen'],
    ['Alternatives', alts.join(', ') || 'None'],
    ['Destination', q.destination ? destinationName(q.destination) : 'Not chosen'],
    ['Dates', [dates, q.dates_note].filter(Boolean).join('. ')],
    ['Travelers', `${q.adults} adults${q.child_ages?.length ? `, children ${q.child_ages.join(', ')}` : ''}, ${q.rooms} room(s)`],
    ['Departure airport', q.departure_airport ?? 'Not decided'],
    ['Budget', q.budget_amount ? `${Number(q.budget_amount).toLocaleString()} ${q.budget_currency ?? ''} (flights: ${q.budget_includes_flights ?? 'not said'})` : 'Not given'],
    ['Quote covers', q.trip_scope],
    ['Booking timeframe', q.booking_timeframe],
    ['Priorities', (q.priorities ?? []).join(', ') || 'None'],
    ['Notifications', q.notification?.at ? `Traveler ${q.notification.travelerEmail}, advisor ${q.notification.advisorEmail}, CRM ${q.notification.crm}` : 'Pending or not recorded'],
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <Link href="/admin/quotes" className="text-sm text-gray-500 underline">All quote requests</Link>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">
          {q.reference}: {[q.first_name, q.last_name].filter(Boolean).join(' ')}
        </h1>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium capitalize text-gray-800">{q.status}</span>
      </div>
      {saved && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Saved.</p>}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Request</h2>
          <dl className="divide-y divide-gray-100 text-sm">
            {facts.map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-2 py-2">
                <dt className="text-gray-500">{k}</dt>
                <dd className="col-span-2 break-words text-gray-900">{v}</dd>
              </div>
            ))}
          </dl>
          {q.notes && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold uppercase text-gray-500">Traveler notes</h3>
              <p className="mt-1 whitespace-pre-line text-sm text-gray-900">{q.notes}</p>
            </div>
          )}
          {q.quiz_answers && (
            <details className="mt-4 text-xs">
              <summary className="cursor-pointer font-semibold text-gray-600">Quiz answers</summary>
              <pre className="mt-2 overflow-x-auto rounded bg-gray-50 p-3">{JSON.stringify(q.quiz_answers, null, 2)}</pre>
            </details>
          )}
          {Array.isArray(q.status_history) && q.status_history.length > 0 && (
            <div className="mt-4 text-xs text-gray-600">
              <h3 className="font-semibold uppercase text-gray-500">Status history</h3>
              <ul className="mt-1 space-y-0.5">
                {q.status_history.map((h: StatusHistoryEntry, i: number) => (
                  <li key={i}>{new Date(h.at).toLocaleString()}: {h.status}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <form action={saveQuote} className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
          <input type="hidden" name="id" value={q.id} />
          <h2 className="text-sm font-semibold text-gray-900">Advisor workflow</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="status" className={label}>Status</label>
              <select id="status" name="status" defaultValue={q.status} className={input}>
                {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="next_follow_up_on" className={label}>Next follow-up</label>
              <input id="next_follow_up_on" name="next_follow_up_on" type="date" defaultValue={q.next_follow_up_on ?? ''} className={input} />
            </div>
          </div>
          <div>
            <label htmlFor="advisor_notes" className={label}>Notes</label>
            <textarea id="advisor_notes" name="advisor_notes" rows={4} defaultValue={q.advisor_notes ?? ''} className={input} />
          </div>

          <h3 className="pt-2 text-sm font-semibold text-gray-900">Booking</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="supplier" className={label}>Supplier</label>
              <input id="supplier" name="supplier" defaultValue={q.supplier ?? ''} className={input} placeholder="e.g. Fora, ALG, brand portal" />
            </div>
            <div>
              <label htmlFor="booking_currency" className={label}>Currency</label>
              <input id="booking_currency" name="booking_currency" maxLength={3} defaultValue={q.booking_currency ?? 'USD'} className={input} />
            </div>
            <div>
              <label htmlFor="travel_start" className={label}>Travel start</label>
              <input id="travel_start" name="travel_start" type="date" defaultValue={q.travel_start ?? ''} className={input} />
            </div>
            <div>
              <label htmlFor="travel_end" className={label}>Travel end</label>
              <input id="travel_end" name="travel_end" type="date" defaultValue={q.travel_end ?? ''} className={input} />
            </div>
            <div>
              <label htmlFor="booking_value" className={label}>Booking value</label>
              <input id="booking_value" name="booking_value" inputMode="decimal" defaultValue={q.booking_value ?? ''} className={input} />
            </div>
            <div>
              <label htmlFor="commissionable_amount" className={label}>Commissionable amount</label>
              <input id="commissionable_amount" name="commissionable_amount" inputMode="decimal" defaultValue={q.commissionable_amount ?? ''} className={input} />
            </div>
          </div>
          <p className="text-xs text-gray-500">Commissionable excludes taxes, flights and any package parts the supplier does not pay on.</p>

          <h3 className="pt-2 text-sm font-semibold text-gray-900">Commission (revenue, not profit)</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="commission_rate_pct" className={label}>Rate %</label>
              <input id="commission_rate_pct" name="commission_rate_pct" inputMode="decimal" defaultValue={String(Math.round(Number(q.commission_rate ?? 0.12) * 10000) / 100)} className={input} />
            </div>
            <div>
              <span className={label}>Expected (estimate)</span>
              <p className="py-2 text-sm text-gray-900">{q.expected_commission !== null ? `${Number(q.expected_commission).toLocaleString()} ${q.booking_currency}` : 'Set commissionable amount'}</p>
            </div>
            <div>
              <label htmlFor="commission_status" className={label}>Payment status</label>
              <select id="commission_status" name="commission_status" defaultValue={q.commission_status} className={input}>
                {COMMISSION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="actual_commission" className={label}>Actual commission</label>
              <input id="actual_commission" name="actual_commission" inputMode="decimal" defaultValue={q.actual_commission ?? ''} className={input} />
            </div>
            <div>
              <label htmlFor="commission_paid_on" className={label}>Paid on</label>
              <input id="commission_paid_on" name="commission_paid_on" type="date" defaultValue={q.commission_paid_on ?? ''} className={input} />
            </div>
          </div>
          <button type="submit" className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">Save</button>
        </form>
      </div>
    </div>
  );
}
