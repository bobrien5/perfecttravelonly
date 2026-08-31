import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

const sql = readFileSync('sql/trip_hub.sql', 'utf8');

describe('trip_hub.sql conventions', () => {
  it('enables RLS on every created table', () => {
    const tables = [...sql.matchAll(/create table if not exists (\w+)/gi)].map(m => m[1]);
    expect(tables.sort()).toEqual(['profiles', 'trip_alerts', 'trips']);
    for (const t of tables) expect(sql).toMatch(new RegExp(`alter table ${t} enable row level security`, 'i'));
  });
  it('uses select auth.uid() ownership predicates and TO authenticated', () => {
    expect(sql.match(/to authenticated/gi)!.length).toBeGreaterThanOrEqual(8);
    expect(sql).toMatch(/\(select auth\.uid\(\)\)/);
    expect(sql).not.toMatch(/auth\.role\(\)/);
  });
  it('update policies carry with check and no em dashes exist', () => {
    expect(sql.match(/with check/gi)!.length).toBeGreaterThanOrEqual(2);
    expect(sql).not.toMatch(/[–—]/);
  });
});
