// Farcaster Mini App (formerly "Frames v2") wiring. Sharing a Xupersplit URL in
// a Farcaster client renders an interactive launch card via the fc:miniapp
// embed below; the app calls sdk.actions.ready() once mounted (MiniAppReady).
// See /.well-known/farcaster.json for the manifest.

// Lowercase to match the wordmark — the brand is styled lowercase wherever it
// appears as a name/label (Mini App listing name + launch button).
export const MINIAPP_NAME = "xupersplit";

// The app's public origin (absolute URLs are required in the embed/manifest).
export const APP_ORIGIN =
  process.env.NEXT_PUBLIC_APP_ORIGIN ?? "https://split.xuper.fun";

// 3:2 share image (1200×800). Generic on purpose — splits are private/noindex,
// so we never bake split contents into a publicly cacheable image.
export const MINIAPP_IMAGE = `${APP_ORIGIN}/api/miniapp-image`;
export const MINIAPP_SPLASH = `${APP_ORIGIN}/apple-icon.png`;
export const SPLASH_BG = "#faf8f4";

/**
 * The `fc:miniapp` embed (stringified) for a given launch URL. Put it in a page's
 * `other` metadata so Farcaster renders a launch button that opens that URL.
 */
export function miniappEmbed(launchUrl: string): string {
  return JSON.stringify({
    version: "1",
    imageUrl: MINIAPP_IMAGE,
    button: {
      title: "Open xupersplit",
      action: {
        type: "launch_frame",
        name: MINIAPP_NAME,
        url: launchUrl,
        splashImageUrl: MINIAPP_SPLASH,
        splashBackgroundColor: SPLASH_BG,
      },
    },
  });
}
