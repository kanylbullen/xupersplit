"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";
import { LOCALE_INTL } from "@/lib/i18n/config";
import { guessDeviceName } from "@/lib/deviceName";
import { Button, Dialog } from "@/components/ui";

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

  async function add() {
    setAdding(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.registerPasskey();
      if (error || !data) {
        setError(dict.nav.passkeyError);
      } else {
        // Cosmetic — the passkey is already registered, so a failed rename is
        // not worth surfacing as an error.
        const name = guessDeviceName();
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

  const busy = adding || removingId !== null;
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
              className="flex items-center justify-between gap-3 rounded-xl border border-stone-200/80 px-3 py-2.5"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                  {p.friendly_name || dict.passkeys.unnamed}
                </div>
                <div className="text-xs text-stone-400">
                  {t(dict.passkeys.added, { date: date(p.created_at) })} ·{" "}
                  {p.last_used_at
                    ? t(dict.passkeys.lastUsed, { date: date(p.last_used_at) })
                    : dict.passkeys.neverUsed}
                </div>
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
            </li>
          ))}
        </ul>
      )}

      <Button onClick={add} disabled={busy}>
        {adding ? dict.passkeys.adding : dict.nav.addPasskey}
      </Button>
    </Dialog>
  );
}
