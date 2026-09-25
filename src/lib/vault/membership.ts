import type { User } from '@supabase/supabase-js';
import { createServerSupabase, getServerUser } from '@/lib/supabase/server';

export type VaultStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
export type VaultInterval = 'month' | 'year';

export interface VaultMembership {
  user: User | null;
  /** True when the deals hub and concierge should be unlocked. */
  isMember: boolean;
  status: VaultStatus | null;
  periodEnd: string | null;
  interval: VaultInterval | null;
  stripeCustomerId: string | null;
}

const NONE: VaultMembership = {
  user: null,
  isMember: false,
  status: null,
  periodEnd: null,
  interval: null,
  stripeCustomerId: null,
};

/**
 * Reads the current user's Vacation Vault membership, server-side, as the
 * user (RLS applies, so this can only ever see their own row).
 *
 * A member is `plan = 'plus'` with a status that still grants access.
 * `past_due` keeps access on purpose: Stripe retries a failed card for days,
 * and locking someone out over a declined renewal, then letting them back in
 * when the retry succeeds, is worse than the small risk of a few unpaid days.
 * The webhook moves them to `canceled` when Stripe gives up.
 */
export async function getVaultMembership(): Promise<VaultMembership> {
  const user = await getServerUser();
  if (!user) return NONE;

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('profiles')
    .select('plan, vault_status, vault_period_end, vault_interval, stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const status = (data?.vault_status ?? null) as VaultStatus | null;
  const grantsAccess = status === 'active' || status === 'trialing' || status === 'past_due';

  return {
    user,
    isMember: data?.plan === 'plus' && grantsAccess,
    status,
    periodEnd: data?.vault_period_end ?? null,
    interval: (data?.vault_interval ?? null) as VaultInterval | null,
    stripeCustomerId: data?.stripe_customer_id ?? null,
  };
}
