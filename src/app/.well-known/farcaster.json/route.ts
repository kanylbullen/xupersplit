import {
  APP_ORIGIN,
  MINIAPP_NAME,
  MINIAPP_IMAGE,
  MINIAPP_SPLASH,
  SPLASH_BG,
} from "@/lib/miniapp";

// Farcaster Mini App manifest. The `frame` object makes the app installable /
// discoverable; `accountAssociation` proves domain ownership and must be signed
// with your Farcaster custody key via
//   https://farcaster.xyz/~/developers/mini-apps/manifest?domain=split.xuper.fun
// Paste the resulting { header, payload, signature } JSON into the
// FARCASTER_ACCOUNT_ASSOCIATION env var (no redeploy of code needed).
export function GET() {
  const frame = {
    version: "1",
    name: MINIAPP_NAME,
    iconUrl: MINIAPP_SPLASH,
    homeUrl: APP_ORIGIN,
    imageUrl: MINIAPP_IMAGE,
    buttonTitle: "Open Xupersplit",
    splashImageUrl: MINIAPP_SPLASH,
    splashBackgroundColor: SPLASH_BG,
    subtitle: "Split bills, settle onchain",
    description:
      "Split shared expenses and settle in USDC or sats — no account, just a link.",
    primaryCategory: "finance",
    tags: ["payments", "crypto", "expenses", "usdc", "onchain"],
    tagline: "Split bills, settle onchain",
    ogTitle: "Xupersplit",
    ogDescription: "Split shared expenses, settle in USDC or sats.",
    ogImageUrl: `${APP_ORIGIN}/opengraph-image`,
    heroImageUrl: `${APP_ORIGIN}/opengraph-image`,
  };

  const body: Record<string, unknown> = { frame };

  const assoc = process.env.FARCASTER_ACCOUNT_ASSOCIATION;
  if (assoc) {
    try {
      body.accountAssociation = JSON.parse(assoc);
    } catch {
      // Malformed env value — serve the manifest without it rather than 500.
    }
  }

  return Response.json(body);
}
