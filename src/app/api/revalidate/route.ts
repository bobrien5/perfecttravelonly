import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Webhook endpoint for Sanity → Vercel revalidation
// Configure at: sanity.io/manage → your project → API → Webhooks
//
// Webhook settings:
//   URL: https://vacationpro.co/api/revalidate
//   Secret: same as SANITY_REVALIDATE_SECRET
//   Projection: {_type, slug, categorySlug, destinationSlug}
//   Trigger on: Create, Update, Delete

export async function POST(req: NextRequest) {
  try {
    // Validate webhook secret
    const secret = req.headers.get('sanity-webhook-secret') || req.nextUrl.searchParams.get('secret');
    if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    const body = await req.json();

    if (!body?._type) {
      return NextResponse.json({ message: 'Bad request' }, { status: 400 });
    }

    // Revalidate affected paths based on content type
    switch (body._type) {
      case 'deal':
        revalidatePath('/');
        if (body.categorySlug) {
          revalidatePath(`/deals/${body.categorySlug}`);
        }
        if (body.slug?.current && body.categorySlug) {
          revalidatePath(`/deals/${body.categorySlug}/${body.slug.current}`);
        }
        if (body.destinationSlug) {
          revalidatePath(`/destinations/${body.destinationSlug}`);
        }
        break;

      case 'destination':
        revalidatePath('/');
        if (body.slug?.current) {
          revalidatePath(`/destinations/${body.slug.current}`);
        }
        break;

      case 'category':
        revalidatePath('/');
        if (body.slug?.current) {
          revalidatePath(`/deals/${body.slug.current}`);
        }
        break;

      case 'blogPost':
        revalidatePath('/');
        break;

      default:
        revalidatePath('/');
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      type: body._type,
    });
  } catch (err) {
    console.error('Revalidation error:', err);
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
