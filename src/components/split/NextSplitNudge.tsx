"use client";

import { useEffect } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { useI18n } from "@/lib/i18n/client";
import { markNudgeDone } from "@/lib/growth";

/**
 * One-time "start your own" card for people who were sent the link. Shown by
 * SplitApp right after their first saved expense — see lib/growth.ts for why
 * that moment, and for the once-per-device bookkeeping.
 */
export function NextSplitNudge({ onDone }: { onDone: () => void }) {
  const { dict } = useI18n();

  useEffect(() => {
    track("nudge_shown");
  }, []);

  function finish(action: "clicked" | "dismissed") {
    markNudgeDone();
    track(action === "clicked" ? "nudge_clicked" : "nudge_dismissed");
    onDone();
  }

  return (
    <div
      role="status"
      className="mb-4 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary-soft/40 p-4"
    >
      <span aria-hidden className="text-2xl leading-none">
        ✨
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{dict.nudge.title}</p>
        <p className="mt-0.5 text-sm text-stone-500">{dict.nudge.body}</p>
        <div className="mt-3 flex items-center gap-3">
          <Link
            href="/new?ref=nudge"
            onClick={() => finish("clicked")}
            className="rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            {dict.nudge.cta}
          </Link>
          <button
            onClick={() => finish("dismissed")}
            className="text-sm font-semibold text-stone-500 hover:text-ink"
          >
            {dict.nudge.dismiss}
          </button>
        </div>
      </div>
    </div>
  );
}
