import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Who is calling, for the length of one request.
 *
 * The identity is resolved in the route — the only place that sees the JSON-RPC
 * envelope — but it is needed in `guard()` in ./server.ts, the only place that
 * knows how a tool call turned out. Nothing in between carries it: mcp-handler
 * builds a fresh server per request and hands each tool callback a context, but
 * `guard` wraps tool bodies rather than being one, so threading the context
 * would mean changing all eleven call sites and their signatures to carry a
 * single analytics field. Request-scoped ambient state is what
 * AsyncLocalStorage is for, and this route is `runtime = "nodejs"`.
 *
 * Read the value while the request is still on the stack and capture it —
 * `after()` callbacks run once the response is gone, and this store is not
 * theirs to read.
 */
const caller = new AsyncLocalStorage<string | undefined>();

export function withCaller<T>(client: string | undefined, run: () => T): T {
  return caller.run(client, run);
}

/** The caller's identity, or undefined outside a request that resolved one. */
export function currentCaller(): string | undefined {
  return caller.getStore();
}
