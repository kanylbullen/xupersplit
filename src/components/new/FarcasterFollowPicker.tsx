"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/client";

type FcUser = { fid: number; username: string; pfp: string | null };

// A pick-one overlay of the accounts you follow on Farcaster, opened per
// participant row. Follows come from /api/fc/follows (public hub + free Neynar
// bulk). Anyone not in the list is still reachable by typing their @handle.
export function FarcasterFollowPicker({
  fid,
  self,
  open,
  onClose,
  onPick,
}: {
  fid: number;
  self?: FcUser | null;
  open: boolean;
  onClose: () => void;
  onPick: (u: FcUser) => void;
}) {
  const { dict } = useI18n();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<FcUser[]>([]);
  const [q, setQ] = useState("");
  const loaded = useRef(false);

  useEffect(() => {
    if (!open || loaded.current || !fid) return;
    loaded.current = true;
    setLoading(true);
    fetch(`/api/fc/follows?fid=${fid}`)
      .then((r) => r.json())
      .then((d) => setUsers(Array.isArray(d.users) ? d.users : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, fid]);

  if (!open) return null;

  const needle = q.toLowerCase().replace(/^@/, "");
  // The creator can pick themselves — they aren't in their own follow list.
  const all = self
    ? [self, ...users.filter((u) => u.fid !== self.fid)]
    : users;
  const filtered = needle
    ? all.filter((u) => u.username.includes(needle))
    : all;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-surface p-3 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
          placeholder={dict.new.fcSearchPlaceholder}
          className="mb-2 w-full rounded-lg border border-stone-300 bg-cream px-3 py-2 text-sm outline-none focus:border-primary"
        />
        {filtered.length > 0 && (
          <div className="max-h-72 space-y-0.5 overflow-y-auto">
            {filtered.slice(0, 100).map((u) => (
              <button
                key={u.fid}
                type="button"
                onClick={() => onPick(u)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-primary-soft/50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {u.pfp && (
                  <img
                    src={u.pfp}
                    alt=""
                    className="h-7 w-7 shrink-0 rounded-full object-cover"
                  />
                )}
                <span className="font-medium">@{u.username}</span>
                {self && u.fid === self.fid && (
                  <span className="text-xs text-stone-400">({dict.common.you})</span>
                )}
              </button>
            ))}
          </div>
        )}
        {loading && (
          <p className="px-1 py-3 text-sm text-stone-400">{dict.new.fcLoading}</p>
        )}
        {!loading && filtered.length === 0 && (
          <p className="px-1 py-3 text-sm text-stone-400">{dict.new.fcNoFollows}</p>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-500"
        >
          {dict.common.close}
        </button>
      </div>
    </div>
  );
}
