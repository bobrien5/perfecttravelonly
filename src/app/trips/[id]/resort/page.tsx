import { notFound, redirect } from 'next/navigation';

import { DESTINATION_PROFILES, rankResorts, type Vibe, type Dealbreaker } from '@vacationpro/engine';

import { getServerUser } from '@/lib/supabase/server';
import { getTrip } from '@/lib/trips/data';
import { getResortsByDestination } from '@/sanity/lib/fetch';

import ResortPicker from './ResortPicker';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pick Your Resort | VacationPro Trip Hub',
};

function destinationName(slug: string): string {
  const profile = DESTINATION_PROFILES.find((d) => d.slug === slug);
  return profile ? profile.name : slug;
}

export default async function ResortPickerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Same guard as /trips/[id]: a signed-out visitor gets bounced to signin
  // instead of a bare 404, which stays reserved for an authenticated user
  // hitting a trip that isn't theirs.
  const user = await getServerUser();
  if (!user) {
    redirect('/auth/signin?next=/trips');
  }

  const trip = await getTrip(id);

  if (!trip) {
    notFound();
  }

  const destination = destinationName(trip.destination_slug);
  const resorts = await getResortsByDestination(trip.destination_slug);
  const ranked = rankResorts(
    {
      vibes: trip.vibes as Vibe[],
      dealbreakers: trip.dealbreakers as Dealbreaker[],
      budgetBand: trip.budget_band,
      party: trip.party,
    },
    resorts
  );

  return (
    <div className="min-h-screen bg-cream px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Pick your resort</h1>
        <p className="text-gray-600 mb-6">
          Ranked for your trip. {ranked.length} matches in {destination}.
        </p>

        <ResortPicker
          tripId={trip.id}
          destination={destination}
          ranked={ranked}
          initialResortSlug={trip.resort_slug}
        />
      </div>
    </div>
  );
}
