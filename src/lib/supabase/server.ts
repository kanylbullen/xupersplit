import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseCookieOptions } from "./cookies";

export async function createClient() {
  const cookieStore = await cookies();

  // Server-side calls can use an internal URL (set in the self-host Docker
  // stack, where the browser reaches the gateway on localhost but the app
  // container reaches it over the compose network). Falls back to the public
  // URL on Vercel where they're the same.
  const url =
    process.env.SUPABASE_INTERNAL_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;

  return createServerClient(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: supabaseCookieOptions(),
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component — session refresh is handled by middleware.
          }
        },
      },
    }
  );
}
