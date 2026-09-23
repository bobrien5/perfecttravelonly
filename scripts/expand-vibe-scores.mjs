/**
 * expand-vibe-scores.mjs
 *
 * The 24 seeded resorts score 5 vibes each. The engine defines 19, and
 * scoreResort awards `+6 * (vibeScores[v] ?? 0) / 3` per vibe the traveler
 * picked, so an unscored vibe contributes nothing. A traveler choosing
 * familysuites (scored on 0 of 24) or snorkeling (1 of 24) currently gets no
 * differentiation whatsoever.
 *
 * This fills the gaps that follow necessarily from facts already recorded on
 * each resort, and leaves everything else alone for research. It never
 * overwrites an existing score: a hand-set value always wins.
 *
 * Derivations, and why each is safe:
 *
 *   adultsOnly        -> kids, kidsclub, waterpark, familysuites = 0
 *                        Not a judgement. An adults-only resort cannot serve
 *                        children, so these are 0 by definition.
 *   styles.familyresort -> kids >= 2, familysuites >= 2
 *                        The style flag is the claim; this makes it legible
 *                        to the scorer.
 *   styles.beachfront -> beach >= 2
 *   styles.nearnightlife -> nightlife >= 2
 *   styles.luxuryresort -> luxury >= 2
 *   styles.boutique   -> seclusion >= 1, mega-scale unlikely
 *   allInclusive      -> food >= 2
 *                        All-inclusive means dining is included and on site,
 *                        which is what the food vibe measures for these.
 *   priceBand 1       -> value 3, luxury <= 1
 *   priceBand 3       -> value <= 1
 *                        Price band is recorded fact, and value is its inverse.
 *
 * Everything not derivable stays undefined and is reported, so the remaining
 * work is explicit rather than silently guessed.
 *
 * Usage:
 *   node scripts/expand-vibe-scores.mjs         # report only
 *   node scripts/expand-vibe-scores.mjs --write # rewrite seed-resorts-data.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { RESORTS } from './seed-resorts-data.mjs';

const ALL_VIBES = [
  'beach', 'pool', 'luxury', 'value', 'food', 'nightlife', 'romantic',
  'snorkeling', 'nature', 'relaxing', 'entertainment', 'explore',
  'kids', 'kidsclub', 'waterpark', 'easytravel', 'familysuites',
  'privatepools', 'seclusion',
];

/** Raise a score to at least `n`, never lowering a hand-set value. */
function atLeast(v, key, n) {
  if (v[key] === undefined) v[key] = n;
}
/** Cap a score at `n`, only when already set above it or unset. */
function atMost(v, key, n) {
  if (v[key] === undefined || v[key] > n) v[key] = n;
}

/**
 * Vibes that describe WHERE a resort is rather than what it is. A hotel cannot
 * change the reef offshore, the nature around it, what is walkable nearby, or
 * how far it sits from an airport. These inherit from the destination profile
 * the engine already maintains, and any resort that genuinely differs can
 * override by having its own value set.
 */
const LOCATION_VIBES = ['snorkeling', 'nature', 'explore', 'easytravel'];

export function derive(resort, destinationVibes = {}) {
  const v = { ...resort.vibeScores };
  const styles = resort.styles ?? [];

  for (const k of LOCATION_VIBES) {
    if (v[k] === undefined && destinationVibes[k] !== undefined) v[k] = destinationVibes[k];
  }

  if (resort.adultsOnly) {
    for (const k of ['kids', 'kidsclub', 'waterpark', 'familysuites']) v[k] = 0;
  }
  if (styles.includes('familyresort')) {
    atLeast(v, 'kids', 2);
    atLeast(v, 'familysuites', 2);
  }
  if (styles.includes('beachfront')) atLeast(v, 'beach', 2);
  if (styles.includes('nearnightlife')) atLeast(v, 'nightlife', 2);
  if (styles.includes('luxuryresort')) atLeast(v, 'luxury', 2);
  if (styles.includes('boutique')) atLeast(v, 'seclusion', 1);
  if (resort.allInclusive) atLeast(v, 'food', 2);

  if (resort.priceBand === 1) {
    atLeast(v, 'value', 3);
    atMost(v, 'luxury', 1);
  }
  if (resort.priceBand === 3) atMost(v, 'value', 1);

  return v;
}

/**
 * Read destination vibe profiles straight out of the engine's TypeScript
 * source. Node cannot import a .ts module, and adding a build step for one
 * lookup table is not worth it; the shape is a stable object literal.
 */
function readDestinationVibes() {
  const src = readFileSync(
    new URL('../packages/engine/src/match/destinations.ts', import.meta.url),
    'utf8'
  );
  const out = {};
  const re = /slug: '([a-z-]+)',[\s\S]*?vibes: \{([^}]*)\}/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const vibes = {};
    for (const pair of m[2].split(',')) {
      const [k, v] = pair.split(':').map((x) => x && x.trim());
      if (k && v !== undefined) vibes[k] = Number(v);
    }
    out[m[1]] = vibes;
  }
  return out;
}

const destVibes = readDestinationVibes();

const rows = RESORTS.map((r) => {
  const before = Object.keys(r.vibeScores ?? {}).length;
  const after = derive(r, destVibes[r.destinationSlug] ?? {});
  const missing = ALL_VIBES.filter((k) => after[k] === undefined);
  return { r, before, afterCount: Object.keys(after).length, missing, after };
});

const totalBefore = rows.reduce((a, x) => a + x.before, 0);
const totalAfter = rows.reduce((a, x) => a + x.afterCount, 0);
const cap = RESORTS.length * ALL_VIBES.length;

console.log(`Vibe coverage: ${totalBefore}/${cap} -> ${totalAfter}/${cap} (+${totalAfter - totalBefore} derived)`);
console.log(`Still needing research: ${cap - totalAfter} scores across ${rows.filter((x) => x.missing.length).length} resorts\n`);

const byVibe = {};
for (const { missing } of rows) for (const m of missing) byVibe[m] = (byVibe[m] ?? 0) + 1;
console.log('Vibes still unscored, by how many resorts:');
for (const [k, n] of Object.entries(byVibe).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(14)} ${String(n).padStart(2)}/${RESORTS.length}`);
}

if (process.argv.includes('--write')) {
  const path = new URL('./seed-resorts-data.mjs', import.meta.url);
  let src = readFileSync(path, 'utf8');
  for (const { r, after } of rows) {
    const ordered = ALL_VIBES.filter((k) => after[k] !== undefined)
      .map((k) => `${k}: ${after[k]}`)
      .join(', ');
    const re = new RegExp(`(slug: '${r.slug}',[\\s\\S]*?vibeScores: )\\{[^}]*\\}`);
    if (!re.test(src)) { console.error(`  could not locate ${r.slug}`); continue; }
    src = src.replace(re, `$1{ ${ordered} }`);
  }
  writeFileSync(path, src);
  console.log('\nseed-resorts-data.mjs rewritten.');
} else {
  console.log('\nReport only. Re-run with --write to apply.');
}
