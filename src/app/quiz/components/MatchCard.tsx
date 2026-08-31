import { Match } from '@/lib/match/types';

interface MatchCardProps {
  match: Match;
  onSeeTrip?: () => void;
  onSaveMatches?: () => void;
}

function formatFlightHours(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  if (minutes === 0) return `~${wholeHours}h`;
  return `~${wholeHours}h ${minutes}m`;
}

export default function MatchCard({ match, onSeeTrip, onSaveMatches }: MatchCardProps) {
  const { profile, pct, reasons } = match;

  return (
    <div className="border-2 border-brand-500 rounded-2xl p-6 bg-white">
      <span className="inline-block bg-brand-500 text-white text-xs font-extrabold rounded-full px-3 py-1 mb-3">
        {pct}% MATCH
      </span>

      <h2 className="text-xl font-extrabold text-gray-900 mb-3">
        {profile.name} <span aria-hidden="true">{profile.flag}</span>
      </h2>

      <p className="text-gray-600 mb-4">{profile.blurb}</p>

      <h3 className="text-sm font-bold text-gray-900 mb-2">Why it fits you</h3>
      <ul className="mb-4 space-y-1.5">
        {reasons.map((reason) => (
          <li key={reason.text} className="text-sm text-gray-700 flex items-start gap-2">
            <span className="text-brand-500 font-bold" aria-hidden="true">✓</span>
            <span>{reason.text}</span>
          </li>
        ))}
      </ul>

      <div className="flex justify-between text-sm font-semibold text-gray-700 mb-5 border-t border-gray-100 pt-4">
        <span>Typical trip: {'$'.repeat(profile.priceTier)}</span>
        <span>Flight: {formatFlightHours(profile.typicalFlightHours)}</span>
      </div>

      <button
        type="button"
        onClick={onSeeTrip}
        className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3.5 font-bold w-full mb-3"
      >
        See Your {profile.name} Trip
      </button>

      <button
        type="button"
        onClick={onSaveMatches}
        className="text-gray-500 hover:text-gray-700 text-sm font-semibold w-full text-center"
      >
        Save my matches
      </button>
    </div>
  );
}
