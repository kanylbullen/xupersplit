import type { NextConfig } from "next";

// The browser talks to Supabase at NEXT_PUBLIC_SUPABASE_URL. On Vercel that's
// https://<ref>.supabase.co (matched by *.supabase.co below); in the self-host
// Docker stack it's e.g. http://localhost:8000 — add that origin to connect-src
// so CSP doesn't block it.
function supabaseConnectSrc(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  try {
    if (url) return ` ${new URL(url).origin}`;
  } catch {
    /* ignore malformed */
  }
  return "";
}

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
      "connect-src 'self' https://*.supabase.co https://*.vercel-insights.com https://vitals.vercel-insights.com https://*.walletconnect.org https://*.walletconnect.com wss://*.walletconnect.org wss://*.walletconnect.com https://*.reown.com https://api.web3modal.org https://*.solana.com https://solana-rpc.publicnode.com" +
        supabaseConnectSrc(),
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
  // Self-contained server bundle for the Docker image (selfhost/).
  output: "standalone",
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Rebrand: the canonical domain is split.xuper.fun. Permanently redirect the
  // old tollysplit.xuper.fun host (query string preserved, so magic-link
  // /auth/confirm?token_hash=… still works). Inert on every other host.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "tollysplit.xuper.fun" }],
        destination: "https://split.xuper.fun/:path*",
        permanent: true,
      },
    ];
  },
  // Self-host only: Next acts as the Supabase gateway, routing /auth/v1 →
  // GoTrue and /rest/v1 → PostgREST. The browser then talks to the app's own
  // origin (no CORS), and NEXT_PUBLIC_SUPABASE_URL is just the app URL. On
  // Vercel this is off and the client talks to *.supabase.co directly.
  async rewrites() {
    if (process.env.SUPABASE_LOCAL_GATEWAY !== "1") return [];
    const auth = process.env.SUPABASE_AUTH_URL ?? "http://auth:9999";
    const rest = process.env.SUPABASE_REST_URL ?? "http://rest:3000";
    return [
      { source: "/auth/v1/:path*", destination: `${auth}/:path*` },
      { source: "/rest/v1/:path*", destination: `${rest}/:path*` },
    ];
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
