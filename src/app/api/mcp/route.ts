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

// A serverless invocation is billed for as long as it *runs*, not for as long
// as the client waits — and some clients leave an invocation alive here after
// its response has been sent (the platform logs a 200 for the request and a
// "Task timed out" for the same invocation five minutes later). With the
// platform default of 300 s that turns a 200 ms tool call into five minutes of
// billed duration, which is what set off the Function Duration alert on
// 2026-08-13: ~8 requests every four minutes, each holding a function open for
// the full 300 s.
//
// Nothing on this route legitimately needs more than a second or two — every
// tool is a single Supabase RPC — and `after()` work counts against the same
// budget, so cap the invocation. That doesn't explain the leak, but it bounds
// what the leak can cost until it's found.
export const maxDuration = 15;

// One line per request. The platform's log record for a timed-out invocation
// carries no client identity and no JSON-RPC method, so there is otherwise
// nothing to attribute the duration to. `ms` is how long the handler took to
// produce the response: when the platform reports a far longer duration for the
// same request, the difference was spent after the response was sent, which is
// the shape of the leak above.
function logRequest(
  request: Request,
  method: string | undefined,
  response: Response,
  ms: number,
): void {
  console.log(
    JSON.stringify({
      evt: "mcp_request",
      method: method ?? request.method,
      status: response.status,
      ms,
      ua: request.headers.get("user-agent") ?? "",
    }),
  );
}

// The JSON-RPC method and id, for the log line above and for the subscription
// refusal below. Read from a clone so the handler still gets an unconsumed body;
// anything unparseable is left to the handler to reject.
type Envelope = { method: string; id: unknown };

async function peekEnvelope(request: Request): Promise<Envelope | undefined> {
  if (request.method !== "POST") return undefined;
  try {
    const body: unknown = await request.clone().json();
    if (body && typeof body === "object" && "method" in body) {
      const envelope = body as { method: unknown; id?: unknown };
      return { method: String(envelope.method), id: envelope.id ?? null };
    }
  } catch {
    /* not JSON-RPC — the handler answers with an error of its own */
  }
  return undefined;
}

// `subscriptions/listen` is a long poll: the SDK sends the response headers at
// once and then holds the SSE stream open until the client goes away, waiting
// for a change event to forward. That is the right shape for a server process
// that stays resident and the wrong one for a function billed per invocation.
// Claude's client opens five of these every four minutes, and until maxDuration
// was capped each one billed the platform's full 300 s sitting idle — that was
// the Function Duration spike, ~30 of every 48 requests to this route.
//
// There is nothing for them to wait for, either: this server is stateless and
// its tool list is fixed at build time, so no change event can ever be
// published. So refuse them in the same words the SDK uses when its own
// `maxSubscriptions` limit is reached — an in-band JSON-RPC error over HTTP 200,
// which is what the spec defines for a server that won't take another
// subscription. (Setting `maxSubscriptions: 0` would be the tidier way to say
// this, but mcp-handler doesn't pass that option through to the SDK handler.)
const SUBSCRIPTION_METHOD = "subscriptions/listen";

function refuseSubscription(id: unknown): Response {
  return Response.json(
    {
      jsonrpc: "2.0",
      id,
      error: { code: -32603, message: "Subscription limit reached" },
    },
    { status: 200 },
  );
}

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

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(CORS)) headers.set(name, value);
  headers.set("Cache-Control", "no-store");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function serve(request: Request): Promise<Response> {
  const started = Date.now();
  const envelope = await peekEnvelope(request);

  // Refused before the SDK sees it, so no stream is ever opened.
  const response =
    envelope?.method === SUBSCRIPTION_METHOD
      ? refuseSubscription(envelope.id)
      : await handler(request);

  logRequest(request, envelope?.method, response, Date.now() - started);
  return withCors(response);
}

export { serve as GET, serve as POST, serve as DELETE };

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS });
}
