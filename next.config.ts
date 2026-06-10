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
      // Swish QR is proxied same-origin via /api/swish-qr.
      "img-src 'self' data: blob:",
      "font-src 'self'",
      // Supabase REST/Auth + Vercel analytics ingestion.
      "connect-src 'self' https://*.supabase.co https://*.vercel-insights.com https://vitals.vercel-insights.com",
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
};

export default nextConfig;
