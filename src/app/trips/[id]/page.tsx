import { notFound } from 'next/navigation';

import { DESTINATION_PROFILES } from '@vacationpro/engine';

import { checklistProgress, getTrip } from '@/lib/trips/data';

import TripChecklist from './TripChecklist';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Your Trip | VacationPro Trip Hub',
};

function destinationName(slug: string): string {
  const profile = DESTINATION_PROFILES.find((d) => d.slug === slug);
  return profile ? profile.name : slug;
}

function dateOrSeasonChip(trip: { date_start: string | null; date_end: string | null; season: string | null }): string | null {
  if (trip.date_start && trip.date_end) {
    return `${trip.date_start} to ${trip.date_end}`;
  }
  if (trip.season) {
    return trip.season.charAt(0).toUpperCase() + trip.season.slice(1);
  }
  return null;
}

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await getTrip(id);

  if (!trip) {
    notFound();
  }

  const name = destinationName(trip.destination_slug);
  const chip = dateOrSeasonChip(trip);
  const { done, total } = checklistProgress(trip.checklist);

  return (
    <div className="min-h-screen bg-cream px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Your {name} Trip</h1>

        <div className="flex flex-wrap gap-2 mb-2">
          {chip && (
            <span className="inline-block border-2 rounded-full px-3 py-1 text-xs font-semibold text-gray-600 border-gray-200">
              {chip}
            </span>
          )}
          {trip.party && (
            <span className="inline-block border-2 rounded-full px-3 py-1 text-xs font-semibold text-gray-600 border-gray-200">
              {trip.party}
            </span>
          )}
        </div>

        <p className="text-sm font-semibold text-gray-500 mb-6">
          {done} of {total} complete
        </p>

        <TripChecklist tripId={trip.id} checklist={trip.checklist} />
      </div>
    </div>
  );
}
