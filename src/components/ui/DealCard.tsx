import Link from 'next/link';
import { Deal } from '@/types';
import { formatPrice } from '@/lib/utils';

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  return (
    <article className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <Link href={`/deals/${deal.categorySlug}/${deal.slug}`}>
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={deal.heroImage}
            alt={deal.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {deal.featured && (
              <span className="px-2.5 py-1 bg-accent-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                Featured
              </span>
            )}
            {deal.isTimeshare && (
              <span className="px-2.5 py-1 bg-amber-600 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                Preview Offer
              </span>
            )}
          </div>
          {/* Savings badge */}
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 bg-success text-white text-xs font-bold rounded-full">
              Save {deal.savingsPercent}%
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          {/* Category + Destination */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-brand-600 uppercase tracking-wide">{deal.category}</span>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-500">{deal.destination}</span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
            {deal.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{deal.shortDescription}</p>

          {/* Price */}
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">{formatPrice(deal.price)}</span>
                <span className="text-sm text-gray-400 line-through">{formatPrice(deal.originalPrice)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">per person · {deal.duration}</p>
            </div>
            <span className="text-sm font-medium text-brand-600 group-hover:text-brand-700">
              {deal.ctaText} &rarr;
            </span>
          </div>

          {/* Provider */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">via {deal.provider}</span>
            <span className="text-xs text-gray-400">{deal.travelDates}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
