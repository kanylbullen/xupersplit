"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button, Input, Label, Select } from "@/components/ui";
import { CURRENCIES } from "@/lib/money";
import { useI18n } from "@/lib/i18n/client";
import { FarcasterFollowPicker } from "@/components/new/FarcasterFollowPicker";
import { createSplitAction } from "./actions";

export function NewSplitForm({
  loggedIn,
  defaultCurrency,
  fcInvite,
}: {
  loggedIn: boolean;
  defaultCurrency: string;
  fcInvite: boolean;
}) {
  const { dict, t, te } = useI18n();
  const [state, formAction, pending] = useActionState(createSplitAction, null);
  const [rows, setRows] = useState<{ name: string; invite: string }[]>([
    { name: "", invite: "" },
    { name: "", invite: "" },
    { name: "", invite: "" },
  ]);
  const setRow = (i: number, patch: Partial<{ name: string; invite: string }>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const [secure, setSecure] = useState(false);
  const [claimMode, setClaimMode] = useState<"self" | "invite">("self");
  const invite = secure && claimMode === "invite";

  // Currency starts from the locale-based guess; in a Farcaster Mini App people
  // settle in USDC, so default to USD instead — unless the user already picked.
  const [currency, setCurrency] = useState(defaultCurrency);
  const currencyTouched = useRef(false);
  // Viewer's Farcaster FID (Mini App only) — enables the per-row follow picker.
  const [fcFid, setFcFid] = useState<number | null>(null);
  const [pickerRow, setPickerRow] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    import("@farcaster/miniapp-sdk")
      .then(async ({ sdk }) => {
        if (!(await sdk.isInMiniApp())) return;
        if (active && !currencyTouched.current) setCurrency("USD");
        const ctx = await sdk.context;
        if (active && ctx?.user?.fid) setFcFid(ctx.user.fid);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <Label htmlFor="title">{dict.new.name}</Label>
        <Input
          id="title"
          name="title"
          placeholder={dict.new.namePlaceholder}
          required
          maxLength={80}
        />
      </div>

      <div>
        <Label htmlFor="currency">{dict.new.currency}</Label>
        <Select
          id="currency"
          name="currency"
          value={currency}
          onChange={(e) => {
            currencyTouched.current = true;
            setCurrency(e.target.value);
          }}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>{dict.new.participants}</Label>
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="space-y-1">
              <Input
                name="name"
                value={row.name}
                onChange={(e) => setRow(i, { name: e.target.value })}
                placeholder={t(dict.new.participantPlaceholder, { n: i + 1 })}
                maxLength={40}
                required={i < 2}
              />
              {invite && (
                <div className="flex gap-2">
                  <Input
                    name="email"
                    value={row.invite}
                    onChange={(e) => setRow(i, { invite: e.target.value })}
                    type={fcInvite ? "text" : "email"}
                    inputMode={fcInvite ? "text" : "email"}
                    placeholder={
                      fcInvite
                        ? dict.new.inviteHandlePlaceholder
                        : dict.new.inviteEmailPlaceholder
                    }
                    maxLength={120}
                    className="flex-1 text-sm"
                  />
                  {fcFid !== null && (
                    <button
                      type="button"
                      onClick={() => setPickerRow(i)}
                      title={dict.new.fcPickFollows}
                      className="shrink-0 rounded-lg border border-stone-300 px-3 text-base text-[#855DCD] hover:border-[#855DCD]"
                      aria-label={dict.new.fcPickFollows}
                    >
                      👥
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setRows((rs) => [...rs, { name: "", invite: "" }])}
          className="mt-2 text-sm font-medium text-primary hover:text-primary-dark"
        >
          {dict.new.addAnother}
        </button>
        <p className="mt-1 text-xs text-stone-400">{dict.new.addLaterHint}</p>
      </div>

      {fcFid !== null && (
        <FarcasterFollowPicker
          fid={fcFid}
          open={pickerRow !== null}
          onClose={() => setPickerRow(null)}
          onPick={(u) => {
            if (pickerRow !== null)
              setRow(pickerRow, {
                invite: `@${u.username}`,
                name: rows[pickerRow].name.trim() || u.username,
              });
            setPickerRow(null);
          }}
        />
      )}

      {loggedIn && (
        <div className="rounded-2xl border border-stone-200 p-4">
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              name="secure"
              checked={secure}
              onChange={(e) => setSecure(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-teal-600"
            />
            <span>
              <span className="text-sm font-semibold">{dict.new.secureTitle}</span>
              <span className="block text-xs text-stone-400">
                {dict.new.secureHint}
              </span>
            </span>
          </label>

          {secure && (
            <div className="mt-4 space-y-4 border-t border-stone-100 pt-4">
              <fieldset>
                <legend className="mb-1.5 text-xs font-semibold text-stone-500">
                  {dict.new.whoMustLogin}
                </legend>
                <Radio name="access_mode" value="payers" defaultChecked label={dict.new.modePayers} />
                <Radio name="access_mode" value="all" label={dict.new.modeAll} />
              </fieldset>

              <fieldset>
                <legend className="mb-1.5 text-xs font-semibold text-stone-500">
                  {dict.new.whoCanView}
                </legend>
                <Radio name="visibility" value="link" defaultChecked label={dict.new.visLink} />
                <Radio name="visibility" value="members" label={dict.new.visMembers} />
              </fieldset>

              <fieldset>
                <legend className="mb-1.5 text-xs font-semibold text-stone-500">
                  {dict.new.howToJoin}
                </legend>
                <Radio
                  name="claim_mode"
                  value="self"
                  defaultChecked
                  label={dict.new.claimSelf}
                  onSelect={() => setClaimMode("self")}
                />
                <Radio
                  name="claim_mode"
                  value="invite"
                  label={dict.new.claimInvite}
                  onSelect={() => setClaimMode("invite")}
                />
              </fieldset>

              <label className="flex cursor-pointer items-start gap-2.5 border-t border-stone-100 pt-4">
                <input
                  type="checkbox"
                  name="require_farcaster"
                  className="mt-0.5 h-4 w-4 accent-teal-600"
                />
                <span>
                  <span className="text-sm font-semibold">
                    {dict.new.requireFarcaster}
                  </span>
                  <span className="block text-xs text-stone-400">
                    {dict.new.requireFarcasterHint}
                  </span>
                </span>
              </label>
            </div>
          )}
        </div>
      )}

      {state?.error && <p className="text-sm text-negative">{te(state.error)}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? dict.new.submitting : dict.new.submit}
      </Button>
    </form>
  );
}

function Radio({
  name,
  value,
  label,
  defaultChecked,
  onSelect,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
  onSelect?: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        onChange={onSelect}
        className="h-4 w-4 accent-teal-600"
      />
      {label}
    </label>
  );
}
