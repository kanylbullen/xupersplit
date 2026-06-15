"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import type { Participant } from "@/lib/types";
import { claimParticipantAction } from "@/app/k/[key]/actions";
import { useI18n } from "@/lib/i18n/client";

type FcUser = { fid: number; username?: string; pfpUrl?: string };

// Secure splits: you become a participant by claiming a slot (bound to your
// account). Shown until the viewer has claimed one. Inside a Farcaster Mini App
// we attach the viewer's Farcaster identity to the claim; a require_farcaster
// split can only be claimed from a Farcaster client.
export function ClaimBanner({
  splitKey,
  participants,
  loggedIn,
  requireFarcaster,
}: {
  splitKey: string;
  participants: Participant[];
  loggedIn: boolean;
  requireFarcaster: boolean;
}) {
  const { dict, te } = useI18n();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fc, setFc] = useState<FcUser | null>(null);
  const [checked, setChecked] = useState(false);
  const claimable = participants.filter((p) => !p.claimed);

  // Pull the Farcaster identity from the Mini App host, if any.
  useEffect(() => {
    let active = true;
    import("@farcaster/miniapp-sdk")
      .then(async ({ sdk }) => {
        if (await sdk.isInMiniApp()) {
          const ctx = await sdk.context;
          const u = ctx?.user;
          if (active && u?.fid)
            setFc({ fid: u.fid, username: u.username, pfpUrl: u.pfpUrl });
        }
      })
      .catch(() => {})
      .finally(() => active && setChecked(true));
    return () => {
      active = false;
    };
  }, []);

  function claim(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await claimParticipantAction(
        splitKey,
        id,
        fc ? { fid: fc.fid, username: fc.username, pfp: fc.pfpUrl } : undefined
      );
      if (!result.ok) setError(te(result.error));
    });
  }

  // A require_farcaster split needs a Farcaster identity we only get inside a
  // Farcaster client — tell web visitors to open it there.
  const needsFarcaster = requireFarcaster && checked && !fc;

  return (
    <div className="mb-4 rounded-2xl border border-primary/30 bg-primary-soft/40 p-4">
      <p className="text-sm font-semibold">{dict.claim.title}</p>
      {!loggedIn ? (
        <>
          <p className="mt-1 text-sm text-stone-500">{dict.claim.loginFirst}</p>
          <Link
            href={`/login?next=/k/${splitKey}`}
            className="mt-3 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            {dict.nav.login}
          </Link>
        </>
      ) : needsFarcaster ? (
        <p className="mt-1 text-sm text-stone-500">{dict.claim.farcasterOnly}</p>
      ) : claimable.length === 0 ? (
        <p className="mt-1 text-sm text-stone-500">{dict.claim.noneLeft}</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-stone-500">{dict.claim.pickName}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {claimable.map((p) => (
              <button
                key={p.id}
                onClick={() => claim(p.id)}
                disabled={pending}
                className="rounded-xl border border-stone-300 bg-surface px-3 py-2 text-sm font-semibold hover:border-primary hover:text-primary-dark disabled:opacity-50"
              >
                {p.name}
                {p.invite_fc_username && (
                  <span className="ml-1 text-xs font-normal text-stone-400">
                    @{p.invite_fc_username}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
      {error && <p className="mt-2 text-sm text-negative">{error}</p>}
    </div>
  );
}
