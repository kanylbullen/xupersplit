"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import { readVisited } from "@/lib/visited";
import { useInMiniApp } from "@/lib/useInMiniApp";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PasskeysDialog } from "@/components/auth/PasskeysDialog";

const ROW =
  "block w-full rounded-xl px-2.5 py-2 text-left text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-ink";

// The header's one control: a disclosure holding everything account-shaped —
// who you are, your splits, language, theme, passkey, sign out. Built on
// <details> rather than a JS popover so the sign-out form still works with no
// JS, the way the plain header links did.
export function AccountMenu({
  displayName,
  hasServerSplits,
}: {
  displayName: string | null;
  hasServerSplits: boolean;
}) {
  const { dict, t } = useI18n();
  const inMiniApp = useInMiniApp();
  const ref = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);
  const [hasLocalSplits, setHasLocalSplits] = useState(false);
  const [passkeysOpen, setPasskeysOpen] = useState(false);

  // localStorage is client-only — read after mount so SSR and hydration agree.
  useEffect(() => setHasLocalSplits(readVisited().length > 0), []);

  useEffect(() => {
    if (!open) return;
    const close = () => {
      if (ref.current) ref.current.open = false;
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      close();
      ref.current?.querySelector("summary")?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const closeMenu = () => {
    if (ref.current) ref.current.open = false;
  };

  const initial = displayName?.replace(/^@/, "").charAt(0).toUpperCase();
  const showSplits = hasServerSplits || hasLocalSplits;

  return (
    // The passkey dialog lives outside <details> — inside, a closed menu would
    // take its modal down with it.
    <div className="relative">
      {/* Uncontrolled on purpose: <details> owns its open state, we only mirror
          it into React so the outside-click/Escape listeners attach when open. */}
      <details
        ref={ref}
        onToggle={(e) => setOpen(e.currentTarget.open)}
        className="group"
      >
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-stone-300 py-1.5 pl-1.5 pr-3 text-sm font-medium text-stone-600 transition-colors hover:border-stone-400 hover:text-ink [&::-webkit-details-marker]:hidden">
          {initial ? (
            <span
              aria-hidden
              className="grid size-6 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary-dark"
            >
              {initial}
            </span>
          ) : (
            <span
              aria-hidden
              className="grid size-6 place-items-center rounded-full bg-stone-100 text-stone-400"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="10" cy="6.5" r="3.2" />
                <path d="M3.8 17c.6-3.2 3.1-5 6.2-5s5.6 1.8 6.2 5" />
              </svg>
            </span>
          )}
          {displayName ? dict.nav.account : dict.nav.menu}
          <svg
            aria-hidden
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-stone-400 transition-transform group-open:rotate-180"
          >
            <path d="M3 4.5L6 7.5l3-3" />
          </svg>
        </summary>

        <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-stone-200/80 bg-surface p-1.5 shadow-lg">
          {displayName && (
            <p
              title={displayName}
              className="truncate px-2.5 pb-2 pt-1.5 text-xs text-stone-400"
            >
              {t(dict.nav.signedInAs, { email: displayName })}
            </p>
          )}

          {showSplits && (
            <Link href="/#my-splits" className={ROW} onClick={closeMenu}>
              {dict.mySplits.title}
            </Link>
          )}

          {/* Navigation, so it sits with "your splits" rather than among the
              settings below. Always present — which is also why the divider
              under it no longer depends on the identity section. */}
          <Link href="/help" className={ROW} onClick={closeMenu}>
            {dict.nav.help}
          </Link>

          <hr className="my-1.5 border-stone-100" />

          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
            <span className="text-sm text-stone-500">{dict.switcher.label}</span>
            <LocaleSwitcher />
          </div>

          <div className="px-2.5 pb-2 pt-1.5">
            <span className="mb-1.5 block text-sm text-stone-500">
              {dict.set.appearance}
            </span>
            <ThemeToggle />
          </div>

          <hr className="my-1.5 border-stone-100" />

          {displayName ? (
            <>
              {/* No WebAuthn in the Farcaster Mini App webview — the row just
                  drops out, no dangling divider. */}
              {!inMiniApp && (
                <button
                  className={ROW}
                  onClick={() => {
                    closeMenu();
                    setPasskeysOpen(true);
                  }}
                >
                  {dict.nav.passkeys}
                </button>
              )}
              <form action="/auth/signout" method="post">
                <button className={ROW}>{dict.nav.logout}</button>
              </form>
            </>
          ) : (
            <Link href="/login" className={ROW} onClick={closeMenu}>
              {dict.nav.login}
            </Link>
          )}
        </div>
      </details>

      {displayName && (
        <PasskeysDialog
          open={passkeysOpen}
          onClose={() => setPasskeysOpen(false)}
        />
      )}
    </div>
  );
}
