import Link from 'next/link';
import { redirect } from 'next/navigation';
import StatCard from '@/components/admin/StatCard';
import { isAdminSession } from '@/lib/admin/auth';
import { funnelSummary, type FunnelRow } from '@/lib/quote/admin';
import { LEAD_STATUSES, type LeadStatus } from '@/lib/quote/config';
import { destinationName, getResortRecord } from '@/lib/resorts/catalog';
import { supabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Quote Requests' };

interface Row extends FunnelRow {
  id: string;
  reference: string;
  created_at: string;
  first_name: string;
  last_name: string | null;
  email: string;
  selected_resort_id: string | null;
  destination: string | null;
  source: string | null;
  next_follow_up_on: string | null;
  notification: { travelerEmail?: string; advisorEmail?: string } | null;
}

const STATUS_STYLE: Record<LeadStatus, string> = {
  new: 'bg-blue-50 text-blue-800',
  contacted: 'bg-indigo-50 text-indigo-800',
  quoted: 'bg-amber-50 text-amber-900',
  booked: 'bg-green-50 text-green-800',
  traveled: 'bg-emerald-100 text-emerald-900',
  lost: 'bg-gray-100 text-gray-700',
  canceled: 'bg-red-50 text-red-800',
};

const usd = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  if (!(await isAdminSession())) redirect('/admin/login');
  const { status } = await searchParams;
  const filter = LEAD_STATUSES.includes(status as LeadStatus) ? (status as LeadStatus) : null;

  const { data, error } = await supabase
    .from('quote_requests')
    .select('id, reference, created_at, first_name, last_name, email, selected_resort_id, destination, source, status, next_follow_up_on, expected_commission, actual_commission, commission_status, booking_currency, notification')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Quote Requests</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          Could not load quote requests: {error.message}. If the table is missing, run sql/quote_requests.sql in Supabase.
        </div>
      </div>
    );
  }

  const rows = (data ?? []) as Row[];
  const s = funnelSummary(rows);
  const shown = filter ? rows.filter((r) => r.status === filter) : rows;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quote Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Advisor leads from the site. Quotes, bookings, completed travel and paid commission are counted separately. Commission is revenue, not profit, and
          expected amounts are estimates until paid.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard label="Requested" value={s.requested} subtitle={`${s.new} new`} />
        <StatCard label="Quoted" value={s.quoted} />
        <StatCard label="Booked" value={s.booked} />
        <StatCard label="Traveled" value={s.traveled} />
        <StatCard label="Expected commission" value={usd(s.expectedOutstandingUsd)} subtitle="Booked, not yet paid (estimate)" />
        <StatCard label="Commission paid" value={usd(s.paidUsd)} subtitle="Received" />
      </div>
      {s.nonUsdRows > 0 && <p className="text-xs text-gray-500">{s.nonUsdRows} non-USD bookings are excluded from the totals above.</p>}
      <p className="text-xs text-gray-500">
        Self-booked affiliate stays are not tracked here. See the Stay22 dashboard, which reports by campaign label (for example vp-results-best-overall), not by traveler.
      </p>

      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        <Link href="/admin/quotes" className={`rounded-full px-3 py-1 text-sm ${!filter ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200'}`}>All</Link>
        {LEAD_STATUSES.map((st) => (
          <Link key={st} href={`/admin/quotes?status=${st}`} className={`rounded-full px-3 py-1 text-sm capitalize ${filter === st ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200'}`}>
            {st}
          </Link>
        ))}
      </nav>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Traveler</th>
              <th className="px-4 py-3 font-medium">Resort</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Follow up</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Emails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shown.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono"><Link href={`/admin/quotes/${r.id}`} className="font-semibold text-brand-700 underline">{r.reference}</Link></td>
                <td className="px-4 py-3 text-gray-600">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{[r.first_name, r.last_name].filter(Boolean).join(' ')}</div>
                  <div className="text-xs text-gray-500">{r.email}</div>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {r.selected_resort_id ? getResortRecord(r.selected_resort_id)?.name ?? r.selected_resort_id : <span className="text-gray-400">None</span>}
                  {r.destination && <div className="text-xs text-gray-500">{destinationName(r.destination)}</div>}
                </td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[r.status]}`}>{r.status}</span></td>
                <td className={`px-4 py-3 ${r.next_follow_up_on && r.next_follow_up_on <= today ? 'font-semibold text-red-700' : 'text-gray-600'}`}>{r.next_follow_up_on ?? ''}</td>
                <td className="px-4 py-3 text-gray-600">{r.source ?? 'direct'}</td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {r.notification?.travelerEmail ? `Traveler: ${r.notification.travelerEmail}` : 'Pending'}
                  {r.notification?.advisorEmail ? <div>Advisor: {r.notification.advisorEmail}</div> : null}
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No quote requests{filter ? ` with status ${filter}` : ''} yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
