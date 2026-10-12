-- Multi Quiz App: UST-only Google sign-in + per-quiz leaderboards.
--
-- Run all of this once in the Supabase dashboard: SQL Editor → New query →
-- paste → Run. Safe to run again after an edit (everything is
-- create-or-replace / if-not-exists). Then switch on the sign-up hook:
-- Authentication → Hooks → "Before User Created" → Postgres function →
-- public.hook_ust_only. Full checklist: supabase/SETUP.md.
--
-- What it sets up:
--   * hook_ust_only      rejects any sign-up that isn't an @ust.edu.ph account
--   * profiles           name + Google photo per user, and a "show me" switch
--   * attempts           one row per posted quiz attempt (only via submit_attempt)
--   * submit_attempt()   validates and records an attempt
--   * leaderboard()      best attempt per person, today / this week / all time
--                        (Asia/Manila, weeks start Monday)
--   * recent_attempts()  the Live tab: every attempt on a quiz, newest first
-- Every table and function also refuses non-UST callers on its own, so the
-- data stays UST-only even if the hook were switched off.


-- ---------------------------------------------------------------------------
-- Who counts as UST
-- ---------------------------------------------------------------------------

create or replace function public.is_ust()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) like '%@ust.edu.ph'
$$;

-- Auth hook: runs before Supabase creates any new account. Not a UST
-- address → the account is never created and the sign-in fails with this
-- message.
create or replace function public.hook_ust_only(event jsonb)
returns jsonb
language plpgsql
as $$
begin
  if lower(coalesce(event -> 'user' ->> 'email', '')) like '%@ust.edu.ph' then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message', 'Only UST accounts (@ust.edu.ph) can sign in.'
    )
  );
end;
$$;

grant execute on function public.hook_ust_only(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_ust_only(jsonb) from authenticated, anon, public;


-- ---------------------------------------------------------------------------
-- Profiles: kept in sync with the Google name and photo on every sign-in
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  show_on_board boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) and (select public.is_ust()));

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) and (select public.is_ust()))
  with check (id = (select auth.uid()));

-- Users may only flip their own "show me on leaderboards" switch; the name
-- and photo come from Google via the trigger below.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (show_on_board) on public.profiles to authenticated;

create or replace function public.sync_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do update
    set display_name = excluded.display_name,
        avatar_url = excluded.avatar_url,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_saved on auth.users;
create trigger on_auth_user_saved
  after insert or update of raw_user_meta_data on auth.users
  for each row execute function public.sync_profile();


-- ---------------------------------------------------------------------------
-- Attempts: written only through submit_attempt()
-- ---------------------------------------------------------------------------

create table if not exists public.attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  quiz_id text not null,
  quiz_title text not null,
  score numeric not null,           -- Multiple Select scored "Right only"
  total numeric not null,
  pct numeric not null,             -- 0–100, computed here, not trusted from the app
  correct int not null,
  question_count int not null,      -- scored questions (excludes "not scored")
  duration_ms int not null,
  completed_at timestamptz not null default now()  -- server time
);

create index if not exists attempts_quiz_time on public.attempts (quiz_id, completed_at desc);
create index if not exists attempts_user_quiz on public.attempts (user_id, quiz_id, completed_at desc);

alter table public.attempts enable row level security;

drop policy if exists "attempts: read own" on public.attempts;
create policy "attempts: read own" on public.attempts
  for select to authenticated
  using (user_id = (select auth.uid()) and (select public.is_ust()));

revoke all on public.attempts from anon, authenticated;
grant select on public.attempts to authenticated;

-- The app computes the score in the browser, so this can only reject what's
-- plainly impossible; it's a friendly board, not an exam.
create or replace function public.submit_attempt(
  p_quiz_id text,
  p_quiz_title text,
  p_score numeric,
  p_total numeric,
  p_correct int,
  p_question_count int,
  p_duration_ms int
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id bigint;
begin
  if auth.uid() is null or not public.is_ust() then
    raise exception 'Only UST accounts can post scores.' using errcode = '42501';
  end if;
  if p_quiz_id is null or length(p_quiz_id) not between 1 and 300
     or p_quiz_title is null or length(p_quiz_title) not between 1 and 200 then
    raise exception 'Unknown quiz.' using errcode = '22023';
  end if;
  if p_total is null or p_total <= 0 or p_score is null or p_score < 0 or p_score > p_total + 0.001 then
    raise exception 'Invalid score.' using errcode = '22023';
  end if;
  if p_question_count is null or p_question_count not between 1 and 1000
     or p_correct is null or p_correct not between 0 and p_question_count then
    raise exception 'Invalid question count.' using errcode = '22023';
  end if;
  -- Half a second per question at the very least.
  if p_duration_ms is null or p_duration_ms < p_question_count * 500 then
    raise exception 'Too quick to count.' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.attempts
    where user_id = auth.uid() and quiz_id = p_quiz_id
      and completed_at > now() - interval '15 seconds'
  ) then
    raise exception 'Slow down — wait a few seconds between attempts.' using errcode = '54000';
  end if;

  insert into public.attempts (user_id, quiz_id, quiz_title, score, total, pct, correct, question_count, duration_ms)
  values (
    auth.uid(), p_quiz_id, p_quiz_title, p_score, p_total,
    round(least(p_score / p_total, 1) * 100, 2),
    p_correct, p_question_count, p_duration_ms
  )
  returning id into new_id;
  return new_id;
end;
$$;

revoke execute on function public.submit_attempt(text, text, numeric, numeric, int, int, int) from anon, public;
grant execute on function public.submit_attempt(text, text, numeric, numeric, int, int, int) to authenticated;


-- ---------------------------------------------------------------------------
-- Leaderboard: each person's best attempt in the period, ranked by % then
-- time. Returns the top p_limit plus your own row wherever you placed.
-- p_period: 'day' | 'week' | anything else = all time.
-- ---------------------------------------------------------------------------

create or replace function public.leaderboard(p_quiz_id text, p_period text, p_limit int default 10)
returns table (
  rank bigint,
  players bigint,
  is_me boolean,
  display_name text,
  avatar_url text,
  pct numeric,
  duration_ms int,
  completed_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with since as (
    select case p_period
      when 'day' then date_trunc('day', now() at time zone 'Asia/Manila') at time zone 'Asia/Manila'
      when 'week' then date_trunc('week', now() at time zone 'Asia/Manila') at time zone 'Asia/Manila'
      else '-infinity'::timestamptz
    end as t
  ),
  best as (
    select distinct on (a.user_id) a.user_id, a.pct, a.duration_ms, a.completed_at
    from public.attempts a
    join public.profiles p on p.id = a.user_id
    where (select public.is_ust())
      and a.quiz_id = p_quiz_id
      and a.completed_at >= (select t from since)
      and (p.show_on_board or a.user_id = auth.uid())
    order by a.user_id, a.pct desc, a.duration_ms asc, a.completed_at asc
  ),
  ranked as (
    select
      rank() over (order by b.pct desc, b.duration_ms asc) as rank,
      count(*) over () as players,
      b.*
    from best b
  )
  select r.rank, r.players, r.user_id = auth.uid(), p.display_name, p.avatar_url, r.pct, r.duration_ms, r.completed_at
  from ranked r
  join public.profiles p on p.id = r.user_id
  where r.rank <= least(greatest(coalesce(p_limit, 10), 1), 100) or r.user_id = auth.uid()
  order by r.rank, r.completed_at;
$$;

revoke execute on function public.leaderboard(text, text, int) from anon, public;
grant execute on function public.leaderboard(text, text, int) to authenticated;


-- ---------------------------------------------------------------------------
-- Live tab: every attempt on a quiz (not just each person's best), newest
-- first. The app re-fetches it every few seconds while it's on screen.
-- ---------------------------------------------------------------------------

create or replace function public.recent_attempts(p_quiz_id text, p_limit int default 20)
returns table (
  is_me boolean,
  display_name text,
  avatar_url text,
  pct numeric,
  duration_ms int,
  completed_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select a.user_id = auth.uid(), p.display_name, p.avatar_url, a.pct, a.duration_ms, a.completed_at
  from public.attempts a
  join public.profiles p on p.id = a.user_id
  where (select public.is_ust())
    and a.quiz_id = p_quiz_id
    and (p.show_on_board or a.user_id = auth.uid())
  order by a.completed_at desc
  limit least(greatest(coalesce(p_limit, 20), 1), 50);
$$;

revoke execute on function public.recent_attempts(text, int) from anon, public;
grant execute on function public.recent_attempts(text, int) to authenticated;
