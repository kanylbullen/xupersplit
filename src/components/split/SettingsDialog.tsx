"use client";

import { useEffect, useState, useTransition } from "react";
import { useTheme } from "next-themes";
import type { Split, Participant } from "@/lib/types";
import { CURRENCIES } from "@/lib/money";
import Link from "next/link";
import {
  addParticipantAction,
  deleteParticipantAction,
  renameParticipantAction,
  setAutoPurgeAction,
  setPaymentMethodAction,
  updateSplitAction,
} from "@/app/k/[key]/actions";
import {
  PAYMENT_META,
  PAYMENT_TYPES,
  type PaymentType,
  formatPayment,
  normalizePayment,
} from "@/lib/payment";
import { Button, Dialog, Input, Label, Select } from "@/components/ui";

export function SettingsDialog({
  open,
  onClose,
  split,
  participants,
  meId,
  onIdentityReset,
}: {
  open: boolean;
  onClose: () => void;
  split: Split;
  participants: Participant[];
  meId: string | null;
  onIdentityReset: () => void;
}) {
  const [title, setTitle] = useState(split.title);
  const [currency, setCurrency] = useState(split.currency);
  const [newName, setNewName] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameText, setRenameText] = useState("");
  const [payEditing, setPayEditing] = useState<string | null>(null);
  const [payType, setPayType] = useState<PaymentType>("swish");
  const [payText, setPayText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      setTitle(split.title);
      setCurrency(split.currency);
      setNewName("");
      setRenaming(null);
      setError(null);
    }
  }, [open, split.title, split.currency]);

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error ?? "Något gick fel.");
    });
  }

  const dirty = title.trim() !== split.title || currency !== split.currency;

  return (
    <Dialog open={open} onClose={onClose} title="Inställningar">
      <div className="space-y-6">
        <section className="space-y-3">
          <div>
            <Label htmlFor="split-title">Namn</Label>
            <Input
              id="split-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
            />
          </div>
          <div>
            <Label htmlFor="split-currency">Valuta</Label>
            <Select
              id="split-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          {dirty && (
            <Button
              onClick={() =>
                run(() => updateSplitAction(split.key, title, currency))
              }
              disabled={pending || title.trim().length === 0}
            >
              Spara ändringar
            </Button>
          )}
        </section>

        <section>
          <Label>Deltagare</Label>
          <div className="overflow-hidden rounded-xl border border-stone-200">
            {participants.map((p, i) => (
              <div
                key={p.id}
                className={`px-3 py-2.5 ${i > 0 ? "border-t border-stone-100" : ""}`}
              >
              <div className="flex items-center gap-2">
                {renaming === p.id ? (
                  <>
                    <input
                      value={renameText}
                      onChange={(e) => setRenameText(e.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm outline-none focus:border-primary"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        run(() =>
                          renameParticipantAction(split.key, p.id, renameText)
                        );
                        setRenaming(null);
                      }}
                      disabled={pending || renameText.trim().length === 0}
                      className="text-sm font-semibold text-primary hover:text-primary-dark"
                    >
                      Spara
                    </button>
                    <button
                      onClick={() => setRenaming(null)}
                      className="text-sm text-stone-400 hover:text-ink"
                    >
                      Avbryt
                    </button>
                  </>
                ) : (
                  <>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {p.name}
                      {meId === p.id && (
                        <span className="ml-1.5 rounded-md bg-primary-soft px-1.5 py-0.5 text-xs font-bold text-primary-dark">
                          du
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => {
                        setRenaming(p.id);
                        setRenameText(p.name);
                      }}
                      className="text-sm text-stone-400 hover:text-ink"
                    >
                      Byt namn
                    </button>
                    <button
                      onClick={() =>
                        run(() => deleteParticipantAction(split.key, p.id))
                      }
                      disabled={pending}
                      className="text-sm text-stone-400 hover:text-negative"
                    >
                      Ta bort
                    </button>
                  </>
                )}
              </div>
              {payEditing === p.id ? (
                <form
                  className="mt-1.5 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (payText.trim() === "") {
                      run(() => setPaymentMethodAction(split.key, p.id, null, null));
                      setPayEditing(null);
                      return;
                    }
                    const normalized = normalizePayment(payType, payText);
                    if (!normalized) {
                      setError("Ogiltig uppgift — kontrollera numret eller IBAN.");
                      return;
                    }
                    run(() => setPaymentMethodAction(split.key, p.id, payType, normalized));
                    setPayEditing(null);
                  }}
                >
                  <select
                    value={payType}
                    onChange={(e) => setPayType(e.target.value as PaymentType)}
                    className="rounded-lg border border-stone-300 bg-surface px-1.5 py-1.5 text-sm outline-none focus:border-primary"
                  >
                    {PAYMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {PAYMENT_META[t].label}
                      </option>
                    ))}
                  </select>
                  <input
                    inputMode={PAYMENT_META[payType].kind === "iban" ? "text" : "tel"}
                    placeholder={`${PAYMENT_META[payType].placeholder} (tomt = ta bort)`}
                    value={payText}
                    onChange={(e) => setPayText(e.target.value)}
                    autoFocus
                    className="min-w-0 flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={pending}
                    className="text-sm font-semibold text-primary hover:text-primary-dark"
                  >
                    Spara
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayEditing(null)}
                    className="text-sm text-stone-400 hover:text-ink"
                  >
                    Avbryt
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setPayEditing(p.id);
                    setPayType(p.payment_type ?? "swish");
                    setPayText(p.payment_value ?? "");
                  }}
                  className="mt-0.5 text-xs text-stone-400 hover:text-primary-dark"
                >
                  {p.payment_type && p.payment_value
                    ? `${PAYMENT_META[p.payment_type].label}: ${formatPayment(p.payment_type, p.payment_value)} · ändra`
                    : "+ Lägg till betalsätt"}
                </button>
              )}
              </div>
            ))}
          </div>
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const name = newName.trim();
              if (!name) return;
              run(() => addParticipantAction(split.key, name));
              setNewName("");
            }}
          >
            <Input
              placeholder="Ny deltagare"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={40}
            />
            <Button
              type="submit"
              variant="secondary"
              disabled={pending || newName.trim().length === 0}
            >
              Lägg till
            </Button>
          </form>
          <p className="mt-1.5 text-xs text-stone-400">
            Deltagare med bokförda poster kan inte tas bort.
          </p>
        </section>

        <section>
          <Label>Utseende</Label>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-stone-100 p-1">
            {(
              [
                ["light", "Ljust"],
                ["dark", "Mörkt"],
                ["system", "System"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  mounted && theme === value
                    ? "bg-surface text-ink shadow-sm"
                    : "text-stone-500 hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-stone-400">
            System följer enhetens ljusa/mörka läge.
          </p>
        </section>

        <section>
          <Label>Integritet</Label>
          {split.has_owner ? (
            <label className="flex cursor-pointer items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={split.auto_purge}
                disabled={pending}
                onChange={(e) =>
                  run(() => setAutoPurgeAction(split.key, e.target.checked))
                }
                className="mt-0.5 h-4 w-4 accent-teal-600"
              />
              <span>
                Radera den här tollyspliten automatiskt efter 6 månader utan
                aktivitet
              </span>
            </label>
          ) : (
            <p className="text-sm text-stone-500">
              Den här tollyspliten raderas automatiskt efter 6 månader utan
              aktivitet. Skapa splits inloggad om du vill kunna stänga av
              gallringen.
            </p>
          )}
          <p className="mt-1.5 text-xs text-stone-400">
            Betaluppgifter raderas automatiskt när alla är kvitt. Läs mer i{" "}
            <Link
              href="/integritet"
              className="text-primary hover:text-primary-dark"
            >
              integritetspolicyn
            </Link>
            .
          </p>
        </section>

        <section>
          <button
            onClick={() => {
              onIdentityReset();
              onClose();
            }}
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            Byt vem du är på den här enheten
          </button>
        </section>

        {error && <p className="text-sm text-negative">{error}</p>}
      </div>
    </Dialog>
  );
}
