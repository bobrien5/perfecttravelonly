'use client';

import { useRouter } from 'next/navigation';

export default function AdminHeader() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
      <button
        onClick={handleLogout}
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        Log out
      </button>
    </header>
  );
}
