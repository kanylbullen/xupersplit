import { createMcpHandler, type McpHandlerOptions } from "mcp-handler";
import { after } from "next/server";
import { track } from "@vercel/analytics/server";
import { registerSplitTools } from "@/lib/mcp/server";
import { APP_ORIGIN } from "@/lib/miniapp";

// Model Context Protocol endpoint — the machine-readable way into xupersplit.
// Any AI agent can point at this URL and create or manage a split; there is no
// sign-up and no API key, exactly like the web app. The secret split key is
// still the capability: whoever has the link can read and edit that split.
//
// Stateless Streamable HTTP, so it runs as a plain serverless function with no
// session store. Only the anonymous Supabase role is used (see
// @/lib/supabase/anon), which is what keeps secure splits out of reach here.

export const runtime = "nodejs";

// Identity a client shows in its connector list. `icons` is part of the MCP
// `Implementation` shape — without it a client has nothing to render but its
// own placeholder, which is why the wordmark didn't show up. The mark carries
// its own teal background, so one icon works on light and dark alike and no
// per-theme variant is needed. mcp-handler passes this object straight to
// `new McpServer(...)`, so every field here reaches the wire.
const serverInfo = {
  name: "xupersplit",
  // Keep in step with server.json — that's what the registry publishes, and a
  // client that reads both shouldn't see two different numbers. It tracks the
  // MCP contract, not the app's own release version in package.json.
  version: "1.0.1",
  websiteUrl: APP_ORIGIN,
  description:
    "Split shared expenses in a group — no account needed. Create a split, " +
    "add what everyone paid, and see who owes whom.",
  icons: [
    {
      src: `${APP_ORIGIN}/icon.svg`,
      mimeType: "image/svg+xml",
      sizes: ["any"],
    },
    {
      src: `${APP_ORIGIN}/apple-icon.png`,
      mimeType: "image/png",
      sizes: ["512x512"],
    },
  ],
};

// The handler's event hook is the only place a client's identity shows up —
// tool calls never mention it. Note the shape: REQUEST_RECEIVED carries the
// whole JSON-RPC envelope (params nested one level down), and REQUEST_COMPLETED
// carries neither parameters nor result, so per-tool outcomes are recorded in
// the tools themselves rather than here.
type McpEvent = Parameters<NonNullable<McpHandlerOptions["onEvent"]>>[0];

function recordConnection(event: McpEvent): void {
  if (event.type !== "REQUEST_RECEIVED" || event.method !== "initialize")
    return;

  const envelope = event.parameters as
    | { params?: { clientInfo?: { name?: string; version?: string } } }
    | undefined;
  const client = envelope?.params?.clientInfo;

  // Analytics must never hold up the response or fail a request.
  after(() =>
    track("mcp_connect", {
      client: client?.name ?? "unknown",
      client_version: client?.version ?? "unknown",
    }).catch(() => {}),
  );
}

const handler = createMcpHandler(registerSplitTools, {
  serverInfo,
  onEvent: recordConnection,
  instructions:
    "xupersplit splits shared expenses in a group — no accounts, no app. " +
    "Create a split with create_split, then hand the returned link to the user " +
    "so they can share it with the group; anyone holding that link can view and " +
    "edit the split, so treat it as a secret. Add what people paid with " +
    "add_expense, read who owes whom with get_split, and record paybacks with " +
    "record_payment. Refer to people by name — the tools resolve names to " +
    "participants for you. Working from a receipt or a photo of one: read it " +
    "yourself and enter one expense per group of items sharing the same " +
    "people, rather than one equal split of the total — the shared bottle of " +
    "wine and the individual mains are separate expenses. When you cannot " +
    "tell who had what, ask rather than spreading that line evenly; an even " +
    "split you already suspect is wrong costs the group real money and looks " +
    "authoritative doing it. The tell is that the counts don't fit the group " +
    "— two glasses of wine for three people, one dessert for four. Name the " +
    "line you can't place, say what you assumed for the rest, and ask.",
});

// Agents connect from anywhere, including browser-based clients, so this
// endpoint is deliberately cross-origin. Nothing here is cookie-authenticated:
// the split key in the arguments is the only credential, so there is no
// cross-site request forgery surface to protect.
const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "content-type, authorization, mcp-session-id, mcp-protocol-version, last-event-id",
  "Access-Control-Expose-Headers": "mcp-session-id, mcp-protocol-version",
  "Access-Control-Max-Age": "86400",
};

async function serve(request: Request): Promise<Response> {
  const response = await handler(request);
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(CORS)) headers.set(name, value);
  headers.set("Cache-Control", "no-store");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export { serve as GET, serve as POST, serve as DELETE };

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS });
}
