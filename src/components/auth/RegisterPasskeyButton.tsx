"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";
import { useInMiniApp } from "@/lib/useInMiniApp";

// Shown to signed-in users: register a passkey on this account so they can use
// "Sign in with a passkey" next time. The SDK runs the WebAuthn create ceremony.
// Hidden inside the Farcaster Mini App — the host webview can't run WebAuthn
// against our RP there, so the ceremony always fails.
export function RegisterPasskeyButton() {
  const { dict } = useI18n();
  const inMiniApp = useInMiniApp();
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function register() {
    setState("busy");
    try {
      const { error } = await createClient().auth.registerPasskey();
      setState(error ? "error" : "done");
    } catch {
      setState("error");
    }
  }

  // No WebAuthn in the Mini App webview — don't offer a button that can't work.
  if (inMiniApp) return null;

  if (state === "done") {
    return (
      <span className="text-sm text-positive">{dict.nav.passkeyDone}</span>
    );
  }

  return (
    <button
      onClick={register}
      disabled={state === "busy"}
      className="text-sm font-medium text-stone-500 hover:text-ink disabled:opacity-50"
    >
      {state === "error" ? dict.nav.passkeyError : dict.nav.addPasskey}
    </button>
  );
}
