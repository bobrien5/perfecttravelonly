import { NextRequest, NextResponse } from 'next/server';
import { contacts, GHLError } from '@/lib/ghl';

/**
 * GET /api/ghl/contacts?query=...&email=...&limit=...
 * Search / list contacts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await contacts.search({
      query: searchParams.get('query') || undefined,
      email: searchParams.get('email') || undefined,
      phone: searchParams.get('phone') || undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GHLError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/ghl/contacts
 * Create or upsert a contact
 *
 * Body: { ...contactFields, upsert?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { upsert, ...contactData } = body;

    const result = upsert
      ? await contacts.upsert(contactData)
      : await contacts.create(contactData);

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof GHLError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
