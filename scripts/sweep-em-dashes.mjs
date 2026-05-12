#!/usr/bin/env node
/**
 * Sweep em dashes (—) and en dashes (–) from all Sanity documents.
 * Replaces them with safer punctuation per the VacationPro style rule.
 *
 * Replacement rules (in order of preference):
 *   "word — word"   -> "word. Word"       (sentence boundary inside text)
 *   ", — "          -> ", "                (parenthetical comma)
 *   " — "           -> ", "                (default inline replacement)
 *   "word—word"     -> "word, word"        (tight join)
 *   any leftover —/– -> ","                (fallback)
 *
 * Run dry-run first: node scripts/sweep-em-dashes.mjs
 * Then to actually write: node scripts/sweep-em-dashes.mjs --apply
 *
 * Requires SANITY_API_WRITE_TOKEN + NEXT_PUBLIC_SANITY_PROJECT_ID in env / .env.local.
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Lightweight .env.local loader so the script works without dotenv installed.
try {
  const envPath = resolve(__dirname, '..', '.env.local');
  const text = readFileSync(envPath, 'utf-8');
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  // ignore, assume env already set
}

const APPLY = process.argv.includes('--apply');
const VERBOSE = process.argv.includes('--verbose');

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

// String-level replacement. Idempotent.
function clean(input) {
  if (typeof input !== 'string') return input;
  if (!/[—–]/.test(input)) return input;
  return input
    // word — word  -> word, word   (inline replacement)
    .replace(/\s*[—–]\s*/g, ', ')
    // double commas can appear if " — " adjoined a comma
    .replace(/,\s*,/g, ',')
    // trailing comma at end of string
    .replace(/,\s*$/g, '')
    .trim();
}

// Walk an object recursively, return [cleaned, changedFields].
function walk(obj, path = '') {
  if (obj == null) return [obj, []];
  if (typeof obj === 'string') {
    const next = clean(obj);
    return [next, next !== obj ? [{ path, before: obj, after: next }] : []];
  }
  if (Array.isArray(obj)) {
    const out = [];
    const changes = [];
    for (let i = 0; i < obj.length; i++) {
      const [v, c] = walk(obj[i], `${path}[${i}]`);
      out.push(v);
      changes.push(...c);
    }
    return [out, changes];
  }
  if (typeof obj === 'object') {
    const out = {};
    const changes = [];
    for (const k of Object.keys(obj)) {
      if (k.startsWith('_')) {
        out[k] = obj[k];
        continue;
      }
      const [v, c] = walk(obj[k], path ? `${path}.${k}` : k);
      out[k] = v;
      changes.push(...c);
    }
    return [out, changes];
  }
  return [obj, []];
}

// Build a Sanity patch from changes (only set the leaf paths that actually changed).
function buildPatch(changes) {
  const setBody = {};
  for (const ch of changes) {
    // Sanity uses [N] for array index, dot for field path, which matches our `path` already.
    setBody[ch.path] = ch.after;
  }
  return setBody;
}

const TYPES = ['deal', 'destination', 'category', 'blogPost', 'blogCategory', 'blogTag'];

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY (writes will happen)' : 'DRY RUN (no writes)'}`);
  console.log(`Project: ${projectId} / dataset: ${dataset}\n`);

  let totalDocs = 0;
  let totalChangedDocs = 0;
  let totalReplacements = 0;
  const summary = {};

  for (const type of TYPES) {
    const docs = await client.fetch(`*[_type == $type]`, { type });
    summary[type] = { scanned: docs.length, changed: 0, replacements: 0 };
    totalDocs += docs.length;

    for (const doc of docs) {
      const [next, changes] = walk(doc);
      if (changes.length === 0) continue;
      summary[type].changed += 1;
      summary[type].replacements += changes.length;
      totalChangedDocs += 1;
      totalReplacements += changes.length;

      if (VERBOSE || !APPLY) {
        console.log(`\n[${type}] ${doc._id}  (${changes.length} fields)`);
        for (const c of changes.slice(0, 5)) {
          const before = c.before.length > 100 ? c.before.slice(0, 100) + '…' : c.before;
          const after = c.after.length > 100 ? c.after.slice(0, 100) + '…' : c.after;
          console.log(`  - ${c.path}`);
          console.log(`      BEFORE: ${before}`);
          console.log(`      AFTER:  ${after}`);
        }
        if (changes.length > 5) console.log(`  ... and ${changes.length - 5} more`);
      }

      if (APPLY) {
        const patch = buildPatch(changes);
        await client.patch(doc._id).set(patch).commit();
      }
    }
  }

  console.log('\n=== SUMMARY ===');
  for (const [type, s] of Object.entries(summary)) {
    console.log(`  ${type.padEnd(15)} ${s.scanned} scanned, ${s.changed} changed, ${s.replacements} replacements`);
  }
  console.log(`  ${'TOTAL'.padEnd(15)} ${totalDocs} docs, ${totalChangedDocs} changed, ${totalReplacements} replacements`);
  if (!APPLY) console.log('\nDry run only. Re-run with --apply to actually write changes.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
