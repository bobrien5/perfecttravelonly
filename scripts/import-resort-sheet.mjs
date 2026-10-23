/**
 * import-resort-sheet.mjs
 *
 * Pulls the DATA tab of the community "All Inclusive Resort Ratings" sheet
 * (shared by Brendan 2026-10-23) and writes data/resort-sheet.json with the
 * factual columns VacationPro uses. Price and value-ratio columns are never
 * read: Brendan decided on 2026-10-23 not to use the sheet's prices.
 *
 * The DATA tab is hidden, so it has no public tab id, and Google's quick CSV
 * endpoint drops rows. The full xlsx export is read instead, with Node's
 * built-in zlib (an xlsx file is a zip of XML documents). No dependencies.
 *
 * Run: node scripts/import-resort-sheet.mjs
 * Then: node scripts/build-resort-catalog.mjs
 */
import { writeFileSync } from 'fs';
import { inflateRawSync } from 'zlib';

const SHEET_ID = '1XMiFiugIXzjZaU3bBD4Y2dfwpN9MZLImsMAANEWzc-w';
const URL_XLSX = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=xlsx`;

/** Minimal zip reader: entries by name, from the central directory. */
function unzip(buf) {
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error('Not a zip file');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const files = new Map();
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(p + 10);
    const size = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    const dataStart = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const raw = buf.subarray(dataStart, dataStart + size);
    files.set(name, method === 8 ? inflateRawSync(raw) : raw);
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

const decode = (s) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, '&');

const textOf = (xml) => decode([...xml.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join(''));

function readSheet(files, sheetName) {
  const wb = files.get('xl/workbook.xml').toString();
  const rels = files.get('xl/_rels/workbook.xml.rels').toString();
  const sheet = [...wb.matchAll(/<sheet\b[^>]*>/g)]
    .map((m) => m[0])
    .find((tag) => decode(/name="([^"]+)"/.exec(tag)?.[1] ?? '') === sheetName);
  if (!sheet) throw new Error(`No sheet named ${sheetName}`);
  const rid = /r:id="([^"]+)"/.exec(sheet)[1];
  const rel = [...rels.matchAll(/<Relationship\b[^>]*>/g)].map((m) => m[0]).find((tag) => tag.includes(`Id="${rid}"`));
  const path = 'xl/' + /Target="([^"]+)"/.exec(rel)[1].replace(/^\/?xl\//, '');

  const shared = [];
  const ss = files.get('xl/sharedStrings.xml')?.toString() ?? '';
  for (const si of ss.matchAll(/<si>([\s\S]*?)<\/si>/g)) shared.push(textOf(si[1]));

  const rows = [];
  for (const row of files.get(path).toString().matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = [];
    for (const c of row[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const col = [...c[1]].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;
      const type = /t="([^"]+)"/.exec(c[2])?.[1];
      const inner = c[3] ?? '';
      const v = /<v>([\s\S]*?)<\/v>/.exec(inner)?.[1];
      let value = '';
      if (type === 's' && v !== undefined) value = shared[Number(v)];
      else if (type === 'inlineStr') value = textOf(inner);
      else if (v !== undefined) value = decode(v);
      cells[col] = value;
    }
    rows.push(Array.from(cells, (x) => x ?? ''));
  }
  return rows;
}

const list = (s) => (s ? String(s).split(',').map((x) => x.trim()).filter(Boolean) : []);
const num = (s) => {
  if (s === undefined || s === null || String(s).trim() === '') return null;
  const n = Number(String(s).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
};
// Transfer time is stored as a fraction of a day (0.0681 is 1h 38m).
const minutes = (s) => {
  const n = num(s);
  return n === null || n <= 0 || n >= 1 ? null : Math.round(n * 1440);
};
const str = (s) => (s && String(s).trim() ? String(s).trim() : null);

const res = await fetch(URL_XLSX);
if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
const rows = readSheet(unzip(Buffer.from(await res.arrayBuffer())), 'DATA');
const header = rows[0].map((h) => String(h).replace(/\s+/g, ' ').trim());
const col = (name) => {
  const i = header.findIndex((h) => h.startsWith(name));
  if (i < 0) throw new Error(`Missing column ${name}`);
  return i;
};
const C = {
  name: col('Resort'),
  rating: col('Avg User Rating'),
  category: col('Family'),
  reviews: col('# of Reviews'),
  hotelClass: col('Hotel Class'),
  policy: col('Deal Breakers'),
  country: col('Country'),
  area: col('Area'),
  airport: col('Airport'),
  transfer: col('To / From Airport'),
  brand: col('Hotel Brand'),
  styles: col('Hotel Style'),
  amenities: col('Amenities'),
  roomOptions: col('Special Room Options'),
  tags: col('Food, Beach, Party'),
  connecting: col('Guaranteed Connecting Rooms'),
  rooms: col('# of Rooms'),
  yearBuilt: col('Year Built'),
  yearRenovated: col('Year Renovated'),
};

const out = rows
  .slice(1)
  .filter((r) => str(r[C.name]))
  .map((r) => ({
    name: str(r[C.name]),
    category: str(r[C.category]),
    policy: list(r[C.policy]),
    country: str(r[C.country]),
    area: str(r[C.area]),
    airport: str(r[C.airport]),
    transferMinutes: minutes(r[C.transfer]),
    brand: str(r[C.brand]),
    styles: list(r[C.styles]),
    amenities: list(r[C.amenities]),
    roomOptions: list(r[C.roomOptions]),
    tags: list(r[C.tags]),
    connectingRooms: str(r[C.connecting]),
    rooms: num(r[C.rooms]),
    yearBuilt: num(r[C.yearBuilt]),
    yearRenovated: num(r[C.yearRenovated]),
    hotelClass: num(r[C.hotelClass]),
    guestRating: num(r[C.rating]),
    reviews: num(r[C.reviews]),
  }));

writeFileSync(
  'data/resort-sheet.json',
  JSON.stringify(
    {
      source: {
        label: 'All Inclusive Resort Ratings (community spreadsheet by u/TheRealGuncho)',
        url: `https://docs.google.com/spreadsheets/d/${SHEET_ID}`,
        retrievedAt: new Date().toISOString().slice(0, 10),
        ratingNote: 'Average of TripAdvisor, Google, Costco and Expedia ratings, compiled by the sheet author.',
        note: 'Prices and value ratio intentionally not imported.',
      },
      resorts: out,
    },
    null,
    1,
  ) + '\n',
);
console.log(`Wrote ${out.length} resorts to data/resort-sheet.json`);
