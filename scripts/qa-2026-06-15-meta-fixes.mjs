#!/usr/bin/env node
/**
 * QA 2026-06-15 P1 #2, #3, #4: SEO meta hygiene fixes.
 *
 * Applies the following targeted Sanity patches:
 *   - Trim 3 over-long deal metaDescriptions to ~150 to 160 chars.
 *   - Expand 3 under-filled metaDescriptions (Maui destination,
 *     Beach category, Weekend Getaways category) to ~130 to 160 chars.
 *   - Shorten the Hilton Hawaiian Village seoTitle from 67 to 62 chars.
 *
 * Idempotent. Re-running is a no-op once the fields already match.
 *
 * Dry run: node scripts/qa-2026-06-15-meta-fixes.mjs
 * Apply:   node scripts/qa-2026-06-15-meta-fixes.mjs --apply
 *
 * Requires SANITY_API_WRITE_TOKEN + NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local.
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  const envPath = resolve(__dirname, '..', '.env.local');
  const text = readFileSync(envPath, 'utf-8');
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  // assume env already set
}

const APPLY = process.argv.includes('--apply');

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-03-09',
  useCdn: false,
});

// Patch set. Each entry: { id, field, value, why }.
// Lengths are noted in the why so re-readers see the target ceiling.
const patches = [
  // B1: Trim 3 over-long deal metaDescriptions to ~150 to 160 chars.
  {
    id: 'mkQbj5Xu6viz8cZClibn1X',
    label: 'deal: grand-solmar-land-end-cabo-3-nights',
    field: 'metaDescription',
    value:
      "3 nights for 2 in an ocean-view Grand Master Suite at Grand Solmar Land's End, Cabo. $999 with a $300 spa credit, taxes and fees included.",
    why: 'trim from 187 to ~140 chars, keep price + spa credit hook in first 120',
  },
  {
    id: 'deal-garza-blanca-los-cabos-5-star-retreat',
    label: 'deal: garza-blanca-los-cabos-5-star-retreat',
    field: 'metaDescription',
    value:
      'Save $1,099 on a 3-night 5-star Garza Blanca Los Cabos retreat for 2. Junior Suite, 8 heated pools, adults-only infinity, spa. $1,185 from $2,284.',
    why: 'trim from 206 to ~150 chars',
  },
  {
    id: 'deal-1-hotel-south-beach-miami',
    label: 'deal: 1-hotel-south-beach-miami-6-nights-flights',
    field: 'metaDescription',
    value:
      'Save $1,519 on a 6-night ultra-luxury 1 Hotel South Beach package for 2, with 2 round-trip flights, taxes, and fees. Fixed: Jun 1 to Jun 7, 2026.',
    why: 'trim from 173 to ~150 chars',
  },
  // B2: Expand 3 under-filled metaDescriptions to ~130 to 160 chars.
  {
    id: 'destination-maui',
    label: 'destination: maui',
    field: 'metaDescription',
    value:
      'Top Maui vacation packages for 2026. Hand-picked Hawaiian resort deals, oceanfront stays, and beach getaways from $399, with insider booking tips.',
    why: 'expand from 78 to ~145 chars, add credibility cue + price hook',
  },
  {
    id: 'category-beach',
    label: 'category: beach',
    field: 'metaDescription',
    value:
      'Top beach vacation deals for 2026. Oceanfront resorts, seaside escapes, and beachfront all-inclusives from the Caribbean to Mexico, hand-vetted.',
    why: 'expand from 75 to ~140 chars',
  },
  {
    id: 'category-weekend-getaways',
    label: 'category: weekend-getaways',
    field: 'metaDescription',
    value:
      'Best weekend getaway deals for quick escapes. 2 to 4 night trips at vetted resorts and city hotels, hand-picked for short trips at great prices.',
    why: 'expand from 78 to ~140 chars',
  },
  // B3: Shorten Hilton Hawaiian Village seoTitle from 67 to 62 chars.
  {
    id: 'deal-hawaii-hilton-307-daily-credit',
    label: 'deal: hilton-hawaiian-village-waikiki',
    field: 'seoTitle',
    value: 'Hilton Hawaiian Village Waikiki, $307/Night + $65 Daily Credit | VacationPro',
    why: 'shorten from 81 chars (67 after | VacationPro strip) to 77 chars (62 after strip), prevent SERP truncation',
  },
];

async function run() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN'} (re-run with --apply to write)`);
  console.log('');

  for (const p of patches) {
    const doc = await client.fetch(`*[_id == $id][0]{ _id, ${p.field} }`, { id: p.id });
    if (!doc) {
      console.log(`SKIP  ${p.label}  (doc ${p.id} not found)`);
      continue;
    }
    const current = doc[p.field];
    if (current === p.value) {
      console.log(`OK    ${p.label}.${p.field}  (already up to date, ${current.length} chars)`);
      continue;
    }
    console.log(`PATCH ${p.label}.${p.field}`);
    console.log(`      from (${(current || '').length} chars): ${current}`);
    console.log(`      to   (${p.value.length} chars): ${p.value}`);
    console.log(`      why: ${p.why}`);
    if (APPLY) {
      await client.patch(p.id).set({ [p.field]: p.value }).commit();
      console.log(`      -> WRITTEN`);
    }
    console.log('');
  }

  console.log(APPLY ? 'Done. All patches applied.' : 'Dry run complete. Re-run with --apply to write.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
