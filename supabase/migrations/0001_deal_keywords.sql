-- RLS intentionally omitted: this table is accessed only server-side via the service-role key, never from the client.

create table if not exists deal_keywords (
  id           uuid primary key default gen_random_uuid(),
  keyword      text not null unique,
  deal_slug    text not null,
  deal_title   text not null,
  destination  text not null,
  price        integer not null, -- whole USD dollars
  landing_path text not null,
  dm_copy      text not null,
  status       text not null default 'active' check (status in ('active', 'paused', 'expired')),
  expires_at   date,
  created_at   timestamptz not null default now()
);

create index if not exists deal_keywords_status_idx on deal_keywords (status);
