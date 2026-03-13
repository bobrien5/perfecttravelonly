import { NextResponse } from 'next/server';
import { pipelines, GHLError } from '@/lib/ghl';

/**
 * GET /api/ghl/pipelines
 * List all pipelines and their stages
 */
export async function GET() {
  try {
    const result = await pipelines.getAll();
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
