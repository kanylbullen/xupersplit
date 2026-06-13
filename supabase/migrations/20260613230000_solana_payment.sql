-- Add Solana as a payment method (USDC via SPL transfer, paid with a Solana
-- wallet over WalletConnect/Reown). The stored value is a base58 Solana address
-- (case-SENSITIVE — never lowercase it). Separate from the EVM/0x method.

alter table participants drop constraint participants_payment_type_check;
alter table participants add constraint participants_payment_type_check
  check (payment_type in ('swish', 'vipps', 'mobilepay', 'iban', 'revolut', 'lightning', 'evm', 'solana'));

create or replace function public.set_payment_methods(p_key text, p_id uuid, p_methods jsonb)
returns void
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_id uuid := _require_split(p_key);
  v_secure boolean;
  v_owner uuid;
  v_out jsonb := '[]'::jsonb;
  m jsonb; v_type text; v_raw text; v_clean text; v_count int := 0;
begin
  select secure into v_secure from splits where id = v_id;
  if v_secure then
    select user_id into v_owner from participants where id = p_id and split_id = v_id;
    if v_owner is null or v_owner is distinct from auth.uid() then
      raise exception 'not_your_participant';
    end if;
  end if;
  if p_methods is null or jsonb_typeof(p_methods) <> 'array' then
    raise exception 'bad_payment_value';
  end if;
  for m in select * from jsonb_array_elements(p_methods) loop
    v_count := v_count + 1;
    if v_count > 8 then raise exception 'too_many_methods'; end if;
    v_type := m->>'type';
    v_raw := coalesce(m->>'value', '');
    if v_type not in ('swish', 'vipps', 'mobilepay', 'iban', 'revolut', 'lightning', 'evm', 'solana') then raise exception 'bad_payment_type'; end if;
    if length(trim(v_raw)) = 0 then raise exception 'bad_payment_value'; end if;
    if v_type = 'iban' then
      v_clean := upper(replace(v_raw, ' ', ''));
      if v_clean !~ '^[A-Z]{2}[0-9]{2}[A-Z0-9]{8,30}$' then raise exception 'bad_payment_value'; end if;
    elsif v_type = 'revolut' then
      v_clean := lower(regexp_replace(trim(v_raw), '^@', ''));
      if v_clean !~ '^[a-z0-9]{4,30}$' then raise exception 'bad_payment_value'; end if;
    elsif v_type = 'lightning' then
      v_clean := lower(trim(v_raw));
      if v_clean !~ '^[a-z0-9._%+-]+@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$' then raise exception 'bad_payment_value'; end if;
      if length(v_clean) > 320 then raise exception 'bad_payment_value'; end if;
    elsif v_type = 'evm' then
      v_clean := lower(trim(v_raw));
      if v_clean !~ '^0x[0-9a-f]{40}$'
        and v_clean !~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.eth$' then
        raise exception 'bad_payment_value';
      end if;
      if length(v_clean) > 255 then raise exception 'bad_payment_value'; end if;
    elsif v_type = 'solana' then
      v_clean := trim(v_raw);  -- base58 is case-sensitive: do NOT lowercase
      if v_clean !~ '^[1-9A-HJ-NP-Za-km-z]{32,44}$' then raise exception 'bad_payment_value'; end if;
    else
      v_clean := replace(replace(v_raw, ' ', ''), '-', '');
      if v_clean !~ '^\+?[0-9]{6,15}$' then raise exception 'bad_payment_value'; end if;
    end if;
    v_out := v_out || jsonb_build_object('type', v_type, 'value', v_clean);
  end loop;
  update participants set
    payment_methods = v_out, payment_type = null, payment_value = null,
    payment_original = case when payment_original is null and v_out <> '[]'::jsonb then v_out else payment_original end,
    payment_changed_at = case when payment_original is not null and v_out <> '[]'::jsonb and v_out <> payment_original then now() else payment_changed_at end
    where id = p_id and split_id = v_id;
  if not found then raise exception 'participant_not_found' using errcode = 'P0002'; end if;
  perform _touch_split(v_id);
end $$;
grant execute on function public.set_payment_methods(text, uuid, jsonb) to anon, authenticated;
