import { EmailDashboard } from '@/components/admin/EmailStats';

export default function EmailPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Email Growth</h1>
        <p className="text-sm text-gray-500 mt-1">SendGrid newsletter performance</p>
      </div>
      <EmailDashboard />
    </div>
  );
}
