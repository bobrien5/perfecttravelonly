import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { initialTripAnswers } from '@vacationpro/engine';
import { ACTIVE_RESORTS, DESTINATIONS, RESORT_CATALOG, getResortRecord } from '@/lib/resorts/catalog';

describe('generated catalog', () => {
  it('has unique ids and every active resort belongs to a listed destination', () => {
    const ids = RESORT_CATALOG.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    const slugs = new Set(DESTINATIONS.map((d) => d.slug));
    for (const r of ACTIVE_RESORTS) expect(slugs.has(r.destination)).toBe(true);
    expect(ACTIVE_RESORTS.length).toBeGreaterThan(500);
  });

  it('carries no prices from the community sheet', () => {
    expect(RESORT_CATALOG.every((r) => r.price === null)).toBe(true);
    const raw = readFileSync('data/resort-sheet.json', 'utf8');
    expect(raw).not.toMatch(/Direct USD|Direct CAD|Value Ratio|directUsd/);
  });

  it('only recommends open, all-inclusive resorts in scope', () => {
    for (const r of ACTIVE_RESORTS) {
      expect(r.allInclusive).toBe(true);
      expect(['Cuba', 'Haiti', 'Costa Rica', 'Brazil', 'Colombia']).not.toContain(r.country);
    }
    expect(getResortRecord('hard-rock-hotel-cancun')?.status).toBe('hidden');
  });

  it('keeps researched resorts and their editorial ratings', () => {
    const r = getResortRecord('le-blanc-spa-resort-cancun')!;
    expect(r.origin).toBe('curated');
    expect(r.ratingSource).toBe('vacationpro');
    expect(r.guestRating?.score).toBeGreaterThan(80);
    expect(RESORT_CATALOG.filter((x) => x.origin === 'curated')).toHaveLength(32);
  });
});

describe('recommendations API', () => {
  it('returns picks from the full catalog, including sheet resorts', async () => {
    const { POST } = await import('@/app/api/recommendations/route');
    const answers = { ...initialTripAnswers(), entry: 'known', destination: 'jamaica-negril', party: 'couple', adultsOnly: 'either', atmosphere: 'quiet', priorities: ['beach', 'food'], dates: { mode: 'flexible', month: null, nights: 5 } };
    const res = await POST(new NextRequest('https://x.test/api/recommendations', { method: 'POST', body: JSON.stringify({ answers }) }));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.recommendations.length).toBeGreaterThan(0);
    expect(data.recommendations.every((r: { resort: { destination: string } }) => r.resort.destination === 'jamaica-negril')).toBe(true);
  });

  it('rejects malformed answers', async () => {
    const { POST } = await import('@/app/api/recommendations/route');
    const res = await POST(new NextRequest('https://x.test/api/recommendations', { method: 'POST', body: JSON.stringify({ answers: { version: 1 } }) }));
    expect(res.status).toBe(400);
  });
});

describe('browser bundle', () => {
  it('no client component imports the full catalog', () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const f of readdirSync(dir)) {
        const p = path.join(dir, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(tsx?|jsx?)$/.test(f)) {
          const src = readFileSync(p, 'utf8');
          if (/^['"]use client['"]/m.test(src) && /@\/lib\/resorts\/(catalog|recommend)['"]|catalog\.generated/.test(src.replace(/import type[^;]+;/g, ''))) offenders.push(p);
        }
      }
    };
    walk('src');
    expect(offenders).toEqual([]);
  });
});

describe('server-safe imports', () => {
  it('server and shared modules never import values from a use client file', () => {
    // A value imported from a 'use client' module becomes a client reference
    // on the server (this broke the Stay22 aid once). Only components may.
    const files = ['src/lib/monetization/stay22.ts', 'src/lib/monetization/stay22-account.ts', 'src/lib/resorts/links.ts', 'src/lib/resorts/meta.ts'];
    for (const f of files) {
      const src = readFileSync(f, 'utf8');
      const imports = [...src.matchAll(/from '(@\/[^']+|\.[^']+)'/g)].map((m) => m[1]);
      for (const imp of imports) {
        const base = imp.startsWith('@/') ? `src/${imp.slice(2)}` : path.join(path.dirname(f), imp);
        const file = ['.ts', '.tsx', '/index.ts'].map((ext) => base + ext).find((p) => { try { return statSync(p).isFile(); } catch { return false; } });
        if (file) expect(readFileSync(file, 'utf8')).not.toMatch(/^['"]use client['"]/m);
      }
    }
  });
});
