-- "Your xupersplits" follows the account, not the browser.
--
-- Until now the list was two disjoint halves: what the server knows is yours
-- (created while signed in, or a claimed slot in a secure split) and whatever
-- localStorage happened to remember. Open a split from a shared link, sign in
-- on another device, and it's gone — the visit only ever existed in that one
-- browser.
--
-- split_follows binds a visited split to a user. The same row carries a
-- `hidden` flag, which is how a split leaves the list: unfollowing isn't
-- enough on its own, because splits you created come back via
-- splits.created_by regardless of whether a follow row exists.
--
-- Holding the secret key is still the capability — following a split grants
-- no access it didn't already have, and members-only secure splits are
-- refused to non-members so nobody can pin a split they can't open.

create table if not exists public.split_follows (
  user_id uuid not null,
  split_id uuid not null references public.splits(id) on delete cascade,
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, split_id)
);

create index if not exists split_follows_user_idx on public.split_follows (user_id);

alter table public.split_follows enable row level security;
revoke all on public.split_follows from anon, authenticated;

-- ── follow_splits: adopt visited splits into the account ────────────────────
-- Takes an array because the landing page syncs a whole browser's history in
-- one go. Unknown keys and members-only splits the caller can't read are
-- skipped rather than raised — one stale key in localStorage must not stop
-- the rest from syncing.
--
-- `on conflict do nothing` deliberately leaves `hidden` alone: a split the
-- user removed from the list stays removed even though the key is still in
-- that browser's history.
create or replace function public.follow_splits(p_keys text[])
returns int
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_key text;
  v_id uuid;
  v_secure boolean;
  v_vis text;
  v_creator uuid;
  v_count int := 0;
begin
  if v_uid is null then
    raise exception 'login_required';
  end if;
  if p_keys is null or array_length(p_keys, 1) is null then
    return 0;
  end if;
  if array_length(p_keys, 1) > 200 then
    raise exception 'rate_limited';
  end if;

  foreach v_key in array p_keys loop
    select id, secure, visibility, created_by
      into v_id, v_secure, v_vis, v_creator
      from splits where key = v_key;

    if v_id is not null
       and not (
         v_secure and v_vis = 'members'
         and v_uid is distinct from v_creator
         and not exists (
           select 1 from participants p
           where p.split_id = v_id and p.user_id = v_uid
         )
       )
    then
      insert into split_follows (user_id, split_id)
      values (v_uid, v_id)
      on conflict (user_id, split_id) do nothing;
      v_count := v_count + 1;
    end if;
  end loop;

  return v_count;
end $$;

-- ── hide_split: take a split out of my list ─────────────────────────────────
-- Upserts rather than deleting, so it also hides splits that reach the list
-- through created_by or a claimed slot. The split itself is untouched — this
-- is per-user, and everyone else keeps seeing it.
create or replace function public.hide_split(p_key text)
returns void
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'login_required';
  end if;
  select id into v_id from splits where key = p_key;
  if v_id is null then
    raise exception 'split_not_found';
  end if;
  insert into split_follows (user_id, split_id, hidden)
  values (v_uid, v_id, true)
  on conflict (user_id, split_id) do update set hidden = true;
end $$;

-- ── my_splits: created + claimed + followed, minus hidden ───────────────────
create or replace function public.my_splits()
returns jsonb
language sql stable security definer set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'key', k.key, 'title', k.title, 'currency', k.currency, 'created_at', k.created_at,
    'participant_count', (select count(*) from participants p where p.split_id = k.id),
    'entry_count', (select count(*) from entries e where e.split_id = k.id)
  ) order by k.created_at desc), '[]'::jsonb)
  from splits k
  left join split_follows f
    on f.split_id = k.id and f.user_id = auth.uid()
  where coalesce(f.hidden, false) = false
    and (
      k.created_by = auth.uid()
      or exists (
        select 1 from participants p
        where p.split_id = k.id and p.user_id = auth.uid()
      )
      -- A follow alone is enough, except for members-only secure splits: those
      -- need the claimed-slot branch above, or they'd list but never open.
      or (f.user_id is not null and not (k.secure and k.visibility = 'members'))
    )
$$;

grant execute on function public.follow_splits(text[]) to authenticated;
grant execute on function public.hide_split(text) to authenticated;
