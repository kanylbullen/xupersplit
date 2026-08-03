import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-less, anonymous Supabase client.
 *
 * The MCP server is anonymous by design: it never picks up a browser session,
 * so `auth.uid()` is always null inside the RPCs. That makes secure splits
 * structurally unreachable over MCP — `split_data` answers `forbidden` and
 * writes raise `not_a_member`. MCP handles the simple, accountless splits and
 * nothing else, which is exactly the intended scope.
 *
 * Separate from `./server.ts`, which reads cookies for the web app.
 */
export function createAnonClient() {
  // Self-host runs the app as its own Supabase gateway; see ./server.ts.
  const url =
    process.env.SUPABASE_INTERNAL_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;

  return createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
