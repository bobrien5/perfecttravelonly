import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { describeResort, ratingWord, PRIORITY_LABELS, type Priority } from '@vacationpro/engine';
import BookingActions from '@/components/booking/BookingActions';
import ResortVisual from '@/components/booking/ResortVisual';
import Stay22Guard from '@/components/monetization/Stay22Guard';
import { ACTIVE_RESORTS, PRICE_TIER_LABELS, ageLabel, destinationName, getResortRecord, transferLabel } from '@/lib/resorts/catalog';
import { quizHref, quoteHref, resortBookHref } from '@/lib/resorts/links';

export function generateStaticParams() {
  return ACTIVE_RESORTS.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const r = getResortRecord(id);
  if (!r || r.status !== 'active') return { robots: { index: false } };
  return {
    title: { absolute: `${r.name}: Who It Suits and Tradeoffs | VacationPro` },
    description: `${r.name} in ${destinationName(r.destination)}: ${ageLabel(r).toLowerCase()}, strengths, tradeoffs and who should skip it, with sources. Book online or get a quote from Brendan.`,
    alternates: { canonical: `/resorts/${r.id}` },
  };
}

const PRIORITY_ORDER: Priority[] = ['beach', 'food', 'pools', 'rooms', 'nightlife', 'value', 'family'];

function YesNo({ v, yes = 'Yes', no = 'No' }: { v: boolean | null; yes?: string; no?: string }) {
  return <>{v === null ? 'Not confirmed' : v ? yes : no}</>;
}

export default async function ResortPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = getResortRecord(id);
  if (!r) notFound();

  if (r.status !== 'active') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-extrabold text-gray-900">{r.name}</h1>
        <p className="mt-3 text-gray-700">We are not recommending this resort right now. {r.hiddenReason}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href={quizHref({ destination: r.destination })} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-700 px-6 font-bold text-white">
            Find a resort in {destinationName(r.destination)}
          </Link>
          <Link href={quoteHref({ destination: r.destination, from: 'resort-hidden' })} className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-brand-700 px-6 font-bold text-brand-800">
            Get a Quote from Brendan
          </Link>
        </div>
      </div>
    );
  }

  const profile = describeResort(r);
  const transfer = transferLabel(r);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <Stay22Guard />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-600">
        <Link href="/resorts" className="underline hover:text-gray-900">Resorts</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span>{destinationName(r.destination)}</span>
      </nav>

      <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">{r.name}</h1>
      <p className="mt-2 font-semibold text-gray-700">
        {destinationName(r.destination)} · {ageLabel(r)} · All-inclusive
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl">
        <ResortVisual resort={r} className="h-40 sm:h-56" />
      </div>

      <p className="mt-6 text-lg leading-relaxed text-gray-800">{r.summary}</p>
      <p className="mt-2 text-xs text-gray-500">VacationPro editorial summary{r.visitStatus === 'visited' ? ', from a personal visit' : ''}.</p>

      <div className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-gray-200">
        <h2 className="text-lg font-extrabold text-gray-900">Ready to look at dates?</h2>
        <div className="mt-4">
          <BookingActions
            bookHref={resortBookHref(r, 'resort-page')}
            quoteHref={quoteHref({ resortId: r.id, from: 'resort-page' })}
            placement="resort-page"
            resortId={r.id}
          />
        </div>
        <p className="mt-4 text-sm text-gray-700">
          Not sure it is right for you?{' '}
          <Link href={quizHref({ resortId: r.id, destination: r.destination, from: 'resort-page' })} className="font-bold text-brand-800 underline">
            See how it fits your trip
          </Link>
        </p>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="Fit">
        <div className="rounded-2xl bg-gray-50 p-5">
          <h2 className="font-extrabold text-gray-900">Strengths</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-800">
            {profile.strengths.length ? profile.strengths.map((s) => <li key={s}>{s}</li>) : <li>No standout ratings on file yet.</li>}
          </ul>
        </div>
        <div className="rounded-2xl bg-gray-50 p-5">
          <h2 className="font-extrabold text-gray-900">Tradeoffs</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-800">
            {profile.tradeoffs.length ? profile.tradeoffs.map((s) => <li key={s}>{s}</li>) : <li>No major tradeoff on file. Ask for current guest feedback.</li>}
          </ul>
        </div>
        <div className="rounded-2xl bg-gray-50 p-5">
          <h2 className="font-extrabold text-gray-900">Best for</h2>
          <p className="mt-2 text-gray-800">{profile.bestFor}.</p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-5">
          <h2 className="font-extrabold text-gray-900">Skip it if</h2>
          <p className="mt-2 text-gray-800">{profile.skipIf}</p>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="facts">
        <h2 id="facts" className="text-xl font-extrabold text-gray-900">The facts</h2>
        <dl className="mt-3 divide-y divide-gray-100 rounded-2xl bg-white ring-1 ring-gray-200">
          {[
            ['Age policy', ageLabel(r)],
            ['Airport transfer', transfer ?? 'Not confirmed'],
            ['Rooms', r.roomCount ? `About ${r.roomCount.toLocaleString('en-US')}` : 'Not confirmed'],
            ['Restaurants', r.restaurantsCount ? String(r.restaurantsCount) : 'Not confirmed'],
            ['Kids club', r.adultsOnly ? 'Not applicable' : null],
            ['Water park or splash area', r.adultsOnly ? 'Not applicable' : null],
            ['Beach swimming', r.beach.swimmable === null ? 'Not confirmed' : r.beach.swimmable === 'yes' ? 'Good for swimming' : r.beach.swimmable === 'mixed' ? 'Varies' : 'Not good for swimming'],
          ].map(([k, v]) => (
            <div key={k as string} className="flex justify-between gap-4 px-4 py-3 text-sm">
              <dt className="font-semibold text-gray-700">{k}</dt>
              <dd className="text-right text-gray-900">
                {v ?? (k === 'Kids club' ? <YesNo v={r.hasKidsClub} /> : <YesNo v={r.hasWaterPark} />)}
              </dd>
            </div>
          ))}
        </dl>
        {r.beach.notes && <p className="mt-2 text-sm text-gray-700">Beach: {r.beach.notes}</p>}

        {(r.inclusions.length > 0 || r.exclusions.length > 0) && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {r.inclusions.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900">Notable inclusions</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-gray-800">{r.inclusions.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            )}
            {r.exclusions.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900">Important exclusions</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-gray-800">{r.exclusions.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="mt-8" aria-labelledby="ratings">
        <h2 id="ratings" className="text-xl font-extrabold text-gray-900">VacationPro ratings</h2>
        <p className="mt-1 text-sm text-gray-600">Our editorial assessment{r.editorialReviewedAt ? `, last reviewed ${r.editorialReviewedAt}` : ', provisional'}. Not a guest review score.</p>
        <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRIORITY_ORDER.filter((p) => !(p === 'family' && r.adultsOnly)).map((p) => (
            <div key={p} className="rounded-xl bg-gray-50 p-3">
              <dt className="text-xs font-bold uppercase tracking-wide text-gray-600">{PRIORITY_LABELS[p]}</dt>
              <dd className="mt-1 font-semibold text-gray-900">{ratingWord(r.ratings[p])}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-8" aria-labelledby="price">
        <h2 id="price" className="text-xl font-extrabold text-gray-900">Price context</h2>
        {r.price ? (
          <p className="mt-2 text-gray-800">
            Reference rate: about {r.price.currency} {r.price.amount.toLocaleString('en-US')} for {r.price.nights} nights, {r.price.occupancy},{' '}
            {r.price.travelDates}, {r.price.basis}. {r.price.includes} Checked {r.price.checkedAt} by {r.price.source}. Rates change, so check current rates.
          </p>
        ) : (
          <p className="mt-2 text-gray-800">{PRICE_TIER_LABELS[r.priceTier]} for the area (our estimate). Check current rates.</p>
        )}
      </section>

      <section className="mt-8" aria-labelledby="rooms">
        <h2 id="rooms" className="text-xl font-extrabold text-gray-900">Choosing a room</h2>
        <p className="mt-2 text-gray-800">
          Entry-level rooms usually share the same inclusions. Higher categories can add views, swim-up access, or club-level perks, so ask what each
          category includes before paying more. Families should check each category&apos;s maximum occupancy.
        </p>
      </section>

      <section className="mt-8 rounded-2xl bg-gray-50 p-5 text-sm text-gray-700" aria-labelledby="sources">
        <h2 id="sources" className="font-extrabold text-gray-900">Sources</h2>
        <p className="mt-1">Facts checked {r.factsCheckedAt ?? 'date not recorded'}. Anything marked not confirmed is something to ask about before booking.</p>
        {r.sources.length > 0 && (
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {r.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} rel="nofollow noopener" target="_blank" className="underline">{s.label}</a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-10">
        <BookingActions
          bookHref={resortBookHref(r, 'resort-page-footer')}
          quoteHref={quoteHref({ resortId: r.id, from: 'resort-page' })}
          placement="resort-page-footer"
          resortId={r.id}
          compact
        />
      </div>
    </article>
  );
}
