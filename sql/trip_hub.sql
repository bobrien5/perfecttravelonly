-- Trip Hub schema. Run in the Supabase SQL editor AFTER sql/quiz_sessions.sql
-- and BEFORE deploying /trips. Nothing in the app auto-runs this.

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  home_airport text,
  plan text not null default 'free' check (plan in ('free', 'plus')),
  alert_opt_in boolean not null default false,
  created_at timestamptz not null default now()
);
alter table profiles enable row level security;
drop policy if exists "profiles select own" on profiles;
create policy "profiles select own" on profiles for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "profiles insert own" on profiles;
create policy "profiles insert own" on profiles for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "profiles update own" on profiles;
create policy "profiles update own" on profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  destination_slug text not null,
  season text,
  date_start date,
  date_end date,
  party text,
  budget_band smallint,
  vibes jsonb not null default '[]',
  dealbreakers jsonb not null default '[]',
  resort_slug text,
  checklist jsonb not null default '{"destination": true, "resort": false, "flights": false, "things": false, "itinerary": false, "book": false}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists trips_user_id_idx on trips (user_id);
alter table trips enable row level security;
-- select/insert/update/delete policies, all TO authenticated with (select auth.uid()) = user_id,
-- update with both USING and WITH CHECK
drop policy if exists "trips select own" on trips;
create policy "trips select own" on trips for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "trips insert own" on trips;
create policy "trips insert own" on trips for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "trips update own" on trips;
create policy "trips update own" on trips for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "trips delete own" on trips;
create policy "trips delete own" on trips for delete to authenticated using ((select auth.uid()) = user_id);

create table if not exists trip_alerts (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  destination_slug text not null,
  budget_band smallint,
  window_label text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists trip_alerts_user_id_idx on trip_alerts (user_id);
alter table trip_alerts enable row level security;
-- same policy pattern
drop policy if exists "trip_alerts select own" on trip_alerts;
create policy "trip_alerts select own" on trip_alerts for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "trip_alerts insert own" on trip_alerts;
create policy "trip_alerts insert own" on trip_alerts for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "trip_alerts update own" on trip_alerts;
create policy "trip_alerts update own" on trip_alerts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "trip_alerts delete own" on trip_alerts;
create policy "trip_alerts delete own" on trip_alerts for delete to authenticated using ((select auth.uid()) = user_id);

alter table quiz_sessions add column if not exists claimed_by uuid references auth.users(id);
alter table quiz_sessions add column if not exists trip_id uuid references trips(id);

-- RLS on with no policies defined: quiz_sessions is only ever read/written by
-- the service-role client (src/lib/supabase/client.ts, used in
-- src/app/api/claim-session/route.ts and the quiz-session API routes), which
-- bypasses RLS entirely. No client-side code touches this table directly, so
-- there is nothing for an authenticated/anon policy to grant; enabling RLS
-- here just closes off any future direct-from-client access by default.
alter table quiz_sessions enable row level security;
