import { NextResponse, type NextRequest } from "next/server";
import { getFollowing, neynarEnabled } from "@/lib/neynar";

// Same-origin-locked: the user's Farcaster follows (for the invite picker).
// Follow FIDs from a public hub + free Neynar bulk resolution. Never exposes
// the API key (server-only).
export async function GET(req: NextRequest) {
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!neynarEnabled()) return NextResponse.json({ users: [] });

  const fid = Number(req.nextUrl.searchParams.get("fid"));
  if (!Number.isInteger(fid) || fid <= 0) {
    return NextResponse.json({ users: [] });
  }

  const users = await getFollowing(fid);
  return NextResponse.json(
    { users },
    { headers: { "cache-control": "private, max-age=300" } }
  );
}
