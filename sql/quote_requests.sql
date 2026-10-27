-- Advisor quote requests (resort platform, 2026-10).
--
-- Every "Get a Quote from Brendan" submission is written here BEFORE the
-- traveler sees a success message, so a request survives a failed email or
-- CRM call. Email and GoHighLevel are best-effort side effects recorded in
-- the notification column.
--
-- Requested quotes, confirmed bookings, completed travel and paid commission
-- are kept distinct: status tracks the lead, the booking_* and commission_*
-- columns are only filled in once a booking exists, and expected_commission
-- is an editable internal estimate (default rate 12%), never profit.
--
-- Access: service role only. RLS is enabled with no policies, so the anon and
-- authenticated roles can neither read nor write. The public API route and
-- the admin pages use the service-role client on the server.
--
-- Additive and idempotent. Safe to run more than once. Run manually in the
-- Supabase SQL editor (this repo has no supabase/migrations directory).

create extension if not exists pgcrypto;

create table if not exists quote_requests (
  id                      uuid primary key default gen_random_uuid(),
  reference               text not null unique,
  idempotency_key         text unique,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  -- Attribution (no personal data)
  source                  text,
  source_page             text,
  utm                     jsonb not null default '{}'::jsonb,
  journey_id              text,
  quiz_session_id         text,
  ip_hash                 text,

  -- Contact
  first_name              text not null,
  last_name               text,
  email                   text not null,
  phone                   text,
  contact_preference      text not null default 'email'
    check (contact_preference in ('email', 'phone', 'text', 'whatsapp')),
  marketing_consent       boolean not null default false,

  -- Trip
  selected_resort_id      text,
  alternative_resort_ids  text[] not null default '{}',
  destination             text,
  dates                   jsonb,
  dates_note              text,
  adults                  integer not null check (adults between 1 and 12),
  child_ages              integer[] not null default '{}',
  rooms                   integer not null default 1 check (rooms between 1 and 6),
  departure_airport       text,
  budget_amount           numeric(12, 2),
  budget_currency         text check (budget_currency in ('USD', 'CAD', 'GBP', 'EUR')),
  budget_includes_flights text check (budget_includes_flights in ('yes', 'no', 'unsure')),
  trip_scope              text not null default 'not-sure'
    check (trip_scope in ('hotel-only', 'flight-and-hotel', 'not-sure')),
  booking_timeframe       text not null default 'just-researching'
    check (booking_timeframe in ('asap', 'within-month', '1-3-months', '3-plus-months', 'just-researching')),
  priorities              text[] not null default '{}',
  atmosphere              text,
  notes                   text,
  quiz_answers            jsonb,

  -- Advisor workflow
  status                  text not null default 'new'
    check (status in ('new', 'contacted', 'quoted', 'booked', 'traveled', 'lost', 'canceled')),
  status_history          jsonb not null default '[]'::jsonb,
  advisor_notes           text,
  next_follow_up_on       date,
  quoted_at               timestamptz,
  booked_at               timestamptz,
  travel_start            date,
  travel_end              date,
  supplier                text,

  -- Booking value and commission (internal estimates until paid)
  booking_currency        text not null default 'USD',
  booking_value           numeric(12, 2),
  commissionable_amount   numeric(12, 2),
  commission_rate         numeric(5, 4) not null default 0.12
    check (commission_rate >= 0 and commission_rate <= 1),
  expected_commission     numeric(12, 2),
  actual_commission       numeric(12, 2),
  commission_status       text not null default 'none'
    check (commission_status in ('none', 'expected', 'invoiced', 'paid', 'not-paid')),
  commission_paid_on      date,

  -- Side effects: { travelerEmail, advisorEmail, crm: { status, at, error } }
  notification            jsonb not null default '{}'::jsonb
);

create index if not exists quote_requests_created_at_idx on quote_requests (created_at desc);
create index if not exists quote_requests_status_idx on quote_requests (status);
create index if not exists quote_requests_email_idx on quote_requests (lower(email));
create index if not exists quote_requests_ip_recent_idx on quote_requests (ip_hash, created_at desc);

alter table quote_requests enable row level security;
-- Deliberately no policies: service role only.

create or replace function quote_requests_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists quote_requests_touch_updated_at on quote_requests;
create trigger quote_requests_touch_updated_at
  before update on quote_requests
  for each row execute function quote_requests_touch_updated_at();

-- Quiz results emails: record consent separately from the transactional send.
alter table quiz_sessions add column if not exists results_emailed_at timestamptz;
alter table quiz_sessions add column if not exists marketing_consent boolean;
