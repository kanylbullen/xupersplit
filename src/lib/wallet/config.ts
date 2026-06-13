import { cookieStorage, createStorage } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { SolanaAdapter } from "@reown/appkit-adapter-solana";
import {
  base,
  arbitrum,
  optimism,
  polygon,
  mainnet,
  solana,
} from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";

// Reown (WalletConnect) project id — free, from cloud.reown.com. Public by
// design (embedded in the client). When absent the wallet flow is disabled
// and the crypto pay dialogs fall back to QR + copy.
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

// EVM chains the payer can send USDC on (one wagmi adapter), plus Solana
// (its own adapter). Same recipient address per ecosystem.
export const evmNetworks: [AppKitNetwork, ...AppKitNetwork[]] = [
  base,
  arbitrum,
  optimism,
  polygon,
  mainnet,
];
export const allNetworks: [AppKitNetwork, ...AppKitNetwork[]] = [
  ...evmNetworks,
  solana,
];

export const wagmiAdapter = projectId
  ? new WagmiAdapter({
      storage: createStorage({ storage: cookieStorage }),
      ssr: true,
      projectId,
      networks: evmNetworks,
    })
  : null;

export const solanaAdapter = projectId ? new SolanaAdapter() : null;
