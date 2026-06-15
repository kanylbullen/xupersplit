"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";

// Passwordless sign-in with a passkey (WebAuthn). Authenticates an existing
// passkey only — Supabase has no passkey sign-up (anonymous users can't
// register passkeys), so a passkey is added to an account created another way
// (email/wallet) via "Add a passkey" on the home screen, then used here.
// Works on the real domain (RP id = split.xuper.fun), not localhost.
export function PasskeyLoginButton() {
  const { dict } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setBusy(true);
    setError(null);
    try {
      const { data, error } = await createClient().auth.signInWithPasskey();
      if (error) throw error;
      if (data?.session) {
        track("passkey_login");
        router.push("/");
        router.refresh();
      }
    } catch (e) {
      setError(dict.login.passkeyError);
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
        onClick={signIn}
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
