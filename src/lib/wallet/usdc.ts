// USDC is the one stablecoin deployed canonically on every chain we support,
// so the WalletConnect flow sends USDC (6 decimals) to the recipient's address
// on the payer's chosen chain. Native ETH/POL is intentionally out of scope for
// v1 — its amounts are volatile and "weird", and it needs per-chain price feeds.

export type EvmChainKey = "base" | "arbitrum" | "optimism" | "polygon" | "ethereum";

export const EVM_CHAINS: {
  key: EvmChainKey;
  id: number;
  label: string;
  usdc: `0x${string}`;
}[] = [
  { key: "base", id: 8453, label: "Base", usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },
  { key: "arbitrum", id: 42161, label: "Arbitrum", usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" },
  { key: "optimism", id: 10, label: "Optimism", usdc: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85" },
  { key: "polygon", id: 137, label: "Polygon", usdc: "0x3c499c542cEF5E3811e1192ce70d8cc03d5c3359" },
  { key: "ethereum", id: 1, label: "Ethereum", usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
];

export const USDC_DECIMALS = 6;

// USDC SPL mint on Solana mainnet (also 6 decimals).
export const SOLANA_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export const ERC20_TRANSFER_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

/** USD amount (e.g. 24.5) → USDC base units (6 decimals) as a bigint. */
export function usdToUsdcUnits(usd: number): bigint {
  return BigInt(Math.round(usd * 10 ** USDC_DECIMALS));
}
