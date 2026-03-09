import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllText?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  viewAllHref,
  viewAllText = 'View All',
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-sm font-medium text-brand-600 hover:text-brand-700 whitespace-nowrap"
        >
          {viewAllText} &rarr;
        </Link>
      )}
    </div>
  );
}
