"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import { createClient } from "@/lib/supabase/client";
import { walletEnabled } from "@/components/split/WalletProvider";
import { useI18n } from "@/lib/i18n/client";

// Sign in with Solana (SIWS) via Supabase Auth's Web3 provider. Uses the
// injected Solana wallet (window.solana — Phantom/Solflare/etc.). Identity is
// the Solana address. Only shown when the wallet stack is configured.
function SolanaLoginButtonInner() {
  const { dict } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setBusy(true);
    setError(null);
    try {
      const { error } = await createClient().auth.signInWithWeb3({
        chain: "solana",
        statement: "Sign in to xupersplit",
      } as Parameters<
        ReturnType<typeof createClient>["auth"]["signInWithWeb3"]
      >[0]);
      if (error) throw error;
      track("web3_login", { via: "solana" });
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(dict.login.web3Error);
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
        <svg width="15" height="15" viewBox="0 0 398 312" aria-hidden="true">
          <defs>
            <linearGradient id="sol" x1="360" y1="-30" x2="140" y2="340" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#00FFA3" />
              <stop offset="1" stopColor="#DC1FFF" />
            </linearGradient>
          </defs>
          <path fill="url(#sol)" d="M64 237a13 13 0 0 1 9-4h317a6 6 0 0 1 5 11l-63 63a13 13 0 0 1-9 4H6a6 6 0 0 1-5-11z" />
          <path fill="url(#sol)" d="M64 1a13 13 0 0 1 9-4h317a6 6 0 0 1 5 11l-63 63a13 13 0 0 1-9 4H6a6 6 0 0 1-5-11z" />
          <path fill="url(#sol)" d="M334 118a13 13 0 0 0-9-4H8a6 6 0 0 0-5 11l63 63a13 13 0 0 0 9 4h317a6 6 0 0 0 5-11z" />
        </svg>
        {busy ? dict.login.web3Signing : dict.login.solana}
      </button>
      {error && <p className="text-sm text-negative">{error}</p>}
    </div>
  );
}

export function SolanaLoginButton() {
  if (!walletEnabled) return null;
  return <SolanaLoginButtonInner />;
}
