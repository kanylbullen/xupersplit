import type { NextConfig } from "next";

// Security headers. Referrer-Policy is the important one here: the secret
// kitty key lives in the URL (/k/<key>), and no-referrer keeps it out of the
// Referer header on any outbound navigation (e.g. the buy-me-a-beer link).
const securityHeaders = [
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next injects small inline bootstrap scripts; next-themes sets an
      // inline theme script before hydration.
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      // Swish QR is proxied same-origin via /api/swish-qr; wallet logos in the
      // WalletConnect modal load from arbitrary wallet-specified CDNs.
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      // Supabase REST/Auth + Vercel analytics + WalletConnect/Reown relay,
      // RPC proxy and config API (only contacted once the wallet flow opens).
      "connect-src 'self' https://*.supabase.co https://*.vercel-insights.com https://vitals.vercel-insights.com https://*.walletconnect.org https://*.walletconnect.com wss://*.walletconnect.org wss://*.walletconnect.com https://*.reown.com https://api.web3modal.org",
      // WalletConnect's attestation iframe.
      "frame-src 'self' https://verify.walletconnect.org https://secure.walletconnect.org",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    // wagmi's experimental "tempo" connector does an optional
    // `import('accounts')` guarded by .catch(); Turbopack tries to resolve it
    // statically and fails the build. Alias it (and the usual optional deps)
    // to an empty module.
    resolveAlias: {
      accounts: "./src/lib/wallet/noop.js",
      "pino-pretty": "./src/lib/wallet/noop.js",
      lokijs: "./src/lib/wallet/noop.js",
      encoding: "./src/lib/wallet/noop.js",
    },
  },
};

export default nextConfig;
