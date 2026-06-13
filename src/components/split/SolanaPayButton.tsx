"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
  useDisconnect,
} from "@reown/appkit/react";
import { useAppKitConnection, type Provider } from "@reown/appkit-adapter-solana/react";
import {
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { SOLANA_USDC_MINT, usdToUsdcUnits } from "@/lib/wallet/usdc";
import { useI18n } from "@/lib/i18n/client";

// One-tap prefilled USDC payment on Solana. Builds an SPL transfer for the
// exact debt; if the recipient has no USDC token account yet, the payer
// creates it in the same transaction (small SOL rent). Funds never touch us.
export function SolanaPayButton({
  toAddress,
  usd,
}: {
  toAddress: string;
  usd: number | null;
}) {
  const { dict, t } = useI18n();
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount({ namespace: "solana" });
  const { connection } = useAppKitConnection();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { disconnect } = useDisconnect();

  const [busy, setBusy] = useState(false);
  const [sig, setSig] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const usdcLabel = usd !== null ? usd.toFixed(2) : null;

  async function pay() {
    if (usd === null || !address || !connection || !walletProvider) return;
    setError(null);
    setBusy(true);
    try {
      const conn = connection as Connection;
      const from = new PublicKey(address);
      const to = new PublicKey(toAddress);
      const mint = new PublicKey(SOLANA_USDC_MINT);
      const fromAta = await getAssociatedTokenAddress(mint, from);
      const toAta = await getAssociatedTokenAddress(mint, to);

      const tx = new Transaction();
      // Create the recipient's USDC account if they've never held USDC.
      let toExists = true;
      try {
        await getAccount(conn, toAta);
      } catch {
        toExists = false;
      }
      if (!toExists) {
        tx.add(createAssociatedTokenAccountInstruction(from, toAta, to, mint));
      }
      tx.add(
        createTransferInstruction(fromAta, toAta, from, usdToUsdcUnits(usd))
      );
      tx.feePayer = from;
      tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;

      const signature = await walletProvider.sendTransaction(tx, conn);
      setSig(signature);
      track("solana_pay_sent");
    } catch (e) {
      setError(dict.pay.walletError);
      if (e instanceof Error && process.env.NODE_ENV !== "production") {
        console.error(e);
      }
    } finally {
      setBusy(false);
    }
  }

  if (sig) {
    return (
      <p className="w-full rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-semibold text-positive">
        {dict.pay.walletSent}
      </p>
    );
  }

  return (
    <div className="w-full space-y-2">
      {!isConnected ? (
        <button
          onClick={() => open({ view: "Connect", namespace: "solana" })}
          className="w-full rounded-xl bg-primary px-4 py-3 font-bold text-white shadow-md transition-colors hover:bg-primary-dark"
        >
          {dict.pay.walletConnect}
        </button>
      ) : (
        <>
          <button
            onClick={pay}
            disabled={busy || usd === null}
            className="w-full rounded-xl bg-primary px-4 py-3 font-bold text-white shadow-md transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {busy
              ? dict.pay.walletAwaiting
              : usdcLabel
                ? t(dict.pay.walletPay, { amount: usdcLabel })
                : dict.pay.walletPayGeneric}
          </button>
          <div className="flex items-center justify-center gap-1.5 text-xs text-stone-400">
            {address && (
              <span className="font-mono">
                {address.slice(0, 4)}…{address.slice(-4)}
              </span>
            )}
            <span>·</span>
            <button
              onClick={() => disconnect()}
              disabled={busy}
              className="font-semibold text-stone-500 underline hover:text-primary-dark disabled:opacity-50"
            >
              {dict.pay.walletDisconnect}
            </button>
          </div>
        </>
      )}
      {error && <p className="text-center text-sm text-negative">{error}</p>}
    </div>
  );
}
