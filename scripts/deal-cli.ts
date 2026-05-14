import { existsSync, readFileSync } from 'fs';
import { addKeyword, keywordExists, listActive, findByKeyword } from '../src/lib/deal-registry';
import { normalizeKeyword, validateDealEntry, parseDealSheetCsv } from '../src/lib/deal-registry/helpers';
import type { DealEntryInput } from '../src/lib/deal-registry/types';

export function parseArgs(argv: string[]): { command: string; rest: string[] } {
  if (argv.length === 0) return { command: 'help', rest: [] };
  return { command: argv[0], rest: argv.slice(1) };
}

function getFlag(flags: string[], name: string): string | undefined {
  const i = flags.indexOf(name);
  if (i < 0 || i + 1 >= flags.length) return undefined;
  const val = flags[i + 1];
  // A value that looks like another flag means this flag's value was omitted.
  if (val.startsWith('--')) return undefined;
  return val;
}

export function parseAddFlags(flags: string[]): DealEntryInput {
  const keyword = getFlag(flags, '--keyword');
  const dealSlug = getFlag(flags, '--deal-slug');
  const dealTitle = getFlag(flags, '--title');
  const destination = getFlag(flags, '--destination');
  const priceStr = getFlag(flags, '--price');
  const landingPath = getFlag(flags, '--landing-path');
  const dmCopy = getFlag(flags, '--dm-copy');
  const expiresAt = getFlag(flags, '--expires') ?? null;

  if (!keyword || !dealSlug || !dealTitle || !destination || !priceStr || !landingPath || !dmCopy) {
    throw new Error(
      'Missing required flag. Required: --keyword --deal-slug --title --destination --price --landing-path --dm-copy'
    );
  }
  const price = Number(priceStr);
  if (Number.isNaN(price)) {
    throw new Error('--price must be a numeric value (e.g. --price 720)');
  }
  return {
    keyword: normalizeKeyword(keyword),
    dealSlug,
    dealTitle,
    destination,
    price,
    landingPath,
    dmCopy,
    expiresAt,
  };
}

async function cmdAdd(rest: string[]) {
  const entry = parseAddFlags(rest);
  const err = validateDealEntry(entry);
  if (err) throw new Error(`Invalid deal: ${err}`);
  if (await keywordExists(entry.keyword)) {
    throw new Error(`Keyword "${entry.keyword}" already exists. Pick a unique keyword.`);
  }
  const created = await addKeyword(entry);
  console.log(`✓ Added ${created.keyword} → ${created.landingPath} (${created.dealTitle})`);
}

async function cmdList() {
  const deals = await listActive();
  if (deals.length === 0) {
    console.log('No active deal keywords.');
    return;
  }
  console.log(`${deals.length} active deal keywords:`);
  for (const d of deals) {
    console.log(`  ${d.keyword.padEnd(16)} $${String(d.price).padEnd(6)} ${d.landingPath.padEnd(20)} ${d.dealTitle}`);
  }
}

async function cmdStatus(rest: string[]) {
  const keyword = rest[0] ? normalizeKeyword(rest[0]) : '';
  if (!keyword) throw new Error('Usage: deal status <KEYWORD>');
  const found = await findByKeyword(keyword);
  if (!found) {
    console.log(`Keyword "${keyword}" not found among active deals.`);
    return;
  }
  console.log(JSON.stringify(found, null, 2));
}

async function cmdSync(rest: string[]) {
  const csvPath = rest[0];
  if (!csvPath) throw new Error('Usage: deal sync <path-to-deal-sheet.csv>');
  if (!existsSync(csvPath)) throw new Error(`File not found: ${csvPath}`);
  const csv = readFileSync(csvPath, 'utf8');
  const entries = parseDealSheetCsv(csv);
  let added = 0;
  let skipped = 0;
  for (const entry of entries) {
    const err = validateDealEntry(entry);
    if (err) {
      console.log(`  ✗ ${entry.keyword || '(blank)'}: ${err}`);
      skipped++;
      continue;
    }
    if (await keywordExists(entry.keyword)) {
      console.log(`  - ${entry.keyword}: already exists, skipped`);
      skipped++;
      continue;
    }
    await addKeyword(entry);
    console.log(`  ✓ ${entry.keyword} → ${entry.landingPath}`);
    added++;
  }
  console.log(`\nSync complete: ${added} added, ${skipped} skipped.`);
}

function cmdHelp() {
  console.log(`vacationpro deal — deal keyword registry CLI

Usage:
  npm run deal add --keyword <KW> --deal-slug <slug> --title <title> \\
    --destination <dest> --price <n> --landing-path </d/kw> --dm-copy <text> [--expires YYYY-MM-DD]
  npm run deal list
  npm run deal status <KEYWORD>
  npm run deal sync <path-to-deal-sheet.csv>
`);
}

async function main() {
  const { command, rest } = parseArgs(process.argv.slice(2));
  switch (command) {
    case 'add': return cmdAdd(rest);
    case 'list': return cmdList();
    case 'status': return cmdStatus(rest);
    case 'sync': return cmdSync(rest);
    default: return cmdHelp();
  }
}

// Only run main when executed directly, not when imported by tests.
if (process.argv[1] && process.argv[1].endsWith('deal-cli.ts')) {
  main().catch((e) => {
    console.error(`Error: ${e instanceof Error ? e.message : e}`);
    process.exit(1);
  });
}
