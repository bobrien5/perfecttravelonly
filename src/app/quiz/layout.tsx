import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { absolute: 'Find Your Perfect Vacation | VacationPro' },
};

export default function QuizLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <img src="/logo.svg" alt="VacationPro" className="w-7 h-7" />
          <span className="text-lg font-bold text-gray-900">
            Vacation<span className="text-brand-600">Pro</span>
          </span>
        </Link>
      </div>
      {children}
    </div>
  );
}
