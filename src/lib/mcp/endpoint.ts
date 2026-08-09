import { APP_ORIGIN } from "@/lib/miniapp";

// The public MCP endpoint. Shown on both /mcp and the landing page, so it lives
// here rather than being written out twice; the route itself is
// src/app/api/mcp/route.ts and server.json advertises the same URL.
export const MCP_ENDPOINT = `${APP_ORIGIN}/api/mcp`;
