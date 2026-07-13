// Stay22 account aid, confirmed from the aid= param in the links Stay22's own
// letmeallez script generates on our guide pages. Override via env if it changes.
const MAP_AID = process.env.NEXT_PUBLIC_STAY22_MAP_AID || 'vacationpr';

interface Stay22MapProps {
  address: string;
  checkin?: string;
  checkout?: string;
}

/**
 * Stay22 embedded map: shows bookable stays around an address, monetized by Stay22.
 * Safe on guide pages only (same rule as Stay22Scripts).
 */
export default function Stay22Map({ address, checkin, checkout }: Stay22MapProps) {
  const params = new URLSearchParams({ aid: MAP_AID, address });
  if (checkin) params.set('checkin', checkin);
  if (checkout) params.set('checkout', checkout);
  const src = `https://www.stay22.com/embed/gm?${params.toString()}`;

  return (
    <figure className="not-prose my-8">
      <iframe
        src={src}
        title={`Where to stay near ${address}`}
        width="100%"
        height="460"
        loading="lazy"
        style={{ border: 0, borderRadius: '0.75rem' }}
        referrerPolicy="no-referrer-when-downgrade"
      />
      <figcaption className="mt-2 text-sm text-gray-500">
        Compare places to stay near {address}. We may earn a commission from bookings, at no cost to you.
      </figcaption>
    </figure>
  );
}
