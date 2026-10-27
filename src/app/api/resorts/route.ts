import { NextRequest, NextResponse } from 'next/server';
import { getResortRecord, normalizeDestination, resortsForDestination } from '@/lib/resorts/catalog';

/**
 * GET /api/resorts?destination=cancun  → resorts in a destination (id, name)
 * GET /api/resorts?ids=a,b             → names for specific ids
 * Used by the quote form so the browser never loads the whole catalog.
 */
export async function GET(req: NextRequest) {
  const destination = normalizeDestination(req.nextUrl.searchParams.get('destination'));
  const ids = (req.nextUrl.searchParams.get('ids') ?? '').split(',').filter(Boolean).slice(0, 10);
  if (destination) {
    const list = resortsForDestination(destination)
      .map((r) => ({ id: r.id, name: r.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({ resorts: list }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
  }
  if (ids.length) {
    const list = ids
      .map((id) => getResortRecord(id))
      .filter((r) => r && r.status === 'active')
      .map((r) => ({ id: r!.id, name: r!.name, destination: r!.destination }));
    return NextResponse.json({ resorts: list });
  }
  return NextResponse.json({ resorts: [] });
}
