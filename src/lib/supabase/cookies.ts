import type { CookieOptionsWithName } from "@supabase/ssr";

// Shared Supabase auth-cookie options across the browser, server and proxy
// clients (all three call this so they agree on the cookie).
export function supabaseCookieOptions(): CookieOptionsWithName | undefined {
  // Self-host: the browser and the server reach Supabase on different origins,
  // and @supabase/ssr derives the cookie name from the Supabase URL's hostname,
  // so they'd otherwise disagree. Pin an explicit name. (Plain http/localhost,
  // not framed — default SameSite is fine.)
  if (process.env.NEXT_PUBLIC_SELFHOST === "1") {
    return { name: "sb-xupersplit-auth" };
  }

  // Production (Vercel / HTTPS): make the auth cookie work inside the Farcaster
  // Mini App, where the app runs in a cross-site iframe and a default
  // SameSite=Lax cookie is neither stored nor sent. Partitioned (CHIPS) gives
  // it a separate jar per top-level site, SameSite=None lets the iframe use it,
  // and Secure is required for both. The normal top-level web app keeps working
  // in its own partition.
  if (process.env.NODE_ENV === "production") {
    return { sameSite: "none", secure: true, partitioned: true };
  }

  // Local dev (http://localhost): a Secure cookie wouldn't stick — keep defaults.
  return undefined;
}
