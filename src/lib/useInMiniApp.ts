"use client";

import { useEffect, useState } from "react";

// Detects the Farcaster Mini App host. Returns null until determined, so callers
// render the default (SSR) content first and avoid a hydration mismatch, then
// swap once detection resolves.
export function useInMiniApp(): boolean | null {
  const [inMiniApp, setInMiniApp] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    import("@farcaster/miniapp-sdk")
      .then(({ sdk }) => sdk.isInMiniApp())
      .then((v) => active && setInMiniApp(v))
      .catch(() => active && setInMiniApp(false));
    return () => {
      active = false;
    };
  }, []);
  return inMiniApp;
}
