import { ImageResponse } from "next/og";
import { createAnonClient } from "@/lib/supabase/anon";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { interpolate } from "@/lib/i18n/format";
import { LOCALE_INTL, type Locale } from "@/lib/i18n/config";
import { formatMoney, totalSpent } from "@/lib/money";
import type { SplitData } from "@/lib/types";
import RootImage from "@/app/opengraph-image";

// Per-split share card. The link is the product's whole distribution: it gets
// dropped in a group chat and unfurled for everyone in it. A card that says
// "Stugresan Åre · 4 people · 12 340 kr" gets opened; the generic brand card
// reads like an ad and gets scrolled past.
//
// Only what the link holder can already see on the page goes on the card, and
// only for plain link splits. The anon client can't read secure splits
// (split_data answers `forbidden` without a session), so those — and unknown
// keys — fall back to the generic site card and leak nothing.
export const alt = "xupersplit — split shared expenses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Balances change as people add expenses; a few minutes stale is fine for a
// preview, and chat apps cache their own copy regardless.
export const revalidate = 300;

// Unfurls carry no Accept-Language worth trusting (it's the chat app's
// crawler asking), so the card speaks the group's language by its currency.
const CURRENCY_LOCALE: Record<string, Locale> = {
  SEK: "sv",
  NOK: "nb",
  DKK: "da",
  ISK: "is",
};

const MAX_TITLE = 42;

function clampTitle(title: string): string {
  const chars = [...title.trim()];
  return chars.length > MAX_TITLE
    ? chars.slice(0, MAX_TITLE - 1).join("").trimEnd() + "…"
    : chars.join("");
}

async function fetchSplit(key: string): Promise<SplitData | null> {
  try {
    const { data, error } = await createAnonClient().rpc("split_data", {
      p_key: key,
    });
    if (error || !data) return null;
    const flags = data as { forbidden?: boolean; not_found?: boolean };
    if (flags.forbidden || flags.not_found) return null;
    const split = data as SplitData;
    // Belt and braces: never put a secure split's details on a public image.
    if (split.split.secure) return null;
    return split;
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const data = await fetchSplit(key);
  if (!data) return RootImage();

  const { split, participants, entries } = data;
  const locale = CURRENCY_LOCALE[split.currency] ?? "en";
  const og = getDictionary(locale).og;
  const expenses = entries.filter((e) => e.kind === "expense").length;
  const total = totalSpent(entries);
  const title = clampTitle(split.title);
  const titleSize = [...title].length > 24 ? 76 : 96;

  const facts = [
    participants.length === 1
      ? og.peopleOne
      : interpolate(og.people, { count: participants.length }),
    expenses === 1 ? og.expensesOne : interpolate(og.expenses, { count: expenses }),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#faf8f4",
          padding: "64px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand row — smaller than on the site card; the split is the star */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#0d9488",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
              <path d="M16 16 L16 48 L32 32 Z" fill="#fff" />
              <path d="M48 16 L48 48 L32 32 Z" fill="#f59e0b" />
            </svg>
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, color: "#0d9488", letterSpacing: -1 }}>
            xupersplit
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 800,
              color: "#1c1917",
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginTop: 28,
              fontSize: 40,
              color: "#57534e",
            }}
          >
            {facts.join(" · ")}
            {total > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                  marginLeft: 8,
                  padding: "8px 22px",
                  borderRadius: 999,
                  background: "#ccfbf1",
                  color: "#0f766e",
                  fontWeight: 800,
                }}
              >
                {formatMoney(total, split.currency, LOCALE_INTL[locale])}
                <span style={{ fontSize: 28, fontWeight: 600 }}>{og.total}</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, color: "#0d9488", fontWeight: 700 }}>
          <div style={{ display: "flex", height: 12, width: 12, borderRadius: 6, background: "#f59e0b" }} />
          {og.cta} →
        </div>
      </div>
    ),
    size
  );
}
