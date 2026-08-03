import type { Participant } from "@/lib/types";
import { McpToolError, resolveParticipant, toCents } from "./split";

export type ShareInput = { participant: string; amount?: number; weight?: number };

type Share = { participant_id: string; weight?: number; amount_cents?: number };

/**
 * Turn the two ways an agent can describe an expense split into `save_entry`
 * shares:
 *
 *   nothing given   → everyone, equally
 *   split_between   → those people, equally
 *   shares          → exact amounts (must add up) or relative weights
 *
 * Equal splitting is expressed as weight 1 each, so the database's
 * largest-remainder rounding handles the odd cent exactly like the web app.
 */
export function buildShares(
  participants: Participant[],
  amountCents: number,
  splitBetween: string[] | undefined,
  shares: ShareInput[] | undefined
): Share[] {
  if (splitBetween && shares) {
    throw new McpToolError(
      "Pass either split_between (equal shares) or shares (custom), not both."
    );
  }

  if (shares) return customShares(participants, amountCents, shares);

  const people = splitBetween
    ? dedupe(splitBetween.map((ref) => resolveParticipant(participants, ref)))
    : participants;
  if (people.length === 0) {
    throw new McpToolError("An expense needs at least one person to share it.");
  }
  return people.map((p) => ({ participant_id: p.id, weight: 1 }));
}

function customShares(
  participants: Participant[],
  amountCents: number,
  shares: ShareInput[]
): Share[] {
  if (shares.length === 0) {
    throw new McpToolError("shares is empty — list at least one person.");
  }

  const resolved = shares.map((s) => ({
    participant: resolveParticipant(participants, s.participant),
    amount: s.amount,
    weight: s.weight,
  }));

  const withAmount = resolved.filter((s) => s.amount !== undefined);
  const withWeight = resolved.filter((s) => s.weight !== undefined);
  if (withAmount.length > 0 && withWeight.length > 0) {
    throw new McpToolError(
      "Mixing exact amounts and weights in one expense isn't supported — use one or the other."
    );
  }

  const seen = new Set<string>();
  for (const s of resolved) {
    if (seen.has(s.participant.id)) {
      throw new McpToolError(`${s.participant.name} appears twice in shares.`);
    }
    seen.add(s.participant.id);
  }

  // Exact amounts: they're used verbatim, so they have to add up or the
  // balances silently stop matching the receipt.
  if (withAmount.length === resolved.length) {
    const cents = resolved.map((s) => toCents(s.amount!, "share amount"));
    const sum = cents.reduce((a, b) => a + b, 0);
    if (sum !== amountCents) {
      throw new McpToolError(
        `The share amounts add up to ${sum / 100}, but the expense is ${amountCents / 100}.`
      );
    }
    return resolved.map((s, i) => ({
      participant_id: s.participant.id,
      amount_cents: cents[i],
    }));
  }

  return resolved.map((s) => {
    const weight = s.weight ?? 1;
    if (!Number.isFinite(weight) || weight <= 0) {
      throw new McpToolError(
        `Weight for ${s.participant.name} must be greater than zero.`
      );
    }
    return { participant_id: s.participant.id, weight };
  });
}

function dedupe(people: Participant[]): Participant[] {
  const seen = new Set<string>();
  return people.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
}
