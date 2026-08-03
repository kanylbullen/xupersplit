"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";
import { LOCALE_INTL } from "@/lib/i18n/config";
import { guessDeviceName } from "@/lib/deviceName";
import { Button, Dialog, Input, Label } from "@/components/ui";

// Shape of GET /passkeys. Declared locally rather than imported from
// @supabase/auth-js, which is a transitive dependency.
type Passkey = {
  id: string;
  friendly_name?: string;
  created_at: string;
  last_used_at?: string;
};

export function PasskeysDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { dict, t, locale } = useI18n();
  const intl = LOCALE_INTL[locale];
  const [items, setItems] = useState<Passkey[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState("");
  const [savingName, setSavingName] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await createClient().auth.passkey.list();
    if (error) {
      setError(dict.passkeys.errList);
      setItems([]);
      return;
    }
    setError(null);
    setItems(data ?? []);
  }, [dict]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  // Prefill the name field with the device the user is on — most people keep it.
  useEffect(() => {
    if (open) setNewName(guessDeviceName() ?? "");
  }, [open]);

  async function add() {
    setAdding(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.registerPasskey();
      if (error || !data) {
        setError(dict.nav.passkeyError);
      } else {
        // Naming is a second call, so a failure here leaves an unnamed but
        // perfectly working passkey — not worth an error the user can't act on.
        const name = newName.trim();
        if (name) {
          await supabase.auth.passkey.update({
            passkeyId: data.id,
            friendlyName: name,
          });
        }
        await load();
      }
    } catch {
      setError(dict.nav.passkeyError);
    }
    setAdding(false);
  }

  async function rename(id: string) {
    const name = renameText.trim();
    if (!name) return;
    setSavingName(true);
    setError(null);
    try {
      const { error } = await createClient().auth.passkey.update({
        passkeyId: id,
        friendlyName: name,
      });
      if (error) setError(dict.passkeys.errRename);
      await load();
    } catch {
      setError(dict.passkeys.errRename);
    }
    setSavingName(false);
    setRenamingId(null);
  }

  async function remove(id: string) {
    setRemovingId(id);
    setError(null);
    try {
      const { error } = await createClient().auth.passkey.delete({
        passkeyId: id,
      });
      if (error) setError(dict.passkeys.errRemove);
      await load();
    } catch {
      setError(dict.passkeys.errRemove);
    }
    setRemovingId(null);
  }

  const busy = adding || removingId !== null || savingName;
  const date = (iso: string) => new Date(iso).toLocaleDateString(intl);

  return (
    <Dialog
      open={open}
      onClose={() => {
        // Don't leave a row armed for deletion the next time it opens.
        setConfirmId(null);
        onClose();
      }}
      title={dict.passkeys.title}
    >
      <p className="mb-4 text-sm text-stone-500">{dict.passkeys.intro}</p>

      {error && <p className="mb-3 text-sm text-negative">{error}</p>}

      {items === null ? (
        <p className="mb-4 text-sm text-stone-400">{dict.passkeys.loading}</p>
      ) : items.length === 0 ? (
        <p className="mb-4 text-sm text-stone-400">{dict.passkeys.empty}</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {items.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-stone-200/80 px-3 py-2.5"
            >
              {renamingId === p.id ? (
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    rename(p.id);
                  }}
                >
                  <input
                    value={renameText}
                    onChange={(e) => setRenameText(e.target.value)}
                    maxLength={60}
                    autoFocus
                    className="min-w-0 flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={busy || renameText.trim().length === 0}
                    className="text-sm font-semibold text-primary hover:text-primary-dark disabled:opacity-50"
                  >
                    {dict.common.save}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenamingId(null)}
                    className="text-sm text-stone-400 hover:text-ink"
                  >
                    {dict.common.cancel}
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">
                      {p.friendly_name || dict.passkeys.unnamed}
                    </div>
                    <div className="text-xs text-stone-400">
                      {t(dict.passkeys.added, { date: date(p.created_at) })} ·{" "}
                      {p.last_used_at
                        ? t(dict.passkeys.lastUsed, {
                            date: date(p.last_used_at),
                          })
                        : dict.passkeys.neverUsed}
                    </div>
                    <button
                      onClick={() => {
                        setRenamingId(p.id);
                        setRenameText(p.friendly_name ?? "");
                        setConfirmId(null);
                      }}
                      className="mt-1 text-xs text-stone-400 hover:text-primary-dark"
                    >
                      {dict.passkeys.rename}
                    </button>
                  </div>
                  <Button
                    variant="danger"
                    disabled={busy}
                    onClick={() =>
                      confirmId === p.id ? remove(p.id) : setConfirmId(p.id)
                    }
                  >
                    {confirmId === p.id
                      ? dict.passkeys.removeConfirm
                      : dict.common.delete}
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Name first, then register — the click on the button is the user
          gesture WebAuthn needs, so nothing is lost by asking up front. */}
      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <div className="min-w-0 flex-1">
          <Label htmlFor="passkey-name">{dict.passkeys.nameLabel}</Label>
          <Input
            id="passkey-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={dict.passkeys.namePlaceholder}
            maxLength={60}
          />
        </div>
        <Button type="submit" disabled={busy} className="whitespace-nowrap">
          {adding ? dict.passkeys.adding : dict.nav.addPasskey}
        </Button>
      </form>
    </Dialog>
  );
}
