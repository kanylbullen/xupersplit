"use client";

import { useEffect, useRef, useState } from "react";
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
  wrap = false,
}: {
  children: string;
  /** Which block was copied — the only signal we get that anyone connects. */
  location: string;
  label?: string;
  copiedLabel?: string;
  /** Wrap instead of scrolling. For prose you'd say to an assistant; leave it
   *  off for JSON and shell lines, where a wrapped line reads as a broken one. */
  wrap?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Clicking a second block while the first still reads "Copied ✓" is normal
  // here — there are six of them on /mcp — so each click owns the timer.
  useEffect(() => () => clearTimeout(resetTimer.current), []);

  function copy() {
    navigator.clipboard
      ?.writeText(children)
      .then(() => {
        track("mcp_snippet_copied", { location });
        setCopied(true);
        clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  const button = (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className={`rounded-lg border border-stone-300 bg-surface px-2 py-1 text-[11px] font-semibold text-stone-500 transition-colors hover:text-ink ${
        wrap ? "" : "absolute top-2 right-2"
      }`}
    >
      {copied ? copiedLabel : label}
    </button>
  );

  // Wrapped prose gets the button underneath: overlaying it would mean
  // reserving a button-sized gutter down the whole block, and a sentence
  // wrapping at 40 characters to leave room for "Copy" reads badly.
  if (wrap) {
    return (
      <div>
        <pre className="rounded-xl bg-stone-100 p-3 text-xs leading-relaxed whitespace-pre-wrap break-words">
          <code>{children}</code>
        </pre>
        <div className="mt-1.5 flex justify-end">{button}</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Right padding keeps a long single-line endpoint from sliding under
          the button instead of scrolling past it. */}
      <pre className="overflow-x-auto rounded-xl bg-stone-100 p-3 pr-24 text-xs leading-relaxed">
        <code>{children}</code>
      </pre>
      {button}
    </div>
  );
}
