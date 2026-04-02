'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const REVENUE_SOURCES = [
  { value: 'facebook_creator', label: 'Facebook Creator' },
  { value: 'sponsorship', label: 'Brand Sponsorship' },
  { value: 'newsletter_ads', label: 'Newsletter Advertising' },
  { value: 'affiliate_expedia', label: 'Affiliate — Expedia' },
  { value: 'affiliate_travelpayouts', label: 'Affiliate — Travelpayouts' },
  { value: 'affiliate_awin', label: 'Affiliate — Awin' },
];

interface RevenueEntry {
  id: string;
  source: string;
  amount: number;
  description: string | null;
  date: string;
}

interface WebinarEntry {
  id: string;
  contact_name: string | null;
  contact_email: string | null;
  attended_at: string;
  billable: boolean;
  notes: string | null;
}

export default function RevenueEntryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<RevenueEntry[]>([]);
  const [webinars, setWebinars] = useState<WebinarEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async () => {
    const [revRes, webRes] = await Promise.all([
      fetch('/api/admin/revenue'),
      fetch('/api/admin/webinar'),
    ]);
    if (revRes.ok) {
      const data = await revRes.json();
      setEntries(data.entries);
    }
    if (webRes.ok) {
      const data = await webRes.json();
      setWebinars(data.attendance);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [revRes, webRes] = await Promise.all([
        fetch('/api/admin/revenue'),
        fetch('/api/admin/webinar'),
      ]);
      if (cancelled) return;
      if (revRes.ok) {
        const data = await revRes.json();
        setEntries(data.entries);
      }
      if (webRes.ok) {
        const data = await webRes.json();
        setWebinars(data.attendance);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function handleRevenueSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const form = new FormData(e.currentTarget);
    const data = {
      source: form.get('source'),
      amount: Number(form.get('amount')),
      description: form.get('description') || null,
      date: form.get('date'),
    };

    const res = await fetch('/api/admin/revenue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setMessage('Revenue entry added');
      (e.target as HTMLFormElement).reset();
      fetchData();
      router.refresh();
    } else {
      setMessage('Failed to add entry');
    }
    setLoading(false);
  }

  async function handleWebinarSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const form = new FormData(e.currentTarget);
    const data = {
      contact_name: form.get('contact_name') || null,
      contact_email: form.get('contact_email') || null,
      attended_at: form.get('attended_at'),
      notes: form.get('notes') || null,
    };

    const res = await fetch('/api/admin/webinar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setMessage('Webinar attendance logged');
      (e.target as HTMLFormElement).reset();
      fetchData();
      router.refresh();
    } else {
      setMessage('Failed to log attendance');
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/revenue?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchData();
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Revenue Entry</h1>
        <p className="text-sm text-gray-500 mt-1">Log revenue and webinar attendance</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Revenue Entry Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Add Revenue</h3>
        <form onSubmit={handleRevenueSubmit} className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Source</label>
              <select
                name="source"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {REVENUE_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Amount ($)</label>
              <input
                type="number"
                name="amount"
                step="0.01"
                required
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input
                type="date"
                name="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <input
                type="text"
                name="description"
                placeholder="Optional note"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Revenue'}
          </button>
        </form>
      </div>

      {/* Webinar Attendance Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Log Webinar Attendance</h3>
        <p className="text-xs text-gray-500 mb-4">Each billable attendee = $250 WOW Vacations revenue</p>
        <form onSubmit={handleWebinarSubmit} className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contact Name</label>
              <input
                type="text"
                name="contact_name"
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contact Email</label>
              <input
                type="email"
                name="contact_email"
                placeholder="john@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date Attended</label>
              <input
                type="date"
                name="attended_at"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <input
                type="text"
                name="notes"
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging...' : 'Log Attendance'}
          </button>
        </form>
      </div>

      {/* Recent Revenue Entries */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Recent Revenue Entries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 font-medium text-gray-500">Date</th>
                <th className="px-5 py-3 font-medium text-gray-500">Source</th>
                <th className="px-5 py-3 font-medium text-gray-500">Amount</th>
                <th className="px-5 py-3 font-medium text-gray-500">Description</th>
                <th className="px-5 py-3 font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-900">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {REVENUE_SOURCES.find((s) => s.value === entry.source)?.label || entry.source}
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900">
                    ${Number(entry.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{entry.description || '—'}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    No revenue entries yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Webinar Attendance */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Webinar Attendance Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 font-medium text-gray-500">Date</th>
                <th className="px-5 py-3 font-medium text-gray-500">Name</th>
                <th className="px-5 py-3 font-medium text-gray-500">Email</th>
                <th className="px-5 py-3 font-medium text-gray-500">Billable</th>
                <th className="px-5 py-3 font-medium text-gray-500">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {webinars.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-900">
                    {new Date(w.attended_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{w.contact_name || '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{w.contact_email || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${w.billable ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {w.billable ? '$250' : 'No'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{w.notes || '—'}</td>
                </tr>
              ))}
              {webinars.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    No webinar attendance logged
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
