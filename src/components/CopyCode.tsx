"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";

/**
 * A code block whose whole point is that you paste it somewhere else — the MCP
 * endpoint, a CLI line, a client config. Labels are props rather than
 * dictionary lookups because /mcp is English-only while the landing page is
 * translated; both pass what they need.
 */
export function CopyCode({
  children,
  location,
  label = "Copy",
  copiedLabel = "Copied ✓",
}: {
  children: string;
  /** Which block was copied — the only signal we get that anyone connects. */
  location: string;
  label?: string;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard
      ?.writeText(children)
      .then(() => {
        track("mcp_snippet_copied", { location });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  return (
    <div className="relative">
      {/* Right padding keeps a long single-line endpoint from sliding under
          the button instead of scrolling past it. */}
      <pre className="overflow-x-auto rounded-xl bg-stone-100 p-3 pr-24 text-xs leading-relaxed">
        <code>{children}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-live="polite"
        className="absolute top-2 right-2 rounded-lg border border-stone-300 bg-surface px-2 py-1 text-[11px] font-semibold text-stone-500 transition-colors hover:text-ink"
      >
        {copied ? copiedLabel : label}
      </button>
    </div>
  );
}
