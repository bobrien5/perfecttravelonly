import type { ResortRecord } from '@vacationpro/engine';
import { destinationName, resortImage } from '@/lib/resorts/catalog';

/** Resort photo when we have a verified one, else a branded panel (never a stand-in photo of somewhere else). */
export default function ResortVisual({ resort, className = '' }: { resort: ResortRecord; className?: string }) {
  const img = resortImage(resort);
  if (img) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={img.src} alt={img.alt} loading="lazy" className={`w-full object-cover ${className}`} />;
  }
  return (
    <div
      aria-hidden="true"
      className={`flex w-full items-end bg-gradient-to-br from-brand-700 via-brand-800 to-forest p-4 ${className}`}
    >
      <span className="text-sm font-semibold uppercase tracking-wide text-white/80">{destinationName(resort.destination)}</span>
    </div>
  );
}
