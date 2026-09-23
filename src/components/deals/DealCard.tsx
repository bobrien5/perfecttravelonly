import Link from 'next/link';
import { heroImageSrc } from '@/sanity/lib/image';
import type { Deal } from '@/types/deal';

/**
 * A deal as it appears in a listing.
 *
 * The price deliberately carries no "per person" or "total" qualifier here.
 * The source data is inconsistent about which it means (one deal's own
 * disclaimer warns the figure is per room, not per person), so the card says
 * "from" and the detail page carries the disclaimer. Stating the wrong basis
 * on a card is worse than stating none.
 */
export default function DealCard({ deal }: { deal: Deal }) {
  const img = heroImageSrc(deal, 800);
  const saving =
    deal.savingsPercent && deal.savingsPercent > 0 ? `Save ${deal.savingsPercent}%` : null;

  return (
    <Link
      href={`/deals/${deal.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:shadow-md"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-brand-100">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={deal.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-700 text-white/80">
            <span className="text-sm font-medium">{deal.destination}</span>
          </div>
        )}

        {deal.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-700">
            VacationPro Pick
          </span>
        )}
        {saving && (
          <span className="absolute right-3 top-3 rounded-full bg-brand-700 px-3 py-1 text-[11px] font-bold text-white">
            {saving}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {deal.destination}
          {deal.duration ? ` · ${deal.duration}` : ''}
        </p>
        <h3 className="mt-1 line-clamp-2 font-semibold leading-snug text-gray-900">
          {deal.title}
        </h3>

        <div className="mt-auto pt-3">
          <p className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              from ${deal.price.toLocaleString()}
            </span>
            {deal.originalPrice && deal.originalPrice > deal.price && (
              <span className="text-sm text-gray-400 line-through">
                ${deal.originalPrice.toLocaleString()}
              </span>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}
