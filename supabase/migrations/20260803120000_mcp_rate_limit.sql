-- Separate the creation throttle by where the split came from.
--
-- The per-IP limit assumes one IP ≈ one person, which holds for the web form
-- but breaks for MCP: hosted clients (ChatGPT connectors, Claude on the web)
-- call the endpoint from a small pool of datacenter egress IPs shared by their
-- entire user base. Under the web limit, ten splits an hour worldwide would
-- lock out everyone behind that client. Give MCP its own, much wider bucket.
--
-- p_source is client-supplied and therefore not a security control — neither is
-- p_ip_hash, which a caller can already randomise. Both are spam speed bumps;
-- the global cap below is the real backstop.

-- ── create_split: + p_source ('web' | 'mcp') ─────────────────────────────────
drop function if exists public.create_split(text, text, text[], text, boolean, text, text, text, text[], boolean, jsonb);

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
  p_fc_invites jsonb default null,
  p_source text default 'web'
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
  v_ip_cap int := case when p_source = 'mcp' then 200 else 10 end;
begin
  if (select count(*) from splits where created_at > now() - interval '1 hour') >= 2000 then
    raise exception 'rate_limited';
  end if;
  if p_ip_hash is not null and (
    select count(*) from splits
    where created_ip_hash = p_ip_hash and created_at > now() - interval '1 hour'
  ) >= v_ip_cap then
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

grant execute on function public.create_split(text, text, text[], text, boolean, text, text, text, text[], boolean, jsonb, text) to anon, authenticated;
