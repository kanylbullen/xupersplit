"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SplitSummary } from "@/lib/types";
import { useI18n } from "@/lib/i18n/client";
import { LOCALE_INTL } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/client";
import {
  readVisited,
  writeVisited,
  readSynced,
  writeSynced,
  type VisitedSplit,
} from "@/lib/visited";

export function MySplits({
  server,
  userId,
}: {
  server: SplitSummary[];
  userId: string | null;
}) {
  const { dict, t, locale } = useI18n();
  const intl = LOCALE_INTL[locale];
  const router = useRouter();
  const [visited, setVisited] = useState<VisitedSplit[]>([]);
  const [synced, setSynced] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const loggedIn = userId !== null;

  // Both in one effect: rendering the visited list before we know which of its
  // keys the account has already answered for would flash splits the user hid
  // on another device.
  useEffect(() => {
    setVisited(readVisited());
    setSynced(userId ? readSynced(userId) : []);
  }, [userId]);

  const serverKeys = new Set(server.map((k) => k.key));
  const localOnly = visited.filter((v) => !serverKeys.has(v.key));

  // Signed out, every visited split is worth showing. Signed in, only the ones
  // the account hasn't ruled on yet — a key that's been through follow_splits
  // and still isn't in my_splits() was left out deliberately.
  const pending = loggedIn
    ? localOnly.filter((v) => !synced.includes(v.key))
    : localOnly;

  // Signed in, but this browser remembers splits the account doesn't know
  // about — adopt them, then re-render from the server list. Recording what we
  // sent is what makes this settle: without it the same keys go back over the
  // wire on every single page load and hidden splits never stay hidden.
  useEffect(() => {
    if (!userId || syncing || pending.length === 0) return;
    setSyncing(true);
    const keys = pending.map((v) => v.key);
    (async () => {
      try {
        const { error } = await createClient().rpc("follow_splits", {
          p_keys: keys,
        });
        // Offline, or the migration hasn't landed yet — the local list still
        // renders, so there's nothing useful to tell the user. Leaving the
        // keys unrecorded means the next load tries again, which is right.
        if (!error) {
          const next = [...readSynced(userId), ...keys];
          writeSynced(userId, next);
          setSynced(next);
          router.refresh();
        }
      } catch {
        // same
      }
    })();
  }, [userId, syncing, pending, router]);

  async function hide(key: string) {
    // Drop it from this browser either way; the account-level hide only
    // applies when there's an account to hide it from.
    const next = readVisited().filter((v) => v.key !== key);
    writeVisited(next);
    setVisited(next);
    if (loggedIn) {
      try {
        const { error } = await createClient().rpc("hide_split", {
          p_key: key,
        });
        if (!error) router.refresh();
      } catch {
        // Same as above — the row is already gone from the local list.
      }
    }
  }

  if (server.length === 0 && pending.length === 0) return null;

  const rows = [
    ...server.map((k) => ({
      key: k.key,
      title: k.title,
      meta: `${t(dict.mySplits.participants, { count: k.participant_count })} · ${t(
        k.entry_count === 1
          ? dict.mySplits.entriesOne
          : dict.mySplits.entriesMany,
        { count: k.entry_count }
      )} · ${t(dict.mySplits.created, {
        date: new Date(k.created_at).toLocaleDateString(intl),
      })}`,
    })),
    ...pending.map((v) => ({
      key: v.key,
      title: v.title,
      meta: t(dict.mySplits.lastOpened, {
        date: new Date(v.at).toLocaleDateString(intl),
      }),
    })),
  ];

  return (
    <section id="my-splits" className="mb-12 scroll-mt-4">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone-400">
        {dict.mySplits.title}
      </h2>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.key} className="relative">
            {/* No → any more: the ✕ sits where it used to, and two glyphs
                side by side read as one ambiguous control. */}
            <Link
              href={`/k/${row.key}`}
              className="block rounded-2xl border border-stone-200/80 bg-surface py-3.5 pl-4 pr-12 shadow-sm transition-colors hover:border-primary/40"
            >
              <div className="min-w-0">
                <div className="truncate font-semibold">{row.title}</div>
                <div className="text-sm text-stone-400">{row.meta}</div>
              </div>
            </Link>
            <button
              onClick={() => hide(row.key)}
              aria-label={dict.mySplits.remove}
              title={dict.mySplits.remove}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-stone-300 hover:bg-stone-100 hover:text-ink"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-2 px-1 text-xs text-stone-400">
        {loggedIn ? (
          dict.mySplits.savedAccount
        ) : (
          <>
            {dict.mySplits.savedHint1}{" "}
            <Link href="/login" className="text-primary hover:text-primary-dark">
              {dict.mySplits.loginCta}
            </Link>{" "}
            {dict.mySplits.savedHint2}
          </>
        )}
      </p>
    </section>
  );
}
