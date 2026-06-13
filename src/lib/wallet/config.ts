import { cookieStorage, createStorage } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { base, arbitrum, optimism, polygon, mainnet } from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";

// Reown (WalletConnect) project id — free, from cloud.reown.com. Public by
// design (embedded in the client). When absent the wallet flow is disabled
// and the EVM pay dialog falls back to QR + copy.
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

// Chains we let the payer send USDC on. Same recipient address on all of them;
// the payer picks whichever is cheapest. Order = display order.
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  base,
  arbitrum,
  optimism,
  polygon,
  mainnet,
];

export const wagmiAdapter = projectId
  ? new WagmiAdapter({
      storage: createStorage({ storage: cookieStorage }),
      ssr: true,
      projectId,
      networks,
    })
  : null;
