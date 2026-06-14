// In self-host, the browser and the server talk to Supabase on different
// origins (browser → the public SITE_URL, server → SUPABASE_INTERNAL_URL on
// localhost). @supabase/ssr derives the auth cookie name from the Supabase
// URL's hostname, so those two origins would otherwise disagree on the cookie
// name and the server would never see the browser's session. Pin an explicit
// name in self-host mode so both sides match. On Vercel (single origin) we
// return undefined and keep the default derived name — no cookie rename, no
// forced logout for existing users.
export function supabaseCookieOptions(): { name: string } | undefined {
  return process.env.NEXT_PUBLIC_SELFHOST === "1"
    ? { name: "sb-tollysplit-auth" }
    : undefined;
}
