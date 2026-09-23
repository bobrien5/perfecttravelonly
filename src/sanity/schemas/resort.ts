/* eslint-disable @typescript-eslint/no-explicit-any */
// vibeScores is stored as a stringified JSON text field rather than a Sanity
// object-of-numbers field. Rationale: the Vibe key set (19 values, see
// packages/engine/src/match/types.ts) can grow without a schema migration this
// way, the seed data already produces a plain JS object that round-trips through
// JSON.stringify/JSON.parse cleanly, and the match engine only ever needs the
// whole map at once (never a single vibe field queried in isolation via GROQ).
const resort = {
  name: 'resort',
  title: 'Resort',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: (r: any) => r.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name', maxLength: 96 }, validation: (r: any) => r.required() },
    { name: 'destinationSlug', title: 'Destination Slug', type: 'string', description: 'Matches destination.slug.current (e.g. aruba, punta-cana, cancun, riviera-maya)', validation: (r: any) => r.required() },
    { name: 'priceBand', title: 'Price Band', type: 'number', options: { list: [1, 2, 3] }, validation: (r: any) => r.required().min(1).max(3) },
    {
      name: 'styles',
      title: 'Styles',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: ['allinclusive', 'luxuryresort', 'boutique', 'beachfront', 'adultsonly', 'familyresort', 'nearnightlife'],
      },
      validation: (r: any) => r.required().min(1),
    },
    {
      name: 'vibeScores',
      title: 'Vibe Scores (JSON)',
      type: 'text',
      rows: 3,
      description: 'Stringified JSON object of Vibe key -> 0-3 score, e.g. {"beach":3,"luxury":2}. See packages/engine/src/match/types.ts for valid keys.',
      validation: (r: any) => r.required(),
    },
    { name: 'adultsOnly', title: 'Adults Only', type: 'boolean', initialValue: false },
    { name: 'allInclusive', title: 'All Inclusive', type: 'boolean', initialValue: false },
    { name: 'verdict', title: 'Verdict', type: 'text', rows: 3, description: '1-2 sentences, traveler-facing, no em/en dashes', validation: (r: any) => r.required() },
    { name: 'expediaUrl', title: 'Expedia URL', type: 'url', validation: (r: any) => r.required() },
    {
      name: 'heroImageAsset',
      title: 'Hero Image (upload)',
      type: 'image',
      options: { hotspot: true },
      description: 'Upload an image here. Preferred over the URL field below, which is kept only so existing content keeps working.',
    },
    { name: 'heroImageUrl', title: 'Hero Image URL', type: 'url' },
  ],
  preview: {
    select: { title: 'name', subtitle: 'destinationSlug' },
  },
};
export default resort;
