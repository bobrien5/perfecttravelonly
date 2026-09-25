import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerUser, createServerSupabase } from '@/lib/supabase/server';

/**
 * POST /api/stripe/portal
 *
 * Opens Stripe's hosted customer portal for the signed-in member, which
 * handles cancel, card update and invoice history. Using the hosted portal
 * means there is no billing UI to build or keep correct, and cancellation
 * flows back through the webhook like any other subscription change.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in first' }, { status: 401 });
  }

  const supabase = await createServerSupabase();
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'No membership on this account' }, { status: 404 });
  }

  const stripe = new Stripe(secret);
  const origin =
    req.headers.get('origin') ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://www.vacationpro.co';

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${origin}/vault`,
  });
  return NextResponse.json({ url: session.url });
}
