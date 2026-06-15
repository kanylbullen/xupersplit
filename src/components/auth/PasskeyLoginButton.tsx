"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";

// One passkey button (WebAuthn): sign in with an existing passkey, or — if
// there isn't one — create an account and register a passkey to it
// (signInAnonymously → registerPasskey, since Supabase has no direct passkey
// sign-up). Works on the real domain (RP id = split.xuper.fun), not localhost.
export function PasskeyLoginButton() {
  const { dict } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    try {
      // 1) Try an existing passkey.
      const { data, error } = await supabase.auth.signInWithPasskey();
      if (!error && data?.session) {
        track("passkey_login");
        router.push("/");
        router.refresh();
        return;
      }
      // 2) None usable → create an account and register a passkey to it.
      const { error: anonErr } = await supabase.auth.signInAnonymously();
      if (anonErr) throw anonErr;
      const { error: regErr } = await supabase.auth.registerPasskey();
      if (regErr) {
        await supabase.auth.signOut();
        throw regErr;
      }
      track("passkey_signup");
      router.push("/");
      router.refresh();
    } catch (e) {
      // Surface the real message while we stabilise the passkey flow.
      setError(e instanceof Error ? e.message : dict.login.passkeyError);
      if (e instanceof Error && process.env.NODE_ENV !== "production") {
        console.error(e);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 bg-surface px-4 py-3 font-semibold text-ink transition-colors hover:border-primary disabled:opacity-50"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="9" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            d="M21 11a3 3 0 1 0-4 2.83V21l1.5-1.5L20 21v-7.17A3 3 0 0 0 21 11Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M2 21a7 7 0 0 1 10-6.32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {busy ? dict.login.passkeySigning : dict.login.passkey}
      </button>
      {error && <p className="text-sm text-negative">{error}</p>}
    </div>
  );
}
