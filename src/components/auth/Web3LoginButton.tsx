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
// On the web this uses the Reown/wagmi wallet — the wallet signs a SIWE message
// and Supabase issues a session. Inside a Farcaster Mini App we instead use
// native Quick Auth ("Sign in with Farcaster"): the host hands us a signed FID
// token with zero friction (no signature prompt), which our /api/fc/quickauth
// route bridges into a Supabase session. No password, no email either way.
function Web3LoginButtonInner() {
  const { dict } = useI18n();
  const router = useRouter();
  const { open } = useAppKit();
  const { isConnected, connector } = useAccount();
  const [busy, setBusy] = useState(false);
  const [inMiniApp, setInMiniApp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set when the user clicked our button, so we know to continue into signing
  // as soon as the wallet finishes connecting (the modal has no callback).
  const intent = useRef(false);

  // Detect the Farcaster Mini App host so we can offer one-tap sign-in.
  useEffect(() => {
    let active = true;
    import("@farcaster/miniapp-sdk")
      .then(({ sdk }) => sdk.isInMiniApp())
      .then((v) => active && setInMiniApp(v))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // SIWE over whatever EIP-1193 provider we were handed.
  const siweWith = useCallback(
    async (provider: unknown, via: "wallet" | "farcaster") => {
      setBusy(true);
      setError(null);
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithWeb3({
          chain: "ethereum",
          statement: "Sign in to xupersplit",
          wallet: provider,
        } as Parameters<typeof supabase.auth.signInWithWeb3>[0]);
        if (error) throw error;
        track("web3_login", { via });
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
    },
    [dict.login.web3Error, router]
  );

  // Web path: SIWE with the connected Reown/wagmi wallet.
  const signInWallet = useCallback(async () => {
    if (!connector) return;
    const provider = await connector.getProvider();
    await siweWith(provider, "wallet");
  }, [connector, siweWith]);

  // Mini App path: native Quick Auth — a signed FID token, no wallet signature.
  // We exchange it server-side for a one-time login token, then for a session.
  const signInFarcaster = useCallback(async () => {
    setBusy(true);
    setError(null);
    // TEMP: staged diagnostics so the in-app toast names the failing step.
    let stage = "sdk";
    try {
      const { sdk } = await import("@farcaster/miniapp-sdk");
      if (!sdk?.quickAuth?.getToken) throw new Error("quickAuth missing");
      stage = "token";
      const { token } = await sdk.quickAuth.getToken();
      if (!token) throw new Error("empty token");
      // Display fields (client-asserted) so the account shows a name/avatar.
      let username: string | undefined;
      let pfpUrl: string | undefined;
      try {
        const ctx = await sdk.context;
        username = ctx?.user?.username;
        pfpUrl = ctx?.user?.pfpUrl;
      } catch {
        // context is best-effort; the FID in the token is what matters
      }
      stage = "api";
      const res = await fetch("/api/fc/quickauth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, username, pfpUrl }),
      });
      if (!res.ok) {
        let detail = "";
        try {
          detail = JSON.stringify(await res.json());
        } catch {
          /* non-JSON body */
        }
        throw new Error(`${res.status} ${detail}`);
      }
      const { token_hash } = (await res.json()) as { token_hash: string };
      stage = "session";
      const { error } = await createClient().auth.verifyOtp({
        type: "magiclink",
        token_hash,
      });
      if (error) throw error;
      track("web3_login", { via: "farcaster" });
      router.push("/");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`FC [${stage}]: ${msg}`);
      if (e instanceof Error && process.env.NODE_ENV !== "production") {
        console.error(e);
      }
    } finally {
      setBusy(false);
      intent.current = false;
    }
  }, [router]);

  // Continue into signing once the wallet connects (web modal has no callback).
  useEffect(() => {
    if (!inMiniApp && intent.current && isConnected && connector && !busy) {
      void signInWallet();
    }
  }, [inMiniApp, isConnected, connector, busy, signInWallet]);

  function onClick() {
    setError(null);
    if (inMiniApp) {
      void signInFarcaster();
    } else if (isConnected && connector) {
      void signInWallet();
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
        {inMiniApp ? (
          <svg width="16" height="16" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="#855DCD" />
            <path
              d="M10 10h12M11 10v13M21 10v13M8.5 14h3M20.5 14h3"
              stroke="#fff"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 256 417" aria-hidden="true">
            <path fill="#8a92b2" d="M127.96 0l-2.79 9.5v275.67l2.79 2.78 127.96-75.64z" />
            <path fill="#62688f" d="M127.96 0L0 212.32l127.96 75.64V0z" />
            <path fill="#8a92b2" d="M127.96 312.19l-1.57 1.92v98.2l1.57 4.6 128.04-180.32z" />
            <path fill="#62688f" d="M127.96 416.91V312.19L0 236.59z" />
            <path fill="#454a75" d="M127.96 287.96l127.96-75.64-127.96-58.18z" />
            <path fill="#797596" d="M0 212.32l127.96 75.64V154.14z" />
          </svg>
        )}
        {busy
          ? dict.login.web3Signing
          : inMiniApp
            ? dict.login.farcaster
            : dict.login.web3}
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
