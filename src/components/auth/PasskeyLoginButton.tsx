"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";

// Passwordless passkey auth (WebAuthn). Works on the real domain (RP id =
// split.xuper.fun), not localhost.
//   • Sign in: signInWithPasskey() — authenticates an existing passkey.
//   • Create:  signInAnonymously() → registerPasskey() — Supabase has no direct
//     passkey sign-up, so we make an anonymous account and attach a passkey to
//     it; the result is an email-less, passkey-backed account.
export function PasskeyLoginButton() {
  const { dict } = useI18n();
  const router = useRouter();
  const [mode, setMode] = useState<null | "signin" | "create">(null);
  const [error, setError] = useState<string | null>(null);

  function logDev(e: unknown) {
    if (e instanceof Error && process.env.NODE_ENV !== "production") {
      console.error(e);
    }
  }

  async function signIn() {
    setMode("signin");
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
      logDev(e);
    } finally {
      setMode(null);
    }
  }

  async function createAccount() {
    setMode("create");
    setError(null);
    const supabase = createClient();
    try {
      const { error: anonErr } = await supabase.auth.signInAnonymously();
      if (anonErr) throw anonErr;
      const { error: regErr } = await supabase.auth.registerPasskey();
      if (regErr) {
        // Don't leave an anonymous account with no way back in.
        await supabase.auth.signOut();
        throw regErr;
      }
      track("passkey_signup");
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(dict.login.passkeyCreateError);
      logDev(e);
    } finally {
      setMode(null);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={signIn}
        disabled={mode !== null}
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
        {mode === "signin" ? dict.login.passkeySigning : dict.login.passkey}
      </button>
      <button
        type="button"
        onClick={createAccount}
        disabled={mode !== null}
        className="w-full text-center text-sm font-medium text-stone-500 hover:text-ink disabled:opacity-50"
      >
        {mode === "create" ? dict.login.passkeyCreating : dict.login.passkeyCreate}
      </button>
      {error && <p className="text-sm text-negative">{error}</p>}
    </div>
  );
}
