"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import { createClient } from "@/lib/supabase/client";
import { walletEnabled } from "@/components/split/WalletProvider";
import { useI18n } from "@/lib/i18n/client";

// Sign in with Ethereum (EIP-4361 / SIWE) via Supabase Auth's Web3 provider.
// Reuses the same Reown/wagmi wallet the payment flow already uses — the wallet
// signs a SIWE message, Supabase verifies the signature and issues a session.
// No password, no email. Only shown when WalletConnect is configured.
function Web3LoginButtonInner() {
  const { dict } = useI18n();
  const router = useRouter();
  const { open } = useAppKit();
  const { isConnected, connector } = useAccount();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set when the user clicked our button, so we know to continue into signing
  // as soon as the wallet finishes connecting (the modal has no callback).
  const intent = useRef(false);

  const signIn = useCallback(async () => {
    if (!connector) return;
    setBusy(true);
    setError(null);
    try {
      const provider = await connector.getProvider();
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithWeb3({
        chain: "ethereum",
        statement: "Sign in to Tollysplit",
        wallet: provider,
      } as Parameters<typeof supabase.auth.signInWithWeb3>[0]);
      if (error) throw error;
      track("web3_login");
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(dict.login.web3Error);
      if (e instanceof Error && process.env.NODE_ENV !== "production") {
        console.error(e);
      }
    } finally {
      setBusy(false);
      intent.current = false;
    }
  }, [connector, dict.login.web3Error, router]);

  // Continue into signing once the wallet connects (if the user started it).
  useEffect(() => {
    if (intent.current && isConnected && connector && !busy) {
      void signIn();
    }
  }, [isConnected, connector, busy, signIn]);

  function onClick() {
    setError(null);
    if (isConnected && connector) {
      void signIn();
    } else {
      intent.current = true;
      open();
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-xs text-stone-400">
        <span className="h-px flex-1 bg-stone-200" />
        {dict.login.orWallet}
        <span className="h-px flex-1 bg-stone-200" />
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 bg-surface px-4 py-3 font-semibold text-ink transition-colors hover:border-primary disabled:opacity-50"
      >
        <svg width="16" height="16" viewBox="0 0 256 417" aria-hidden="true">
          <path fill="#8a92b2" d="M127.96 0l-2.79 9.5v275.67l2.79 2.78 127.96-75.64z" />
          <path fill="#62688f" d="M127.96 0L0 212.32l127.96 75.64V0z" />
          <path fill="#8a92b2" d="M127.96 312.19l-1.57 1.92v98.2l1.57 4.6 128.04-180.32z" />
          <path fill="#62688f" d="M127.96 416.91V312.19L0 236.59z" />
          <path fill="#454a75" d="M127.96 287.96l127.96-75.64-127.96-58.18z" />
          <path fill="#797596" d="M0 212.32l127.96 75.64V154.14z" />
        </svg>
        {busy ? dict.login.web3Signing : dict.login.web3}
      </button>
      {error && <p className="text-sm text-negative">{error}</p>}
    </div>
  );
}

/** Renders the SIWE button only when the wallet stack is configured. */
export function Web3LoginButton() {
  if (!walletEnabled) return null;
  return <Web3LoginButtonInner />;
}
