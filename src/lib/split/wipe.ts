import { balances } from "@/lib/money";
import type { SplitData } from "@/lib/types";

/** The slice of a Supabase client this module needs. */
type RpcClient = {
  rpc(fn: string, args: Record<string, unknown>): PromiseLike<{ data: unknown }>;
};

/**
 * Privacy: once a transfer makes everyone square, the stored payment methods
 * have served their purpose — wipe them. Skipped when the split opted to keep
 * payment info (long-running splits).
 *
 * Called after every transfer, from both the web server action and the MCP
 * server, so an agent settling the last debt wipes just like the UI does.
 * Returns true when a wipe happened, so callers can revalidate.
 */
export async function clearPaymentMethodsIfSettled(
  supabase: RpcClient,
  key: string
): Promise<boolean> {
  const { data } = await supabase.rpc("split_data", { p_key: key });
  const split = data as (SplitData & { not_found?: boolean }) | null;
  if (!split || split.not_found || !split.participants) return false;
  if (split.split?.keep_payment_methods) return false;

  const hasMethods = split.participants.some((p) => p.payment_methods?.length > 0);
  if (!hasMethods) return false;

  const allSquare = [...balances(split.participants, split.entries).values()].every(
    (v) => v === 0
  );
  if (!allSquare) return false;

  await supabase.rpc("clear_payment_methods", { p_key: key });
  return true;
}
