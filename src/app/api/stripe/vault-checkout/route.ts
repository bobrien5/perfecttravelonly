import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerUser, createServerSupabase } from '@/lib/supabase/server';

/**
 * POST /api/stripe/vault-checkout
 * Body: { interval: 'month' | 'year' }
 *
 * Opens a Stripe Checkout session for a Vacation Vault subscription.
 *
 * Sign-in is required first, on purpose. The webhook that grants access has
 * to map the Stripe customer back to a Supabase user, and the only reliable
 * way to do that is to attach the user id here, at the moment the session is
 * created. Letting anonymous visitors pay and reconciling by email later is
 * how memberships end up attached to the wrong account.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const prices = {
    month: process.env.STRIPE_VAULT_PRICE_MONTHLY,
    year: process.env.STRIPE_VAULT_PRICE_ANNUAL,
  };
  if (!secret || !prices.month || !prices.year) {
    return NextResponse.json(
      { error: 'Vault checkout is not configured. Set STRIPE_SECRET_KEY and STRIPE_VAULT_PRICE_* in Vercel.' },
      { status: 500 }
    );
  }

  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to join the Vault.', signIn: true }, { status: 401 });
  }

  let interval: 'month' | 'year' = 'month';
  try {
    const body = (await req.json()) as { interval?: string };
    if (body.interval === 'year') interval = 'year';
  } catch {
    // No body means monthly.
  }

  // Reuse the Stripe customer if this user has subscribed before, so a
  // returning member does not get a duplicate customer record and their
  // portal history stays in one place.
  const supabase = await createServerSupabase();
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const stripe = new Stripe(secret);
  const origin =
    req.headers.get('origin') ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://www.vacationpro.co';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: prices[interval], quantity: 1 }],
      ...(profile?.stripe_customer_id
        ? { customer: profile.stripe_customer_id }
        : { customer_email: user.email ?? undefined }),
      client_reference_id: user.id,
      metadata: { userId: user.id, interval, app: 'vacationpro', product: 'vacation-vault' },
      subscription_data: { metadata: { userId: user.id, interval } },
      allow_promotion_codes: true,
      success_url: `${origin}/vault/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/vault?canceled=1`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not start checkout';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
