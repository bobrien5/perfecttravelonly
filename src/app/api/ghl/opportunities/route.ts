import { NextRequest, NextResponse } from 'next/server';
import { opportunities, GHLError } from '@/lib/ghl';

/**
 * GET /api/ghl/opportunities?pipelineId=...&status=...&q=...
 * Search opportunities
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await opportunities.search({
      pipelineId: searchParams.get('pipelineId') || undefined,
      pipelineStageId: searchParams.get('pipelineStageId') || undefined,
      contactId: searchParams.get('contactId') || undefined,
      status: searchParams.get('status') || undefined,
      q: searchParams.get('q') || undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
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
 * POST /api/ghl/opportunities
 * Create a new opportunity
 *
 * Body: { pipelineId, pipelineStageId, contactId, name, monetaryValue?, ... }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await opportunities.create(body);
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
