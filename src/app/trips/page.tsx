import Link from 'next/link';
import { redirect } from 'next/navigation';

import { DESTINATION_PROFILES } from '@vacationpro/engine';

import { createServerSupabase } from '@/lib/supabase/server';
import { checklistProgress, getTripsForUser } from '@/lib/trips/data';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Your Trips | VacationPro Trip Hub',
};

function destinationLabel(slug: string): { name: string; flag: string | null } {
  const profile = DESTINATION_PROFILES.find((d) => d.slug === slug);
  return profile ? { name: profile.name, flag: profile.flag } : { name: slug, flag: null };
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

export default async function TripsPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin?next=/trips');
  }

  const trips = await getTripsForUser();

  return (
    <div className="min-h-screen bg-cream px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Your Trips</h1>

        {trips.length === 0 ? (
          <div className="border-2 rounded-xl border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600 mb-5">No trips yet. Take the quiz to get matched.</p>
            <Link
              href="/quiz"
              className="inline-block bg-brand-500 text-white rounded-xl font-bold px-6 py-3.5 hover:bg-brand-600 transition-colors"
            >
              Take the quiz
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => {
              const { name, flag } = destinationLabel(trip.destination_slug);
              const chip = dateOrSeasonChip(trip);
              const { done, total } = checklistProgress(trip.checklist);

              return (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="block border-2 rounded-xl border-gray-200 bg-white p-5 hover:border-brand-500 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-lg font-extrabold text-gray-900">
                      {name} {flag && <span aria-hidden="true">{flag}</span>}
                    </h2>
                    <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">
                      {done} of {total}
                    </span>
                  </div>
                  {chip && (
                    <span className="inline-block mt-2 border-2 rounded-full px-3 py-1 text-xs font-semibold text-gray-600 border-gray-200">
                      {chip}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
