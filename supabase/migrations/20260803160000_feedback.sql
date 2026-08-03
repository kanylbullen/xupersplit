-- In-app feedback, stored privately.
--
-- The obvious design — a form that files a GitHub issue — is wrong here. The
-- repo is public, and the form sits inside a split, so the reporter's browser
-- has the capability key in its address bar. Auto-filing that would publish
-- someone's split to a search-indexed page. So feedback lands in this table and
-- a human (or an agent) decides what becomes an issue; the split key is
-- stripped on the way out, never on the way in, because it is exactly what
-- makes a report reproducible.
--
-- Free text plus an optional email is personal data, so it is on the same
-- delete-on-a-schedule footing as everything else here: 12 months, and the IP
-- hash goes after 24 hours like the one on splits.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- Null once the split is purged, or when feedback comes from outside one.
  split_id uuid references public.splits(id) on delete set null,
  kind text not null check (kind in ('bug', 'suggestion', 'other')),
  message text not null,
  -- Optional: the only way to reply to someone with no account.
  reply_email text,
  -- Client-reported diagnostics (locale, counts, user agent). Never contents.
  context jsonb not null default '{}'::jsonb,
  created_ip_hash text,
  handled_at timestamptz
);

alter table public.feedback enable row level security;
revoke all on public.feedback from anon, authenticated;

create index if not exists feedback_created_idx on public.feedback (created_at desc);
create index if not exists feedback_unhandled_idx on public.feedback (created_at desc)
  where handled_at is null;

-- ── submit_feedback ──────────────────────────────────────────────────────────
create or replace function public.submit_feedback(
  p_kind text,
  p_message text,
  p_split_key text default null,
  p_reply_email text default null,
  p_context jsonb default '{}'::jsonb,
  p_ip_hash text default null
)
-- Returns {id, split_id}: the caller needs the resolved split id to put in the
-- notification, and must not be handed back the key it just sent us.
returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_id uuid;
  v_split uuid;
  v_email text;
  v_context jsonb := coalesce(p_context, '{}'::jsonb);
begin
  if (select count(*) from feedback where created_at > now() - interval '1 hour') >= 500 then
    raise exception 'feedback_rate_limited_global';
  end if;
  -- No identity to throttle on, so this is the same speed bump create_split
  -- uses: soft, bypassable, and backed by the global cap above.
  if p_ip_hash is not null and (
    select count(*) from feedback
    where created_ip_hash = p_ip_hash and created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'feedback_rate_limited';
  end if;

  if p_kind is null or p_kind not in ('bug', 'suggestion', 'other') then
    raise exception 'bad_kind';
  end if;
  if p_message is null or length(trim(p_message)) < 5 then
    raise exception 'message_required';
  end if;
  if length(p_message) > 4000 then
    raise exception 'message_too_long';
  end if;

  v_email := nullif(lower(trim(coalesce(p_reply_email, ''))), '');
  if v_email is not null then
    if length(v_email) > 254
       or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
      raise exception 'bad_email';
    end if;
  end if;

  -- Diagnostics are a convenience, not a contract: oversized or non-object
  -- payloads are dropped rather than rejected, so a bad client can't stop
  -- someone reporting a bug.
  if jsonb_typeof(v_context) is distinct from 'object'
     or length(v_context::text) > 2000 then
    v_context := '{}'::jsonb;
  end if;

  -- An unknown key resolves to null: feedback about a purged or mistyped split
  -- is still worth having.
  if p_split_key is not null then
    select id into v_split from splits where key = p_split_key;
  end if;

  insert into feedback (split_id, kind, message, reply_email, context, created_ip_hash)
  values (v_split, p_kind, trim(p_message), v_email, v_context, p_ip_hash)
  returning id into v_id;

  return jsonb_build_object('id', v_id, 'split_id', v_split);
end $$;

grant execute on function public.submit_feedback(text, text, text, text, jsonb, text)
  to anon, authenticated;

-- ── Retention ────────────────────────────────────────────────────────────────
-- Its own job rather than an edit to tollysplit-privacy-purge: a rewrite of
-- that command string is a bad way to find out you fat-fingered the split purge.
do $$
begin
  perform cron.unschedule('xupersplit-feedback-purge');
exception
  when others then null;
end $$;

select cron.schedule(
  'xupersplit-feedback-purge',
  '17 4 * * *',
  $$
  delete from public.feedback where created_at < now() - interval '12 months';
  update public.feedback set created_ip_hash = null
    where created_ip_hash is not null and created_at < now() - interval '24 hours';
  $$
);
