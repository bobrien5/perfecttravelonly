import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

interface CheckoutRequest {
  contactId?: string;
  email: string;
  firstName: string;
  lastName: string;
  destination: string;
  opportunityId?: string;
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Set STRIPE_SECRET_KEY in Vercel.' },
      { status: 500 }
    );
  }

  let body: Partial<CheckoutRequest>;
  try {
    body = (await req.json()) as Partial<CheckoutRequest>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.email?.trim()) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const stripe = new Stripe(secret);

  const origin =
    req.headers.get('origin') ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://www.vacationpro.co';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: body.email.trim().toLowerCase(),
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 9900,
            product_data: {
              name: 'VacationPro Concierge Planning',
              description:
                'Custom trip plan: resort and flight comparison, full itinerary, and 1:1 travel advisor time.',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        contactId: body.contactId || '',
        opportunityId: body.opportunityId || '',
        firstName: body.firstName || '',
        lastName: body.lastName || '',
        destination: body.destination || '',
        source: 'concierge-planning',
      },
      success_url: `${origin}/concierge-planning/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/concierge-planning?canceled=1#plan-my-trip`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Stripe did not return a checkout URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    console.error('Concierge checkout error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
