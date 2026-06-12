-- Lock the split's main currency once any entry exists. All amounts are stored
-- in the main currency (amount_cents), so switching it would silently relabel
-- every total in a new currency without converting. Rather than do a lossy
-- bulk FX rewrite (foreign-origin entries already carry their own rate), we
-- simply forbid the change after the first entry. The UI also disables it.

create or replace function public.update_split(p_key text, p_title text, p_currency text)
returns void
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_id uuid := _require_split(p_key);
  v_has_entries boolean;
begin
  select exists(select 1 from entries where split_id = v_id) into v_has_entries;
  update splits set
    title = coalesce(nullif(trim(p_title), ''), title),
    currency = case
      when v_has_entries then currency  -- locked: keep existing
      else coalesce(nullif(trim(p_currency), ''), currency)
    end,
    last_activity = now()
  where id = v_id;
end $$;
