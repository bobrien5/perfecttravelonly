import { NextRequest, NextResponse } from 'next/server';
import { findByKeyword } from '@/lib/deal-registry';
import { normalizeKeyword } from '@/lib/deal-registry/helpers';
import { buildResolveResponse } from './utils';

// Hardcoded fallback is an intentional production safety net: if NEXT_PUBLIC_SITE_URL
// is somehow unset in prod, the funnel still points at the canonical domain.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vacationpro.co';

const MAX_KEYWORD_LENGTH = 64;

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('keyword');
  if (!raw) {
    return NextResponse.json({ error: 'keyword query param is required' }, { status: 400 });
  }
  if (raw.length > MAX_KEYWORD_LENGTH) {
    return NextResponse.json({ error: 'keyword is too long' }, { status: 400 });
  }
  try {
    const keyword = normalizeKeyword(raw);
    const deal = await findByKeyword(keyword);
    return NextResponse.json(buildResolveResponse(deal, SITE_URL, keyword));
  } catch (err) {
    console.error('resolve error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
