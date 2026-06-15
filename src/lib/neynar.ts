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

/**
 * The accounts a user follows. Follow FIDs come from a public Farcaster hub
 * (free, open protocol); profiles are resolved via Neynar's free bulk endpoint.
 * Capped to keep it bounded; anyone beyond the cap is still reachable by typing
 * their @handle.
 */
export async function getFollowing(fid: number): Promise<FcUser[]> {
  if (!KEY || !fid || fid <= 0) return [];
  const targetFids: number[] = [];
  let pageToken = "";
  try {
    for (let i = 0; i < 6 && targetFids.length < 600; i++) {
      const res = await fetch(
        `https://hub.pinata.cloud/v1/linksByFid?fid=${fid}&link_type=follow&pageSize=100` +
          (pageToken ? `&pageToken=${pageToken}` : ""),
        { headers: { accept: "application/json" } }
      );
      if (!res.ok) break;
      const data = await res.json();
      for (const m of data.messages ?? []) {
        const t = m?.data?.linkBody?.targetFid;
        if (typeof t === "number") targetFids.push(t);
      }
      pageToken = data.nextPageToken || "";
      if (!pageToken) break;
    }
  } catch {
    return [];
  }
  if (targetFids.length === 0) return [];

  const users: FcUser[] = [];
  for (let i = 0; i < targetFids.length; i += 100) {
    const batch = targetFids.slice(i, i + 100);
    try {
      const res = await fetch(
        `https://api.neynar.com/v2/farcaster/user/bulk?fids=${batch.join(",")}`,
        { headers: { "x-api-key": KEY, accept: "application/json" } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      for (const u of data.users ?? []) {
        if (u?.fid && u?.username)
          users.push({
            fid: Number(u.fid),
            username: String(u.username).toLowerCase(),
            pfp:
              typeof u.pfp_url === "string" && u.pfp_url.startsWith("https://")
                ? u.pfp_url
                : null,
          });
      }
    } catch {
      /* skip batch */
    }
  }
  users.sort((a, b) => a.username.localeCompare(b.username));
  return users;
}
