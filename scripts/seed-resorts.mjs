/**
 * seed-resorts.mjs
 * Upserts the 24 seed resorts (scripts/seed-resorts-data.mjs) into Sanity as
 * `resort` documents, one per RESORTS entry, id = 'resort-' + slug.
 * Idempotent: uses createOrReplace, so re-running just overwrites the same docs.
 *
 * This script does NOT run itself. It prints usage and exits unless invoked
 * with --go, matching the env-loading pattern in scripts/vp-publish-live.mjs.
 *
 * Usage:
 *   node scripts/seed-resorts.mjs          # prints what it would do, does nothing
 *   node scripts/seed-resorts.mjs --go      # writes all 24 resort docs to Sanity
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { RESORTS } from './seed-resorts-data.mjs';

const ENV_PATH = new URL('../.env.local', import.meta.url);

function loadEnv() {
  const text = readFileSync(ENV_PATH, 'utf8');
  return Object.fromEntries(
    text
      .split('\n')
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
      })
  );
}

function toResortDoc(r) {
  return {
    _id: `resort-${r.slug}`,
    _type: 'resort',
    name: r.name,
    slug: { _type: 'slug', current: r.slug },
    destinationSlug: r.destinationSlug,
    priceBand: r.priceBand,
    styles: r.styles,
    vibeScores: JSON.stringify(r.vibeScores),
    adultsOnly: r.adultsOnly,
    allInclusive: r.allInclusive,
    verdict: r.verdict,
    expediaUrl: r.expediaUrl,
    heroImageUrl: r.heroImageUrl || undefined,
  };
}

async function run() {
  const go = process.argv.includes('--go');

  if (!go) {
    console.log(`This will createOrReplace ${RESORTS.length} 'resort' documents in Sanity`);
    console.log('(6 each for aruba, punta-cana, cancun, riviera-maya).');
    console.log('It is idempotent: re-running overwrites the same _id values, no duplicates.');
    console.log('');
    console.log('To run for real: node scripts/seed-resorts.mjs --go');
    return;
  }

  const env = loadEnv();
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2026-03-09',
    useCdn: false,
    token: env.SANITY_API_WRITE_TOKEN,
  });

  for (const r of RESORTS) {
    const doc = toResortDoc(r);
    await client.createOrReplace(doc);
    console.log(`wrote ${doc._id}`);
  }
  console.log(`Done. Wrote ${RESORTS.length} resort documents.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
