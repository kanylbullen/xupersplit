import { z } from "zod";
import { APP_ORIGIN } from "@/lib/miniapp";
import {
  balances,
  expenseSplit,
  formatMoney,
  settlements,
  shareOfTotal,
  totalSpent,
} from "@/lib/money";
import type { Participant, SplitData } from "@/lib/types";

/** Amounts are rendered for an English-speaking reader, not the app's locale. */
const MCP_LOCALE = "en-GB";

/**
 * A message meant for the calling agent. Everything thrown from a tool body
 * gets funnelled through `tool()` in ./server.ts; this type marks the ones
 * whose text is safe (and useful) to show.
 */
export class McpToolError extends Error {}

// ── Split keys ───────────────────────────────────────────────────────────────

const KEY_RE = /^[0-9a-f]{32}$/i;

/**
 * Accept either a bare split key or any /k/<key> link — an agent is usually
 * handed the URL, not the key, and shouldn't have to pull it apart itself.
 */
export function parseSplitKey(input: string): string {
  const raw = input.trim();
  if (KEY_RE.test(raw)) return raw.toLowerCase();
  const inUrl = raw.match(/\/k\/([0-9a-f]{32})/i);
  if (inUrl) return inUrl[1].toLowerCase();
  throw new McpToolError(
    `"${input}" is not a xupersplit split. Pass the 32-character key, or the ` +
      `whole ${APP_ORIGIN}/k/<key> link.`
  );
}

export function splitUrl(key: string): string {
  return `${APP_ORIGIN}/k/${key}`;
}

// ── Amounts ──────────────────────────────────────────────────────────────────

/**
 * Tools speak the main unit (249.5 kr); the database stores cents. SATS uses
 * the same factor — a sats amount is stored as sats × 100, matching how the
 * web app records sats expenses.
 */
export function toCents(amount: number, label = "amount"): number {
  if (!Number.isFinite(amount)) {
    throw new McpToolError(`The ${label} must be a number.`);
  }
  const cents = Math.round(amount * 100);
  if (cents <= 0) {
    throw new McpToolError(`The ${label} must be greater than zero.`);
  }
  return cents;
}

export const fromCents = (cents: number): number => cents / 100;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate an optional YYYY-MM-DD date. Undefined is returned as-is: the
 * `save_entry` RPC falls back to the database's `current_date`, which beats
 * this server guessing a timezone.
 */
export function checkDate(date: string | undefined): string | undefined {
  if (date === undefined) return undefined;
  if (!DATE_RE.test(date)) {
    throw new McpToolError(`Date must be YYYY-MM-DD, got "${date}".`);
  }
  return date;
}

// ── Participants ─────────────────────────────────────────────────────────────

/**
 * Resolve "Anna" / "anna" / "Ann" / a raw uuid to one participant. Agents
 * think in names, so accepting them (and failing loudly on an ambiguous one)
 * removes a whole class of round trips.
 */
export function resolveParticipant(
  participants: Participant[],
  ref: string
): Participant {
  const needle = ref.trim();
  if (!needle) throw new McpToolError("Participant name is empty.");

  const byId = participants.find((p) => p.id === needle);
  if (byId) return byId;

  const lower = needle.toLowerCase();
  const exact = participants.filter((p) => p.name.toLowerCase() === lower);
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) throw ambiguous(needle, exact);

  const prefix = participants.filter((p) => p.name.toLowerCase().startsWith(lower));
  if (prefix.length === 1) return prefix[0];
  if (prefix.length > 1) throw ambiguous(needle, prefix);

  throw new McpToolError(
    `No participant called "${ref}" in this split. It has: ${names(participants)}.`
  );
}

function ambiguous(ref: string, matches: Participant[]): McpToolError {
  return new McpToolError(
    `"${ref}" matches more than one participant (${names(matches)}). ` +
      `Use the full name or the participant id.`
  );
}

const names = (list: Participant[]) => list.map((p) => p.name).join(", ");

// ── RPC plumbing ─────────────────────────────────────────────────────────────

/** The slice of a Supabase client the MCP tools use. */
export type RpcClient = {
  rpc(
    fn: string,
    args: Record<string, unknown>
  ): PromiseLike<{ data: unknown; error: { message: string } | null }>;
};

function secureHint(key: string): string {
  return (
    `This is a secure split — it needs a signed-in account, which the MCP ` +
    `server deliberately doesn't have. Open ${splitUrl(key)} in a browser instead.`
  );
}

/** Database error strings → something an agent can act on. */
const RPC_MESSAGES: Record<string, string> = {
  rate_limited:
    "Too many splits have been created from this network in the last hour. Try again later.",
  title_required: "The split needs a title.",
  need_two_participants: "A split needs at least two participants.",
  split_not_found: "No split with that key — check the link.",
  entry_not_found: "No entry with that id in this split.",
  participant_not_found: "No participant with that id in this split.",
  participant_has_entries:
    "That participant is on existing expenses; delete or reassign those first.",
  name_required: "The participant needs a name.",
  bad_amount: "The amount must be greater than zero.",
  bad_kind: "Unknown entry kind.",
  bad_payer: "The payer is not part of this split.",
  bad_recipient: "The recipient must be someone else in this split.",
  bad_share_participant: "One of the shares points at someone outside this split.",
  shares_required: "An expense needs at least one person to share it.",
  bad_currency: "Foreign-currency entries need both the original amount and a rate.",
  bad_payment_type:
    "Unknown payment type. Use one of: swish, vipps, mobilepay, iban, revolut, lightning, evm, solana.",
  bad_payment_value: "That payment detail isn't valid for the chosen type.",
  too_many_methods: "A participant can have at most 8 payment methods.",
};

/** Errors that all mean the same thing: this split needs a signed-in identity. */
const SECURE_CODES = [
  "login_required",
  "not_a_member",
  "not_your_entry",
  "not_your_participant",
  "creator_only",
  "awaiting_claims",
  "farcaster_required",
  "not_invited",
  "already_claimed",
  "slot_taken",
];

/** Run an RPC, turning a Postgres exception into a readable tool error. */
export async function callRpc<T>(
  supabase: RpcClient,
  fn: string,
  args: Record<string, unknown>,
  key?: string
): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args);
  if (!error) return data as T;

  const message = error.message ?? "";
  if (key && SECURE_CODES.some((code) => message.includes(code))) {
    throw new McpToolError(secureHint(key));
  }
  for (const [code, text] of Object.entries(RPC_MESSAGES)) {
    if (message.includes(code)) throw new McpToolError(text);
  }
  throw new McpToolError(`The split service rejected that request: ${message}`);
}

/** Read a split, mapping the two "you can't see this" answers to clear errors. */
export async function fetchSplit(
  supabase: RpcClient,
  key: string
): Promise<SplitData> {
  const data = await callRpc<
    (SplitData & { not_found?: boolean; forbidden?: boolean }) | null
  >(supabase, "split_data", { p_key: key });

  if (!data || data.not_found) {
    throw new McpToolError(
      `No split with key ${key}. Check the link — split keys are 32 hex characters.`
    );
  }
  if (data.forbidden) throw new McpToolError(secureHint(key));
  return data;
}

// ── Output shape ─────────────────────────────────────────────────────────────

export const SPLIT_SCHEMA = z.object({
  key: z.string(),
  url: z.string(),
  title: z.string(),
  currency: z.string(),
  created_at: z.string(),
  /** Sum of all expenses (transfers excluded), in the main unit. */
  total_spent: z.number(),
  /** True when every balance is zero — nobody owes anybody. */
  settled: z.boolean(),
  /** True for secure splits, which this server can only read, never write. */
  secure: z.boolean(),
  participants: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      /** What this person paid out of pocket, expenses only. */
      paid: z.number(),
      /** This person's share of all expenses. */
      owes: z.number(),
      /** Paybacks sent minus received. */
      settled: z.number(),
      /** paid − owes + settled. Positive = this person is owed money. */
      balance: z.number(),
      payment_methods: z.array(z.object({ type: z.string(), value: z.string() })),
    })
  ),
  entries: z.array(
    z.object({
      id: z.string(),
      kind: z.enum(["expense", "transfer"]),
      description: z.string().nullable(),
      amount: z.number(),
      date: z.string(),
      paid_by: z.string(),
      paid_by_id: z.string(),
      /** Recipient name, transfers only. */
      to: z.string().nullable(),
      /** Names sharing the cost, expenses only. */
      shared_by: z.array(z.string()),
    })
  ),
  /** Fewest transfers that clear every debt. */
  settlement: z.array(
    z.object({ from: z.string(), to: z.string(), amount: z.number() })
  ),
});

export type SplitSummary = z.infer<typeof SPLIT_SCHEMA>;

/**
 * Project a split into the agent-facing shape. Every number goes through the
 * app's own `money.ts` helpers, so an agent and the web page can never disagree
 * about who owes what.
 */
export function describeSplit(data: SplitData): SplitSummary {
  const { split, participants, entries } = data;
  const name = new Map(participants.map((p) => [p.id, p.name]));
  const bal = balances(participants, entries);
  const owed = shareOfTotal(participants, entries);

  // Split the two halves of a balance apart so the reported numbers add up:
  // balance = paid − owes + settled. Without the transfer leg, "paid 450,
  // share 795, owes 245" looks like an arithmetic error.
  const paid = new Map(participants.map((p) => [p.id, 0]));
  const settled = new Map(participants.map((p) => [p.id, 0]));
  const bump = (map: Map<string, number>, id: string, cents: number) =>
    map.set(id, (map.get(id) ?? 0) + cents);

  for (const entry of entries) {
    if (entry.kind === "expense") {
      bump(paid, entry.paid_by, entry.amount_cents);
    } else if (entry.transfer_to) {
      bump(settled, entry.paid_by, entry.amount_cents);
      bump(settled, entry.transfer_to, -entry.amount_cents);
    }
  }

  return {
    key: split.key,
    url: splitUrl(split.key),
    title: split.title,
    currency: split.currency,
    created_at: split.created_at,
    total_spent: fromCents(totalSpent(entries)),
    settled: [...bal.values()].every((v) => v === 0),
    secure: split.secure,
    participants: participants.map((p) => ({
      id: p.id,
      name: p.name,
      paid: fromCents(paid.get(p.id) ?? 0),
      owes: fromCents(owed.get(p.id) ?? 0),
      settled: fromCents(settled.get(p.id) ?? 0),
      balance: fromCents(bal.get(p.id) ?? 0),
      payment_methods: p.payment_methods ?? [],
    })),
    entries: entries.map((e) => ({
      id: e.id,
      kind: e.kind,
      description: e.description,
      amount: fromCents(e.amount_cents),
      date: e.entry_date,
      paid_by: name.get(e.paid_by) ?? e.paid_by,
      paid_by_id: e.paid_by,
      to: e.transfer_to ? (name.get(e.transfer_to) ?? e.transfer_to) : null,
      shared_by:
        e.kind === "expense"
          ? [...expenseSplit(e).keys()].map((id) => name.get(id) ?? id)
          : [],
    })),
    settlement: settlements(bal).map((s) => ({
      from: name.get(s.from) ?? s.from,
      to: name.get(s.to) ?? s.to,
      amount: fromCents(s.amount_cents),
    })),
  };
}

/** The same data as prose, for models that read the text block. */
export function renderSplit(summary: SplitSummary): string {
  const money = (amount: number) =>
    formatMoney(Math.round(amount * 100), summary.currency, MCP_LOCALE);

  const lines = [
    `${summary.title} — ${summary.participants.length} participants, ${summary.currency}`,
    summary.url,
    "",
    `Total spent: ${money(summary.total_spent)}`,
  ];

  for (const p of summary.participants) {
    const sign = p.balance > 0 ? "is owed" : p.balance < 0 ? "owes" : "is square";
    const tail = p.balance === 0 ? "" : ` ${money(Math.abs(p.balance))}`;
    const settled =
      p.settled > 0
        ? `, paid back ${money(p.settled)}`
        : p.settled < 0
          ? `, received ${money(-p.settled)}`
          : "";
    lines.push(
      `  ${p.name}: paid ${money(p.paid)}, share ${money(p.owes)}${settled}` +
        ` → ${sign}${tail}`
    );
  }

  if (summary.entries.length > 0) {
    lines.push("", `Entries (${summary.entries.length}):`);
    for (const e of summary.entries) {
      // Transfers carry a description too (the web app shows it, falling back
      // to a plain "Transfer" label) — don't drop it here.
      const note = e.description ? ` — ${e.description}` : "";
      lines.push(
        e.kind === "transfer"
          ? `  ${e.date} · ${e.paid_by} paid ${e.to} ${money(e.amount)}${note} [${e.id}]`
          : `  ${e.date} · ${e.description ?? "(no description)"} — ${money(e.amount)}` +
              ` paid by ${e.paid_by}, shared by ${e.shared_by.join(", ")} [${e.id}]`
      );
    }
  }

  lines.push("");
  if (summary.settled) {
    lines.push("Everyone is square.");
  } else {
    lines.push("To settle up:");
    for (const s of summary.settlement) {
      lines.push(`  ${s.from} pays ${s.to} ${money(s.amount)}`);
    }
  }

  return lines.join("\n");
}
