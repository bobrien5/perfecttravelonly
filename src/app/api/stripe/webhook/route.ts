import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase/client';

// Signature verification needs the raw request body, and the Stripe SDK
// needs Node APIs. Neither works on the edge runtime.
export const runtime = 'nodejs';

/**
 * POST /api/stripe/webhook
 *
 * The only thing that grants or revokes Vacation Vault access. Runs with the
 * service-role client because the user is not present: Stripe is the caller.
 * The RLS policy in sql/vacation_vault.sql stops users changing these fields
 * themselves, so every plan change on a profile traces back to a signed
 * Stripe event handled here.
 *
 * Events registered on the endpoint (see the Stripe dashboard):
 *   checkout.session.completed      grant access, store customer + subscription
 *   customer.subscription.updated   sync status and period end
 *   customer.subscription.deleted   revoke access
 *   invoice.payment_failed          mark past_due (access is kept during dunning)
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !whSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const stripe = new Stripe(secret);
  const sig = req.headers.get('stripe-signature');
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig ?? '', whSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'bad signature';
    return NextResponse.json({ error: `Signature verification failed: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;
        const userId = session.client_reference_id || session.metadata?.userId;
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
        if (!userId || !customerId || !subId) break;

        const sub = await stripe.subscriptions.retrieve(subId);
        await upsertMembership({ userId, customerId, sub });
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        const userId = sub.metadata?.userId || (await userIdForCustomer(customerId));
        if (!userId) break;
        await upsertMembership({ userId, customerId, sub });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        if (!customerId) break;
        await supabase
          .from('profiles')
          .update({ vault_status: 'past_due' })
          .eq('stripe_customer_id', customerId);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    // Return 500 so Stripe retries. Swallowing an error here would silently
    // strand a paying member without access.
    const message = err instanceof Error ? err.message : 'handler failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function userIdForCustomer(customerId: string): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  return data?.user_id ?? null;
}

/**
 * Translates a Stripe subscription into the profile row. Access follows
 * Stripe's status: anything that is not active, trialing or past_due drops
 * the plan back to free. current_period_end lives on the subscription in
 * older API versions and on the first item in newer ones, so both are read.
 */
async function upsertMembership({
  userId,
  customerId,
  sub,
}: {
  userId: string;
  customerId: string;
  sub: Stripe.Subscription;
}) {
  const item = sub.items?.data?.[0];
  const periodEndUnix =
    (item as unknown as { current_period_end?: number })?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end;
  const interval = item?.price?.recurring?.interval === 'year' ? 'year' : 'month';

  const status = sub.status as string;
  const keepsAccess = status === 'active' || status === 'trialing' || status === 'past_due';

  const { error } = await supabase.from('profiles').upsert(
    {
      user_id: userId,
      plan: keepsAccess ? 'plus' : 'free',
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      vault_status: mapStatus(status),
      vault_period_end: periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null,
      vault_interval: interval,
    },
    { onConflict: 'user_id' }
  );
  if (error) throw new Error(`profiles upsert failed: ${error.message}`);
}

function mapStatus(s: string): 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' {
  if (s === 'active' || s === 'trialing' || s === 'past_due' || s === 'canceled') return s;
  if (s === 'unpaid' || s === 'incomplete_expired') return 'canceled';
  return 'incomplete';
}
