import Link from 'next/link';
import { Destination } from '@/types';

interface DestinationCardProps {
  destination: Destination;
}

export default function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group relative rounded-xl overflow-hidden aspect-[4/5] block"
    >
      <img
        src={destination.heroImage}
        alt={destination.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-xl font-bold text-white mb-1">{destination.name}</h3>
        <p className="text-sm text-white/80">{destination.country}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
            {destination.dealCount} deals
          </span>
        </div>
      </div>
    </Link>
  );
}
