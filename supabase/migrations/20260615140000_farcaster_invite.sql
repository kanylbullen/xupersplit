-- Reserve secure-split slots for specific Farcaster users — the parallel to the
-- email invite. The creator types an @handle; the server resolves it to an FID
-- via Neynar (free by_username) and passes it here. Claiming matches the
-- claimer's FID against the reserved one (FID is stable, unlike the username).

alter table participants add column if not exists invite_fc_fid bigint;
alter table participants add column if not exists invite_fc_username text;
alter table participants add column if not exists invite_fc_pfp_url text;

-- ── create_split: + p_fc_invites (jsonb array aligned to p_names) ────────────
-- Each element is null or {"fid":N,"username":"alice","pfp":"https://..."}.
drop function if exists public.create_split(text, text, text[], text, boolean, text, text, text, text[], boolean);

create or replace function public.create_split(
  p_title text,
  p_currency text,
  p_names text[],
  p_ip_hash text default null,
  p_secure boolean default false,
  p_access_mode text default 'payers',
  p_visibility text default 'link',
  p_claim_mode text default 'self',
  p_emails text[] default null,
  p_require_farcaster boolean default false,
  p_fc_invites jsonb default null
)
returns text
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_key text;
  v_id uuid;
  v_name text;
  v_pos int := 0;
  v_uid uuid := auth.uid();
  v_fc jsonb;
  v_fc_fid bigint;
  v_fc_user text;
  v_fc_pfp text;
begin
  if (select count(*) from splits where created_at > now() - interval '1 hour') >= 2000 then
    raise exception 'rate_limited';
  end if;
  if p_ip_hash is not null and (
    select count(*) from splits
    where created_ip_hash = p_ip_hash and created_at > now() - interval '1 hour'
  ) >= 10 then
    raise exception 'rate_limited';
  end if;
  if p_title is null or length(trim(p_title)) = 0 then
    raise exception 'title_required';
  end if;
  if p_names is null or array_length(p_names, 1) < 2 then
    raise exception 'need_two_participants';
  end if;
  if p_secure then
    if v_uid is null then raise exception 'login_required'; end if;
    if p_access_mode not in ('all', 'payers') then raise exception 'bad_config'; end if;
    if p_visibility not in ('link', 'members') then raise exception 'bad_config'; end if;
    if p_claim_mode not in ('self', 'invite') then raise exception 'bad_config'; end if;
  end if;

  v_key := replace(gen_random_uuid()::text, '-', '');
  insert into splits (key, title, currency, created_by, created_ip_hash,
                      secure, access_mode, visibility, claim_mode, require_farcaster)
  values (
    v_key, trim(p_title), coalesce(nullif(trim(p_currency), ''), 'SEK'), v_uid, p_ip_hash,
    coalesce(p_secure, false),
    case when p_secure then p_access_mode else 'payers' end,
    case when p_secure then p_visibility else 'link' end,
    case when p_secure then p_claim_mode else 'self' end,
    case when p_secure then coalesce(p_require_farcaster, false) else false end
  )
  returning id into v_id;

  foreach v_name in array p_names loop
    if length(trim(v_name)) > 0 then
      v_fc := null; v_fc_fid := null; v_fc_user := null; v_fc_pfp := null;
      if p_secure and p_claim_mode = 'invite' and p_fc_invites is not null
         and jsonb_typeof(p_fc_invites -> v_pos) = 'object' then
        v_fc := p_fc_invites -> v_pos;
        v_fc_fid := nullif(v_fc ->> 'fid', '')::bigint;
        v_fc_user := lower(nullif(trim(v_fc ->> 'username'), ''));
        v_fc_pfp := nullif(trim(v_fc ->> 'pfp'), '');
        if v_fc_pfp !~ '^https://' or length(coalesce(v_fc_pfp, '')) > 512 then v_fc_pfp := null; end if;
      end if;
      insert into participants (split_id, name, position, invite_email,
                                invite_fc_fid, invite_fc_username, invite_fc_pfp_url)
      values (
        v_id, trim(v_name), v_pos,
        case
          when p_secure and p_claim_mode = 'invite' and v_fc_fid is null
               and p_emails is not null and array_length(p_emails, 1) >= v_pos + 1
            then nullif(lower(trim(p_emails[v_pos + 1])), '')
          else null
        end,
        v_fc_fid, v_fc_user, v_fc_pfp
      );
      v_pos := v_pos + 1;
    end if;
  end loop;
  return v_key;
end $$;

grant execute on function public.create_split(text, text, text[], text, boolean, text, text, text, text[], boolean, jsonb) to anon, authenticated;

-- ── claim_participant: enforce the reserved FID when set ─────────────────────
create or replace function public.claim_participant(
  p_key text,
  p_id uuid,
  p_fid bigint default null,
  p_username text default null,
  p_pfp text default null
)
returns void language plpgsql volatile security definer set search_path = public as $$
declare
  v_split uuid := _require_split(p_key);
  v_secure boolean; v_mode text; v_invite text; v_require_fc boolean;
  v_invite_fid bigint;
  v_uid uuid := auth.uid();
  v_username text; v_pfp text;
begin
  if v_uid is null then raise exception 'login_required'; end if;
  select secure, claim_mode, require_farcaster
    into v_secure, v_mode, v_require_fc from splits where id = v_split;
  if not v_secure then raise exception 'not_secure'; end if;
  if v_require_fc and p_fid is null then raise exception 'farcaster_required'; end if;
  if exists (select 1 from participants where split_id = v_split and user_id = v_uid and id <> p_id) then
    raise exception 'already_claimed';
  end if;

  -- Reservation: a slot may be held for an email OR a Farcaster FID.
  select invite_fc_fid into v_invite_fid from participants where id = p_id and split_id = v_split;
  if v_invite_fid is not null then
    if p_fid is null or p_fid is distinct from v_invite_fid then
      raise exception 'not_invited';
    end if;
  elsif v_mode = 'invite' then
    select lower(invite_email) into v_invite from participants where id = p_id and split_id = v_split;
    -- Email-reserved slot: match the email. (FID-reserved slots handled above.)
    if v_invite is null or v_invite is distinct from lower(auth.jwt() ->> 'email') then
      raise exception 'not_invited';
    end if;
  end if;

  v_username := lower(regexp_replace(trim(coalesce(p_username, '')), '^@', ''));
  if v_username !~ '^[a-z0-9_.-]{1,64}$' then v_username := null; end if;
  v_pfp := trim(coalesce(p_pfp, ''));
  if v_pfp !~ '^https://' or length(v_pfp) > 512 then v_pfp := null; end if;

  update participants set
    user_id = v_uid,
    fc_fid = case when p_fid > 0 then p_fid else null end,
    fc_username = v_username,
    fc_pfp_url = v_pfp
    where id = p_id and split_id = v_split and (user_id is null or user_id = v_uid);
  if not found then raise exception 'slot_taken'; end if;
  perform _touch_split(v_split);
end $$;
grant execute on function public.claim_participant(text, uuid, bigint, text, text) to anon, authenticated;

-- ── split_data: expose the reserved Farcaster handle on each slot ────────────
create or replace function public.split_data(p_key text)
returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare v_id uuid; v_secure boolean; v_vis text; v_creator uuid; v_me uuid;
begin
  select id into v_id from splits where key = p_key;
  if v_id is null then
    insert into lookup_failures (hour, count) values (date_trunc('hour', now()), 1)
      on conflict (hour) do update set count = lookup_failures.count + 1;
    return jsonb_build_object('not_found', true);
  end if;

  select secure, visibility, created_by into v_secure, v_vis, v_creator from splits where id = v_id;
  v_me := _caller_participant(v_id);

  if v_secure and v_vis = 'members'
     and (auth.uid() is null or (auth.uid() is distinct from v_creator and v_me is null)) then
    return jsonb_build_object('forbidden', true);
  end if;

  update splits set last_activity = now()
  where id = v_id and last_activity < now() - interval '1 day';

  return jsonb_build_object(
    'split', (select jsonb_build_object(
        'key', k.key, 'title', k.title, 'currency', k.currency, 'created_at', k.created_at,
        'has_owner', k.created_by is not null, 'auto_purge', k.auto_purge,
        'keep_payment_methods', k.keep_payment_methods,
        'secure', k.secure, 'access_mode', k.access_mode,
        'visibility', k.visibility, 'claim_mode', k.claim_mode,
        'require_farcaster', k.require_farcaster,
        'is_creator', (auth.uid() is not null and auth.uid() = k.created_by),
        'me_participant', v_me
      ) from splits k where k.id = v_id),
    'participants', (select coalesce(jsonb_agg(jsonb_build_object(
        'id', p.id, 'name', p.name, 'position', p.position,
        'payment_methods', p.payment_methods,
        'payment_changed_at', p.payment_changed_at,
        'payment_type', p.payment_methods->0->>'type',
        'payment_value', p.payment_methods->0->>'value',
        'claimed', p.user_id is not null,
        'is_me', (auth.uid() is not null and p.user_id = auth.uid()),
        'has_invite', p.invite_email is not null or p.invite_fc_fid is not null,
        'seen_at', p.seen_at, 'ready_at', p.ready_at,
        'fc_username', p.fc_username, 'fc_pfp_url', p.fc_pfp_url,
        'invite_fc_username', p.invite_fc_username, 'invite_fc_pfp_url', p.invite_fc_pfp_url
      ) order by p.position, p.created_at), '[]'::jsonb)
      from participants p where p.split_id = v_id),
    'entries', (select coalesce(jsonb_agg(jsonb_build_object(
        'id', e.id, 'kind', e.kind, 'description', e.description,
        'amount_cents', e.amount_cents, 'paid_by', e.paid_by,
        'transfer_to', e.transfer_to, 'entry_date', e.entry_date,
        'created_at', e.created_at,
        'orig_currency', e.orig_currency, 'orig_amount_cents', e.orig_amount_cents, 'fx_rate', e.fx_rate,
        'shares', (select coalesce(jsonb_agg(jsonb_build_object(
            'participant_id', s.participant_id, 'weight', s.weight, 'amount_cents', s.amount_cents
          )), '[]'::jsonb) from entry_shares s where s.entry_id = e.id)
      ) order by e.entry_date desc, e.created_at desc), '[]'::jsonb)
      from entries e where e.split_id = v_id)
  );
end $$;