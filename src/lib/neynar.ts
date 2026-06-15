import "server-only";

// Minimal server-side Neynar client. Only the free endpoints are used:
// by_username (resolve an @handle → FID + profile). The API key never reaches
// the browser. Absent key → the Farcaster-invite feature is simply off.
const KEY = process.env.NEYNAR_API_KEY;

export function neynarEnabled(): boolean {
  return Boolean(KEY);
}

export type FcUser = { fid: number; username: string; pfp: string | null };

/** Resolve an exact Farcaster handle to its account, or null if unknown. */
export async function resolveFarcasterHandle(
  handle: string
): Promise<FcUser | null> {
  if (!KEY) return null;
  const username = handle.trim().replace(/^@/, "").toLowerCase();
  if (!/^[a-z0-9_.-]{1,64}$/.test(username)) return null;
  try {
    const res = await fetch(
      `https://api.neynar.com/v2/farcaster/user/by_username?username=${encodeURIComponent(username)}`,
      { headers: { "x-api-key": KEY, accept: "application/json" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const u = data?.user;
    if (!u?.fid) return null;
    return {
      fid: Number(u.fid),
      username: (u.username ?? username).toLowerCase(),
      pfp: typeof u.pfp_url === "string" && u.pfp_url.startsWith("https://")
        ? u.pfp_url
        : null,
    };
  } catch {
    return null;
  }
}
