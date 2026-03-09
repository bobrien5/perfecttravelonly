import Link from 'next/link';

interface AffiliateDisclosureProps {
  variant?: 'inline' | 'block';
}

export default function AffiliateDisclosure({ variant = 'inline' }: AffiliateDisclosureProps) {
  if (variant === 'block') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-600">Affiliate Disclosure:</strong> VacationPro may earn a commission
          when you click on or make a purchase through the links on this page. This does not affect our
          editorial independence or the price you pay. We only recommend deals we believe offer genuine value.
          See our full{' '}
          <Link href="/legal/affiliate-disclosure" className="text-brand-600 hover:underline">
            affiliate disclosure
          </Link>{' '}
          for details.
        </p>
      </div>
    );
  }

  return (
    <p className="text-xs text-gray-400">
      Some links on this page are affiliate links. See our{' '}
      <Link href="/legal/affiliate-disclosure" className="text-brand-500 hover:underline">
        disclosure
      </Link>.
    </p>
  );
}
