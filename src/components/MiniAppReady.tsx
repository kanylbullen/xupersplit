"use client";

import { useEffect } from "react";

// When the app is opened inside a Farcaster client (as a Mini App), the host
// shows a splash screen until the app signals it's ready. Outside a Farcaster
// client this is a harmless no-op. Dynamically imported so the SDK never lands
// in the main bundle for normal web visitors.
export function MiniAppReady() {
  useEffect(() => {
    (async () => {
      try {
        const { sdk } = await import("@farcaster/miniapp-sdk");
        await sdk.actions.ready();
      } catch {
        // Not in a Mini App host (or SDK failed) — nothing to do.
      }
    })();
  }, []);

  return null;
}
