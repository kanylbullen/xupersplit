"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/client";

type FcUser = { fid: number; username: string; pfp: string | null };

// Lets the creator pick invitees from the accounts they follow on Farcaster.
// Only renders inside a Farcaster Mini App (needs the viewer's FID from
// sdk.context). Follows come from /api/fc/follows (public hub + free Neynar
// bulk). Anyone not in the list is still reachable by typing their @handle.
export function FarcasterFollowPicker({
  onPick,
}: {
  onPick: (u: FcUser) => void;
}) {
  const { dict } = useI18n();
  const [fid, setFid] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<FcUser[]>([]);
  const [q, setQ] = useState("");
  const loaded = useRef(false);

  useEffect(() => {
    let active = true;
    import("@farcaster/miniapp-sdk")
      .then(async ({ sdk }) => {
        if (!(await sdk.isInMiniApp())) return;
        const ctx = await sdk.context;
        if (active && ctx?.user?.fid) setFid(ctx.user.fid);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  async function toggle() {
    setOpen((o) => !o);
    if (!loaded.current && fid) {
      loaded.current = true;
      setLoading(true);
      try {
        const res = await fetch(`/api/fc/follows?fid=${fid}`);
        const data = await res.json();
        setUsers(Array.isArray(data.users) ? data.users : []);
      } catch {
        /* leave empty */
      }
      setLoading(false);
    }
  }

  if (!fid) return null;

  const needle = q.toLowerCase().replace(/^@/, "");
  const filtered = needle
    ? users.filter((u) => u.username.includes(needle))
    : users;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={toggle}
        className="text-sm font-semibold text-[#855DCD] hover:underline"
      >
        {dict.new.fcPickFollows}
      </button>
      {open && (
        <div className="mt-2 rounded-xl border border-stone-200 bg-surface p-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={dict.new.fcSearchPlaceholder}
            className="mb-2 w-full rounded-lg border border-stone-300 bg-cream px-2 py-1.5 text-sm outline-none focus:border-primary"
          />
          {loading ? (
            <p className="px-1 py-2 text-sm text-stone-400">{dict.new.fcLoading}</p>
          ) : filtered.length === 0 ? (
            <p className="px-1 py-2 text-sm text-stone-400">
              {dict.new.fcNoFollows}
            </p>
          ) : (
            <div className="max-h-56 space-y-0.5 overflow-y-auto">
              {filtered.slice(0, 100).map((u) => (
                <button
                  key={u.fid}
                  type="button"
                  onClick={() => onPick(u)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-primary-soft/50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {u.pfp && (
                    <img
                      src={u.pfp}
                      alt=""
                      className="h-6 w-6 shrink-0 rounded-full object-cover"
                    />
                  )}
                  <span className="font-medium">@{u.username}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
