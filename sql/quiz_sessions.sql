-- Onboarding quiz session storage.
--
-- This table must exist before /quiz deploys: the POST /api/quiz-session
-- route (src/app/api/quiz-session/route.ts) upserts into it on every quiz
-- session, and the route has no fallback if the table is missing.
--
-- This repo has no supabase/ CLI project (no supabase/migrations dir), so
-- run this manually in the Supabase SQL editor for this project before
-- shipping the /quiz route.

create table if not exists quiz_sessions (
  session_id text primary key,
  answers jsonb not null,
  top_matches jsonb not null,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
