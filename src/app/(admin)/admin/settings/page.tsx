'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleTestLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: currentPassword }),
    });

    if (res.ok) {
      setMessage('Password is valid');
    } else {
      setMessage('Password is invalid');
    }
    setCurrentPassword('');
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Dashboard configuration</p>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">API Connections</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-700">GoHighLevel</p>
              <p className="text-xs text-gray-500">CRM & lead tracking</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">SendGrid</p>
              <p className="text-xs text-gray-500">Email marketing & stats</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">Supabase</p>
              <p className="text-xs text-gray-500">Manual data storage</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">Facebook / Instagram</p>
              <p className="text-xs text-gray-500">Social media insights</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
              Manual Entry
            </span>
          </div>
        </div>
      </div>

      {/* Test Password */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Test Password</h3>
        <form onSubmit={handleTestLogin} className="flex items-end gap-3">
          <div className="flex-1 max-w-xs">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Test
          </button>
          {message && (
            <p className={`text-sm ${message.includes('valid') && !message.includes('invalid') ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </p>
          )}
        </form>
      </div>

      {/* Environment Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Environment</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>To change the admin password, update <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">ADMIN_PASSWORD_HASH</code> in your environment variables.</p>
          <p className="text-xs text-gray-400 mt-2">
            Generate a new hash: <code className="bg-gray-100 px-1.5 py-0.5 rounded">npx bcryptjs hash &quot;your-password&quot;</code>
          </p>
        </div>
      </div>
    </div>
  );
}
