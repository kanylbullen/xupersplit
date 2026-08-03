import { createMcpHandler } from "mcp-handler";
import { registerSplitTools } from "@/lib/mcp/server";

// Model Context Protocol endpoint — the machine-readable way into xupersplit.
// Any AI agent can point at this URL and create or manage a split; there is no
// sign-up and no API key, exactly like the web app. The secret split key is
// still the capability: whoever has the link can read and edit that split.
//
// Stateless Streamable HTTP, so it runs as a plain serverless function with no
// session store. Only the anonymous Supabase role is used (see
// @/lib/supabase/anon), which is what keeps secure splits out of reach here.

export const runtime = "nodejs";

const handler = createMcpHandler(registerSplitTools, {
  serverInfo: { name: "xupersplit", version: "1.0.0" },
  instructions:
    "xupersplit splits shared expenses in a group — no accounts, no app. " +
    "Create a split with create_split, then hand the returned link to the user " +
    "so they can share it with the group; anyone holding that link can view and " +
    "edit the split, so treat it as a secret. Add what people paid with " +
    "add_expense, read who owes whom with get_split, and record paybacks with " +
    "record_payment. Refer to people by name — the tools resolve names to " +
    "participants for you.",
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
