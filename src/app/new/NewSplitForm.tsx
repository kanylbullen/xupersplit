"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button, Input, Label, Select } from "@/components/ui";
import { CURRENCIES } from "@/lib/money";
import { useI18n } from "@/lib/i18n/client";
import { FarcasterFollowPicker } from "@/components/new/FarcasterFollowPicker";
import { createSplitAction } from "./actions";

type SplitType = "simple" | "email" | "farcaster";
type FcUser = { fid: number; username: string; pfp: string | null };

// Two-step wizard: pick a split type, then configure it. The type sets the
// identity model (simple = accountless; email / farcaster = a secure split with
// invite-mode reservations). Ethereum/EVM is a planned third reserved type.
export function NewSplitForm({
  loggedIn,
  defaultCurrency,
  fcInvite,
}: {
  loggedIn: boolean;
  defaultCurrency: string;
  fcInvite: boolean;
}) {
  const { dict } = useI18n();
  const [step, setStep] = useState<1 | 2>(1);
  const [type, setType] = useState<SplitType>("simple");

  // Viewer's Farcaster identity (Mini App only) — gates the Farcaster type +
  // picker, and lets the creator pick themselves into a slot.
  const [fcFid, setFcFid] = useState<number | null>(null);
  const [fcSelf, setFcSelf] = useState<FcUser | null>(null);
  useEffect(() => {
    let active = true;
    import("@farcaster/miniapp-sdk")
      .then(async ({ sdk }) => {
        if (!(await sdk.isInMiniApp())) return;
        const ctx = await sdk.context;
        if (!active || !ctx?.user?.fid) return;
        setFcFid(ctx.user.fid);
        if (ctx.user.username)
          setFcSelf({
            fid: ctx.user.fid,
            username: ctx.user.username,
            pfp: ctx.user.pfpUrl ?? null,
          });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const farcasterAvailable = fcInvite && fcFid !== null;

  if (step === 2) {
    return (
      <ConfiguredForm
        type={type}
        defaultCurrency={defaultCurrency}
        fcFid={fcFid}
        fcSelf={fcSelf}
        onBack={() => setStep(1)}
      />
    );
  }

  const pick = (ty: SplitType) => {
    setType(ty);
    setStep(2);
  };

  const cards: {
    ty: SplitType;
    icon: string;
    title: string;
    desc: string;
    needsLogin: boolean;
    show: boolean;
  }[] = [
    { ty: "simple", icon: "🪙", title: dict.new.typeSimple, desc: dict.new.typeSimpleDesc, needsLogin: false, show: true },
    { ty: "email", icon: "✉️", title: dict.new.typeEmail, desc: dict.new.typeEmailDesc, needsLogin: true, show: true },
    { ty: "farcaster", icon: "🟣", title: dict.new.typeFarcaster, desc: dict.new.typeFarcasterDesc, needsLogin: true, show: farcasterAvailable },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-stone-500">
        {dict.new.typeHeading}
      </p>
      {cards
        .filter((c) => c.show)
        .map((c) =>
          c.needsLogin && !loggedIn ? (
            <Link
              key={c.ty}
              href="/login?next=/new"
              className="flex items-start gap-3 rounded-2xl border border-stone-200 p-4 text-left transition-colors hover:border-primary"
            >
              <span className="text-2xl">{c.icon}</span>
              <span>
                <span className="block text-sm font-semibold">{c.title}</span>
                <span className="block text-xs text-stone-400">
                  {c.desc} · {dict.new.signInRequired}
                </span>
              </span>
            </Link>
          ) : (
            <button
              key={c.ty}
              type="button"
              onClick={() => pick(c.ty)}
              className="flex w-full items-start gap-3 rounded-2xl border border-stone-200 p-4 text-left transition-colors hover:border-primary"
            >
              <span className="text-2xl">{c.icon}</span>
              <span>
                <span className="block text-sm font-semibold">{c.title}</span>
                <span className="block text-xs text-stone-400">{c.desc}</span>
              </span>
            </button>
          )
        )}
    </div>
  );
}

function ConfiguredForm({
  type,
  defaultCurrency,
  fcFid,
  fcSelf,
  onBack,
}: {
  type: SplitType;
  defaultCurrency: string;
  fcFid: number | null;
  fcSelf: FcUser | null;
  onBack: () => void;
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
  const [pickerRow, setPickerRow] = useState<number | null>(null);

  const secure = type !== "simple";
  const showInvite = type === "email" || type === "farcaster";

  // Currency: locale guess, but USD inside a Farcaster Mini App (settle in USDC).
  const [currency, setCurrency] = useState(defaultCurrency);
  const currencyTouched = useRef(false);
  useEffect(() => {
    let active = true;
    import("@farcaster/miniapp-sdk")
      .then(({ sdk }) => sdk.isInMiniApp())
      .then((m) => {
        if (active && m && !currencyTouched.current) setCurrency("USD");
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <form action={formAction} className="space-y-5">
      {/* Hidden config derived from the chosen type. */}
      {secure && <input type="hidden" name="secure" value="on" />}
      {showInvite && <input type="hidden" name="claim_mode" value="invite" />}
      {type === "farcaster" && (
        <input type="hidden" name="require_farcaster" value="on" />
      )}

      <button
        type="button"
        onClick={onBack}
        className="text-sm font-medium text-stone-500 hover:text-ink"
      >
        ← {dict.new.back}
      </button>

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
            <div key={i} className="flex gap-2">
              <Input
                name="name"
                value={row.name}
                onChange={(e) => setRow(i, { name: e.target.value })}
                placeholder={t(dict.new.participantPlaceholder, { n: i + 1 })}
                maxLength={40}
                required={i < 2}
                className="flex-1"
              />
              {type === "email" && (
                <Input
                  name="email"
                  value={row.invite}
                  onChange={(e) => setRow(i, { invite: e.target.value })}
                  type="email"
                  inputMode="email"
                  placeholder={dict.new.inviteEmailPlaceholder}
                  maxLength={120}
                  className="flex-1 text-sm"
                />
              )}
              {type === "farcaster" && (
                <>
                  <input type="hidden" name="email" value={row.invite} />
                  <button
                    type="button"
                    onClick={() => setPickerRow(i)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-stone-300 px-3 text-sm font-semibold text-[#855DCD] hover:border-[#855DCD]"
                  >
                    {row.invite ? row.invite : `👥 ${dict.new.fcPickFollows}`}
                  </button>
                </>
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
        {type === "email" && (
          <p className="mt-2 text-xs text-stone-400">{dict.new.emailInviteHint}</p>
        )}
        <p className="mt-1 text-xs text-stone-400">{dict.new.addLaterHint}</p>
      </div>

      {fcFid !== null && (
        <FarcasterFollowPicker
          fid={fcFid}
          self={fcSelf}
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

      {/* Secure-split options (who must sign in / who can view). */}
      {secure && (
        <div className="space-y-4 rounded-2xl border border-stone-200 p-4">
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
            <Radio
              name="visibility"
              value="link"
              defaultChecked={type !== "farcaster"}
              label={dict.new.visLink}
            />
            <Radio
              name="visibility"
              value="members"
              defaultChecked={type === "farcaster"}
              label={dict.new.visMembers}
            />
          </fieldset>
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
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-teal-600"
      />
      {label}
    </label>
  );
}
