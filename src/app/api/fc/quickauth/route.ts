import { NextResponse, type NextRequest } from "next/server";
import { createClient as createQuickAuthClient } from "@farcaster/quick-auth";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { APP_ORIGIN } from "@/lib/miniapp";

// Native "Sign in with Farcaster" for the Mini App. The client hands us a Quick
// Auth JWT (frictionless — no wallet signature); we verify it against
// Farcaster's keys, then bridge the proven FID into a Supabase session.
//
// Supabase has no Farcaster provider, so the bridge runs with the service_role
// key (server-only, never shipped to the client): find-or-create the FID's user
// and mint a one-time magiclink token the browser exchanges for a session.

export const runtime = "nodejs";

// Quick Auth tokens are scoped to the registered Mini App domain. Reject tokens
// minted for any other domain.
const DOMAIN = process.env.QUICKAUTH_DOMAIN ?? new URL(APP_ORIGIN).host;

const quickAuth = createQuickAuthClient();

export async function POST(req: NextRequest) {
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  let body: { token?: string; username?: string; pfpUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!body.token) {
    return NextResponse.json({ error: "missing_token" }, { status: 400 });
  }

  // 1. Verify the Quick Auth JWT (signature + domain) → proven FID.
  let fid: number;
  try {
    const payload = await quickAuth.verifyJwt({ token: body.token, domain: DOMAIN });
    fid = Number(payload.sub);
    if (!Number.isInteger(fid) || fid <= 0) throw new Error(`bad fid: ${payload.sub}`);
  } catch (e) {
    console.error("[quickauth] verify failed", {
      domain: DOMAIN,
      message: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  const admin = createAdminClient(supabaseUrl, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Non-deliverable, deterministic address on a subdomain we control. The FID is
  // the real identity; this is just the unique key Supabase keys the user on.
  const email = `${fid}@fc.split.xuper.fun`;
  const metadata = {
    provider: "farcaster",
    fid,
    ...(typeof body.username === "string" && { fc_username: body.username.slice(0, 64) }),
    ...(typeof body.pfpUrl === "string" && { fc_pfp: body.pfpUrl.slice(0, 512) }),
  };

  // 2. Find-or-create the FID's user (createUser no-ops if they already exist).
  const created = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: metadata,
    app_metadata: { fid },
  });
  if (created.error && !/already|exist|regist/i.test(created.error.message)) {
    console.error("[quickauth] createUser failed", { fid, message: created.error.message });
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }

  // 3. Mint a one-time login token the browser exchanges for a real session.
  const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const tokenHash = link.data?.properties?.hashed_token;
  if (link.error || !tokenHash) {
    console.error("[quickauth] generateLink failed", { fid, message: link.error?.message });
    return NextResponse.json({ error: "link_failed" }, { status: 500 });
  }

  // Refresh display fields (username/pfp can change between logins).
  if (link.data.user?.id) {
    await admin.auth.admin
      .updateUserById(link.data.user.id, { user_metadata: metadata })
      .catch(() => {});
  }

  return NextResponse.json({ token_hash: tokenHash });
}
