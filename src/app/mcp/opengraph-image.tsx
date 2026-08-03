import { ImageResponse } from "next/og";

// Share card for /mcp specifically — the site-wide card sells the app to a
// person, which is the wrong pitch when someone drops this link in a
// developer channel. Same brand furniture as ../opengraph-image.tsx, but the
// headline and the endpoint are the point.
export const alt = "Xupersplit MCP server — connect an AI agent, no account needed";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
        {/* Brand row: logo mark + wordmark */}
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
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "#0d9488",
              letterSpacing: -1,
            }}
          >
            xupersplit
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              color: "#1c1917",
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            Works with
          </div>
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              color: "#0d9488",
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            AI agents.
          </div>
          <div style={{ fontSize: 38, color: "#57534e", marginTop: 28, maxWidth: 940 }}>
            An MCP server for splitting expenses. No account, no API key.
          </div>
        </div>

        {/* The endpoint is the actionable bit — show it like a command. */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              height: 10,
              width: 10,
              borderRadius: 5,
              background: "#f59e0b",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#1c1917",
              background: "#efece5",
              borderRadius: 12,
              padding: "14px 24px",
            }}
          >
            split.xuper.fun/api/mcp
          </div>
        </div>
      </div>
    ),
    size
  );
}
