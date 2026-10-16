-- Vacation Vault hardening, 2026-10-16.
-- Additive and idempotent. Safe to run more than once, in any order.
--
-- Context: a pg_policies check on 2026-10-16 found TWO update policies live on
-- profiles. Postgres combines permissive policies for the same command with OR,
-- so the loose "profiles update own" from trip_hub.sql was granting what
-- "profiles update own non-billing" was trying to prevent: any authenticated
-- user could set their own plan to 'plus' and take free Vault access and free
-- concierge planning. No account had done it (one profile existed, legitimately
-- paid), but the window was open.

-- ── STEP 1. Close the hole. This is the line that matters. ──────────────────
drop policy if exists "profiles update own" on profiles;

-- Recreate the restricted policy only if it is somehow missing, so this file
-- is safe to run on a database where step 1 is the only problem.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profiles' and policyname = 'profiles update own non-billing'
  ) then
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
  end if;
end $$;

-- ── STEP 2. Column the new webhook code needs. ─────────────────────────────
-- Stripe does not guarantee webhook delivery order, and its retries make
-- reordering likelier. The webhook stamps the Stripe event's created time here
-- and ignores anything older, so a late event cannot write stale state.
-- Added BEFORE the trigger below, which assigns to it.
alter table profiles add column if not exists vault_event_at timestamptz;

comment on column profiles.vault_event_at is
  'Stripe event.created of the most recent Vault webhook applied to this row. The webhook skips any event older than this.';

-- ── STEP 3. Make it order-independent. ─────────────────────────────────────
-- A policy can be dropped or shadowed by any later migration, which is exactly
-- what happened. A trigger cannot be ORed away. Deliberately NOT security
-- definer, so current_user reflects the actual caller rather than the owner.
create or replace function profiles_block_billing_writes()
returns trigger language plpgsql as $$
begin
  -- The webhook (service_role via PostgREST) and the SQL editor (postgres)
  -- are the only callers allowed to move billing state.
  if current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;
  -- Everyone else: silently keep the existing values, so ordinary profile
  -- edits (home_airport, alert_opt_in) still succeed instead of erroring.
  new.plan                   := old.plan;
  new.stripe_customer_id     := old.stripe_customer_id;
  new.stripe_subscription_id := old.stripe_subscription_id;
  new.vault_status           := old.vault_status;
  new.vault_period_end       := old.vault_period_end;
  new.vault_interval         := old.vault_interval;
  new.vault_event_at         := old.vault_event_at;
  return new;
end $$;

drop trigger if exists profiles_billing_guard on profiles;
create trigger profiles_billing_guard before update on profiles
  for each row execute function profiles_block_billing_writes();

-- ── STEP 4. Verify. Expect exactly one row, named "…non-billing". ──────────
select count(*) as update_policy_count,
       string_agg(policyname, ' | ') as policy_names
from pg_policies
where tablename = 'profiles' and cmd = 'UPDATE';
