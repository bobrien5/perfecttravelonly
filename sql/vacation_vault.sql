-- Vacation Vault membership: Stripe linkage on profiles.
--
-- profiles.plan already allows 'plus' (see trip_hub.sql), and a Vault member
-- is simply plan = 'plus'. That constraint is untouched. What is missing is a
-- way to map Stripe events back to a user: when a subscription is cancelled,
-- Stripe tells us the customer and subscription ids, not our user id, so both
-- must be stored at checkout time.
--
-- Additive and idempotent. Safe to run more than once.

alter table profiles add column if not exists stripe_customer_id     text;
alter table profiles add column if not exists stripe_subscription_id text;
alter table profiles add column if not exists vault_status           text
  check (vault_status in ('active', 'trialing', 'past_due', 'canceled', 'incomplete'));
alter table profiles add column if not exists vault_period_end       timestamptz;
alter table profiles add column if not exists vault_interval         text
  check (vault_interval in ('month', 'year'));

-- The webhook looks profiles up by customer id on every subscription event.
create unique index if not exists profiles_stripe_customer_id_idx
  on profiles (stripe_customer_id)
  where stripe_customer_id is not null;

-- Members must be able to read their own membership state (the gate reads
-- it server-side as the user), but never write it: only the webhook, running
-- with the service role, changes plan or Stripe fields. The existing
-- "profiles update own" policy would let a signed-in user set plan = 'plus'
-- themselves, so it is replaced with one that excludes those columns.
drop policy if exists "profiles update own" on profiles;
create policy "profiles update own non-billing" on profiles
  for update to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and plan                   is not distinct from (select p.plan                   from profiles p where p.user_id = auth.uid())
    and stripe_customer_id     is not distinct from (select p.stripe_customer_id     from profiles p where p.user_id = auth.uid())
    and stripe_subscription_id is not distinct from (select p.stripe_subscription_id from profiles p where p.user_id = auth.uid())
    and vault_status           is not distinct from (select p.vault_status           from profiles p where p.user_id = auth.uid())
    and vault_period_end       is not distinct from (select p.vault_period_end       from profiles p where p.user_id = auth.uid())
    and vault_interval         is not distinct from (select p.vault_interval         from profiles p where p.user_id = auth.uid())
  );
