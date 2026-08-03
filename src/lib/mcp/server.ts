import type { McpServer } from "@modelcontextprotocol/server";
import { after } from "next/server";
import { track } from "@vercel/analytics/server";
import { z } from "zod";
import { clientIpHash } from "@/lib/ipHash";
import { CURRENCIES } from "@/lib/money";
import { PAYMENT_TYPES } from "@/lib/payment";
import { clearPaymentMethodsIfSettled } from "@/lib/split/wipe";
import { createAnonClient } from "@/lib/supabase/anon";
import { buildShares, type ShareInput } from "./entry";
import {
  callRpc,
  checkDate,
  describeSplit,
  fetchSplit,
  McpToolError,
  parseSplitKey,
  renderSplit,
  resolveParticipant,
  type RpcClient,
  SPLIT_SCHEMA,
  splitUrl,
  toCents,
} from "./split";

/** What the SDK hands a tool callback — we only need the raw HTTP request. */
type ToolCtx = { http?: { req?: globalThis.Request } };

type ToolResult = {
  content: { type: "text"; text: string }[];
  structuredContent?: unknown;
  isError?: boolean;
};

// ── Shared argument shapes ───────────────────────────────────────────────────

const splitArg = z
  .string()
  .describe(
    "The split key, or the whole https://split.xuper.fun/k/<key> link.",
  );

const participantArg = (what: string) =>
  z.string().describe(`${what} — a participant's name (or id) in this split.`);

const amountArg = z
  .number()
  .positive()
  .describe("Amount in the split's currency, as a decimal (e.g. 249.50).");

const dateArg = z
  .string()
  .optional()
  .describe("Date as YYYY-MM-DD. Defaults to today.");

const shareArg = z
  .array(
    z.object({
      participant: z.string(),
      amount: z.number().positive().optional(),
      weight: z.number().positive().optional(),
    }),
  )
  .optional()
  .describe(
    "Uneven split. Either an exact `amount` per person (must add up to the " +
      "total) or a relative `weight` per person (e.g. weight 2 for a couple). " +
      "Don't combine with split_between.",
  );

const splitBetweenArg = z
  .array(z.string())
  .optional()
  .describe(
    "Names of the people sharing this cost, split equally. Defaults to everyone.",
  );

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Re-read the split after a change and return it. The extra round trip means
 * an agent sees the new balances straight away instead of having to follow up
 * with get_split — which it would do anyway.
 */
async function respond(
  supabase: RpcClient,
  key: string,
  headline: string,
): Promise<ToolResult> {
  const summary = describeSplit(await fetchSplit(supabase, key));
  return {
    content: [{ type: "text", text: `${headline}\n\n${renderSplit(summary)}` }],
    structuredContent: summary,
  };
}

/**
 * Messages meant for the agent come back as tool errors, not crashes — and
 * every call is counted on the way out.
 *
 * Usage is measured here rather than in the handler's event hook because this
 * is the only place that knows both which tool ran and how it went: a rejected
 * call still answers with a normal JSON-RPC result, so the transport counts it
 * a success either way. Only the tool name and that verdict are recorded — the arguments
 * hold split keys and participant names, and the error messages name people
 * too, so neither is ever sent.
 */
async function guard(
  tool: string,
  run: () => Promise<ToolResult>,
): Promise<ToolResult> {
  const count = (ok: boolean) =>
    after(() => track("mcp_tool", { tool, ok }).catch(() => {}));
  try {
    const result = await run();
    count(true);
    return result;
  } catch (error) {
    if (error instanceof McpToolError) {
      count(false);
      return {
        isError: true,
        content: [{ type: "text", text: error.message }],
      };
    }
    throw error;
  }
}

/** Resolve a split and its participants in one step — nearly every tool needs both. */
async function openSplit(supabase: RpcClient, ref: string) {
  const key = parseSplitKey(ref);
  const data = await fetchSplit(supabase, key);
  return { key, data };
}

// ── Tools ────────────────────────────────────────────────────────────────────

const SECURE_NOTE =
  "Works on simple, accountless splits. Secure splits (created by a signed-in " +
  "user) are read-only here and must be opened in a browser.";

export function registerSplitTools(server: McpServer): void {
  const supabase = createAnonClient();

  server.registerTool(
    "create_split",
    {
      title: "Create a split",
      description:
        "Create a new xupersplit for sharing expenses in a group. No account " +
        "needed. Returns a secret link — give it to the user and tell them to " +
        "share it with the group, since anyone holding the link can see and " +
        "edit the split.",
      inputSchema: z.object({
        title: z
          .string()
          .min(1)
          .describe('What the split is for, e.g. "Ski trip".'),
        participants: z
          .array(z.string().min(1))
          .min(2)
          .describe("Names of everyone splitting, at least two."),
        currency: z
          .enum(CURRENCIES)
          .optional()
          .describe("Currency code. Defaults to SEK."),
      }),
      outputSchema: SPLIT_SCHEMA,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async ({ title, participants, currency }, ctx: ToolCtx) =>
      guard("create_split", async () => {
        const names = participants.map((n) => n.trim()).filter(Boolean);
        if (names.length < 2) {
          throw new McpToolError(
            "A split needs at least two named participants.",
          );
        }

        // Per-IP creation throttle, but on the MCP bucket rather than the web
        // one: hosted clients (ChatGPT connectors, Claude on the web) reach us
        // from a handful of shared egress IPs, so the whole user base of a
        // client lands in a single bucket. p_source picks the wider cap.
        const req = ctx.http?.req;
        const key = await callRpc<string>(supabase, "create_split", {
          p_title: title.trim(),
          p_currency: currency ?? "SEK",
          p_names: names,
          p_ip_hash: req ? clientIpHash(req.headers) : null,
          p_source: "mcp",
        });

        await track("mcp_split_created", {
          participants: names.length,
          currency: currency ?? "SEK",
        }).catch(() => {});

        return respond(
          supabase,
          key,
          `Created the split. Share this link with the group:\n${splitUrl(key)}`,
        );
      }),
  );

  server.registerTool(
    "get_split",
    {
      title: "Read a split",
      description:
        "Read a split: participants, expenses, per-person balances and the " +
        "shortest set of payments that settles everyone up.",
      inputSchema: z.object({ split: splitArg }),
      outputSchema: SPLIT_SCHEMA,
      annotations: { readOnlyHint: true },
    },
    async ({ split }) =>
      guard("get_split", async () => {
        const key = parseSplitKey(split);
        const summary = describeSplit(await fetchSplit(supabase, key));
        return {
          content: [{ type: "text", text: renderSplit(summary) }],
          structuredContent: summary,
        };
      }),
  );

  server.registerTool(
    "add_expense",
    {
      title: "Add an expense",
      description:
        `Record something one person paid for the group. Split equally by ` +
        `default; pass split_between for a subset, or shares for an uneven ` +
        `split. One expense covers one set of people — a receipt whose items ` +
        `aren't all shared by everyone is several expenses, so call this once ` +
        `per group of items that the same people share, rather than splitting ` +
        `the total equally. ${SECURE_NOTE}`,
      inputSchema: z.object({
        split: splitArg,
        amount: amountArg,
        paid_by: participantArg("Who paid"),
        description: z
          .string()
          .optional()
          .describe('What it was, e.g. "Groceries".'),
        split_between: splitBetweenArg,
        shares: shareArg,
        date: dateArg,
      }),
      outputSchema: SPLIT_SCHEMA,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async ({
      split,
      amount,
      paid_by,
      description,
      split_between,
      shares,
      date,
    }) =>
      guard("add_expense", async () => {
        const { key, data } = await openSplit(supabase, split);
        const amountCents = toCents(amount);
        const payer = resolveParticipant(data.participants, paid_by);

        await callRpc(
          supabase,
          "save_entry",
          {
            p_key: key,
            p_entry: {
              kind: "expense",
              description,
              amount_cents: amountCents,
              paid_by: payer.id,
              entry_date: checkDate(date),
              shares: buildShares(
                data.participants,
                amountCents,
                split_between,
                shares as ShareInput[] | undefined,
              ),
            },
          },
          key,
        );

        return respond(supabase, key, `Added the expense.`);
      }),
  );

  server.registerTool(
    "record_payment",
    {
      title: "Record a payment",
      description:
        `Record that one person paid another back, settling part or all of a ` +
        `debt. Use get_split first to see who should pay whom. ${SECURE_NOTE}`,
      inputSchema: z.object({
        split: splitArg,
        from: participantArg("Who sent the money"),
        to: participantArg("Who received it"),
        amount: amountArg,
        description: z
          .string()
          .optional()
          .describe(
            'How it was paid, e.g. "Swish, 3 March". Shown in the history.',
          ),
        date: dateArg,
      }),
      outputSchema: SPLIT_SCHEMA,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async ({ split, from, to, amount, description, date }) =>
      guard("record_payment", async () => {
        const { key, data } = await openSplit(supabase, split);
        const sender = resolveParticipant(data.participants, from);
        const recipient = resolveParticipant(data.participants, to);
        if (sender.id === recipient.id) {
          throw new McpToolError(`${sender.name} can't pay themselves.`);
        }

        await callRpc(
          supabase,
          "save_entry",
          {
            p_key: key,
            p_entry: {
              kind: "transfer",
              description,
              amount_cents: toCents(amount),
              paid_by: sender.id,
              transfer_to: recipient.id,
              entry_date: checkDate(date),
            },
          },
          key,
        );

        // Privacy: wipe stored payment details once everyone is square, just
        // like the web app does after the last transfer.
        await clearPaymentMethodsIfSettled(supabase, key);

        return respond(supabase, key, `Recorded the payment.`);
      }),
  );

  server.registerTool(
    "update_entry",
    {
      title: "Update an entry",
      description:
        `Change an existing expense or payment. Only the fields you pass are ` +
        `changed. Entry ids come from get_split. ${SECURE_NOTE}`,
      inputSchema: z.object({
        split: splitArg,
        entry_id: z.string().describe("The entry's id, from get_split."),
        amount: amountArg.optional(),
        description: z.string().optional(),
        paid_by: z
          .string()
          .optional()
          .describe("Move the entry to a different payer."),
        to: z.string().optional().describe("New recipient — payments only."),
        split_between: splitBetweenArg,
        shares: shareArg,
        date: dateArg,
      }),
      outputSchema: SPLIT_SCHEMA,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async (args) =>
      guard("update_entry", async () => {
        const { key, data } = await openSplit(supabase, args.split);
        const existing = data.entries.find((e) => e.id === args.entry_id);
        if (!existing) {
          throw new McpToolError(
            `No entry ${args.entry_id} in this split. Call get_split for the current ids.`,
          );
        }

        const amountCents =
          args.amount === undefined
            ? existing.amount_cents
            : toCents(args.amount);
        const payer = args.paid_by
          ? resolveParticipant(data.participants, args.paid_by)
          : { id: existing.paid_by };

        // save_entry replaces the whole row, so unchanged fields are carried over.
        const entry: Record<string, unknown> = {
          id: existing.id,
          kind: existing.kind,
          amount_cents: amountCents,
          paid_by: payer.id,
          description: args.description ?? existing.description ?? undefined,
          entry_date: checkDate(args.date) ?? existing.entry_date,
        };

        if (existing.kind === "transfer") {
          const recipient = args.to
            ? resolveParticipant(data.participants, args.to)
            : { id: existing.transfer_to! };
          if (recipient.id === payer.id) {
            throw new McpToolError("A payment needs two different people.");
          }
          entry.transfer_to = recipient.id;
        } else if (args.split_between || args.shares) {
          entry.shares = buildShares(
            data.participants,
            amountCents,
            args.split_between,
            args.shares as ShareInput[] | undefined,
          );
        } else {
          // Keep the existing division; re-send it since the row is replaced.
          const exact = existing.shares.some((s) => s.amount_cents !== null);
          // Exact amounts can't survive a new total — silently falling back to
          // an equal split would quietly change who owes what.
          if (exact && args.amount !== undefined) {
            throw new McpToolError(
              "This expense splits into exact per-person amounts, so changing " +
                "the total means restating them. Pass shares with the new " +
                "amounts, or split_between to switch to an equal split.",
            );
          }
          entry.shares = existing.shares.map((s) =>
            exact
              ? {
                  participant_id: s.participant_id,
                  amount_cents: s.amount_cents,
                }
              : { participant_id: s.participant_id, weight: s.weight },
          );
        }

        await callRpc(
          supabase,
          "save_entry",
          { p_key: key, p_entry: entry },
          key,
        );
        if (existing.kind === "transfer") {
          await clearPaymentMethodsIfSettled(supabase, key);
        }
        return respond(supabase, key, "Updated the entry.");
      }),
  );

  server.registerTool(
    "delete_entry",
    {
      title: "Delete an entry",
      description: `Remove an expense or payment for good. ${SECURE_NOTE}`,
      inputSchema: z.object({
        split: splitArg,
        entry_id: z.string().describe("The entry's id, from get_split."),
      }),
      outputSchema: SPLIT_SCHEMA,
      annotations: { readOnlyHint: false, destructiveHint: true },
    },
    async ({ split, entry_id }) =>
      guard("delete_entry", async () => {
        const key = parseSplitKey(split);
        await callRpc(
          supabase,
          "delete_entry",
          { p_key: key, p_id: entry_id },
          key,
        );
        return respond(supabase, key, "Deleted the entry.");
      }),
  );

  server.registerTool(
    "add_participant",
    {
      title: "Add a participant",
      description: `Add someone to an existing split. ${SECURE_NOTE}`,
      inputSchema: z.object({ split: splitArg, name: z.string().min(1) }),
      outputSchema: SPLIT_SCHEMA,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async ({ split, name }) =>
      guard("add_participant", async () => {
        const key = parseSplitKey(split);
        await callRpc(
          supabase,
          "add_participant",
          { p_key: key, p_name: name },
          key,
        );
        return respond(supabase, key, `Added ${name.trim()}.`);
      }),
  );

  server.registerTool(
    "rename_participant",
    {
      title: "Rename a participant",
      description: `Change a participant's name. ${SECURE_NOTE}`,
      inputSchema: z.object({
        split: splitArg,
        participant: participantArg("Who to rename"),
        name: z.string().min(1).describe("The new name."),
      }),
      outputSchema: SPLIT_SCHEMA,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async ({ split, participant, name }) =>
      guard("rename_participant", async () => {
        const { key, data } = await openSplit(supabase, split);
        const person = resolveParticipant(data.participants, participant);
        await callRpc(
          supabase,
          "rename_participant",
          { p_key: key, p_id: person.id, p_name: name },
          key,
        );
        return respond(
          supabase,
          key,
          `Renamed ${person.name} to ${name.trim()}.`,
        );
      }),
  );

  server.registerTool(
    "remove_participant",
    {
      title: "Remove a participant",
      description:
        `Remove someone from a split. Only works if they aren't on any ` +
        `expense yet. ${SECURE_NOTE}`,
      inputSchema: z.object({
        split: splitArg,
        participant: participantArg("Who to remove"),
      }),
      outputSchema: SPLIT_SCHEMA,
      annotations: { readOnlyHint: false, destructiveHint: true },
    },
    async ({ split, participant }) =>
      guard("remove_participant", async () => {
        const { key, data } = await openSplit(supabase, split);
        const person = resolveParticipant(data.participants, participant);
        await callRpc(
          supabase,
          "delete_participant",
          { p_key: key, p_id: person.id },
          key,
        );
        return respond(supabase, key, `Removed ${person.name}.`);
      }),
  );

  server.registerTool(
    "set_payment_methods",
    {
      title: "Set payment details",
      description:
        `Set how a participant wants to be paid back, so the split can show a ` +
        `QR code or pay link. Replaces their current list (pass an empty ` +
        `array to clear it). ${SECURE_NOTE}`,
      inputSchema: z.object({
        split: splitArg,
        participant: participantArg("Whose details these are"),
        methods: z
          .array(
            z.object({
              type: z.enum(PAYMENT_TYPES),
              value: z
                .string()
                .describe(
                  "Phone number for swish/vipps/mobilepay, IBAN, Revolut tag, " +
                    "Lightning address, 0x/ENS address, or Solana address.",
                ),
            }),
          )
          .max(8),
      }),
      outputSchema: SPLIT_SCHEMA,
      annotations: { readOnlyHint: false, destructiveHint: true },
    },
    async ({ split, participant, methods }) =>
      guard("set_payment_methods", async () => {
        const { key, data } = await openSplit(supabase, split);
        const person = resolveParticipant(data.participants, participant);
        await callRpc(
          supabase,
          "set_payment_methods",
          { p_key: key, p_id: person.id, p_methods: methods },
          key,
        );
        return respond(
          supabase,
          key,
          `Updated payment details for ${person.name}.`,
        );
      }),
  );

  server.registerTool(
    "update_split",
    {
      title: "Rename a split",
      description:
        `Change a split's title or currency. The currency is locked once the ` +
        `split has expenses. ${SECURE_NOTE}`,
      inputSchema: z.object({
        split: splitArg,
        title: z.string().min(1).optional(),
        currency: z.enum(CURRENCIES).optional(),
      }),
      outputSchema: SPLIT_SCHEMA,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async ({ split, title, currency }) =>
      guard("update_split", async () => {
        const { key, data } = await openSplit(supabase, split);
        if (!title && !currency) {
          throw new McpToolError("Pass a new title, a new currency, or both.");
        }
        // The database silently keeps the old currency once entries exist
        // (every amount is stored in the main currency, so switching would
        // relabel the totals without converting). Say so rather than report a
        // change that didn't happen.
        if (
          currency &&
          currency !== data.split.currency &&
          data.entries.length > 0
        ) {
          throw new McpToolError(
            `The currency is locked to ${data.split.currency} because this ` +
              `split already has expenses — every amount is stored in it. ` +
              `Delete the entries first, or start a new split in ${currency}.`,
          );
        }
        await callRpc(
          supabase,
          "update_split",
          {
            p_key: key,
            p_title: title ?? data.split.title,
            p_currency: currency ?? data.split.currency,
          },
          key,
        );
        return respond(supabase, key, "Updated the split.");
      }),
  );
}
