"use client";

import { useInMiniApp } from "@/lib/useInMiniApp";

// Renders `base` everywhere except inside the Farcaster Mini App, where `alt` is
// shown instead. Starts with `base` (matches SSR) and swaps after detection.
export function MiniAppSwap({ base, alt }: { base: string; alt: string }) {
  const inMiniApp = useInMiniApp();
  return <>{inMiniApp ? alt : base}</>;
}
