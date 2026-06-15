import { ImageResponse } from "next/og";

// 3:2 launch-card image for the Farcaster Mini App embed (fc:miniapp).
// Generic + crypto-forward — leads with the differentiator. No split data here
// (splits are private), so this is safe to cache publicly.
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#faf8f4",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 96,
              height: 96,
              borderRadius: 24,
              background: "#0d9488",
            }}
          >
            <svg width="60" height="60" viewBox="0 0 64 64" fill="none">
              <path d="M16 16 L16 48 L32 32 Z" fill="#fff" />
              <path d="M48 16 L48 48 L32 32 Z" fill="#f59e0b" />
            </svg>
          </div>
          <div style={{ fontSize: 56, fontWeight: 800, color: "#0d9488", letterSpacing: -1 }}>
            xupersplit
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, fontWeight: 800, color: "#1c1917", lineHeight: 1.05, letterSpacing: -2 }}>
            Split the bill.
          </div>
          <div style={{ fontSize: 88, fontWeight: 800, color: "#0d9488", lineHeight: 1.05, letterSpacing: -2 }}>
            Settle onchain.
          </div>
          <div style={{ fontSize: 36, color: "#57534e", marginTop: 28, maxWidth: 960 }}>
            Group expenses, settled in USDC or sats. No account — just a link.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, color: "#78716c" }}>
          <div style={{ display: "flex", height: 10, width: 10, borderRadius: 5, background: "#f59e0b" }} />
          Lightning · USDC on Base &amp; Solana · Swish · IBAN
        </div>
      </div>
    ),
    { width: 1200, height: 800 }
  );
}
