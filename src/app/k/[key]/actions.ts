"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { clientIpHash } from "@/lib/ipHash";
import { clearPaymentMethodsIfSettled } from "@/lib/split/wipe";
import type { FeedbackContext, FeedbackKind } from "@/lib/feedback";
import { notifyFeedback } from "@/lib/notifyFeedback";

// On failure, `error` is a stable code (see dict.errors) the client translates.
export type ActionResult = { ok: true } | { ok: false; error: string };

const ERROR_CODES = [
  "split_not_found",
  "participant_has_entries",
  "participant_not_found",
  "entry_not_found",
  "name_required",
  "bad_amount",
  "shares_required",
  "bad_recipient",
  "bad_payment_type",
  "bad_payment_value",
  "too_many_methods",
  // Secure splits
  "login_required",
  "not_your_participant",
  "not_your_entry",
  "not_a_member",
  "awaiting_claims",
  "creator_only",
  "already_claimed",
  "slot_taken",
  "not_invited",
  "not_secure",
  "farcaster_required",
  // Feedback. The codes are prefixed because the match is a substring test and
  // a bare `rate_limited` already means "too many splits are being created" —
  // and for the same reason the global one has to come before the per-network
  // one, which is a substring of it.
  "feedback_rate_limited_global",
  "feedback_rate_limited",
  "bad_email",
  // `message_required` and `message_too_long` are deliberately absent: the form
  // won't submit under five characters and caps the field at 4000, so they only
  // fire on a tampered client and can fall through to the generic message.
];

function errorCode(message: string | undefined): string {
  return ERROR_CODES.find((code) => message?.includes(code)) ?? "unknown";
}

async function rpc(
  key: string,
  fn: string,
  args: Record<string, unknown>
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc(fn, args);
  if (error) return { ok: false, error: errorCode(error.message) };
  revalidatePath(`/k/${key}`);
  return { ok: true };
}

export async function claimParticipantAction(
  key: string,
  participantId: string,
  fc?: { fid: number; username?: string | null; pfp?: string | null }
): Promise<ActionResult> {
  return rpc(key, "claim_participant", {
    p_key: key,
    p_id: participantId,
    p_fid: fc?.fid ?? null,
    p_username: fc?.username ?? null,
    p_pfp: fc?.pfp ?? null,
  });
}

export async function unclaimParticipantAction(key: string): Promise<ActionResult> {
  return rpc(key, "unclaim_participant", { p_key: key });
}

export async function markSeenAction(
  key: string,
  participantId: string
): Promise<ActionResult> {
  return rpc(key, "mark_seen", { p_key: key, p_id: participantId });
}

export async function setReadyAction(
  key: string,
  participantId: string,
  on: boolean
): Promise<ActionResult> {
  return rpc(key, "set_ready", { p_key: key, p_id: participantId, p_on: on });
}

export type EntryInput = {
  id?: string;
  kind: "expense" | "transfer";
  description?: string;
  amount_cents: number;
  paid_by: string;
  transfer_to?: string;
  entry_date: string;
  orig_currency?: string;
  orig_amount_cents?: number;
  fx_rate?: number;
  shares: { participant_id: string; weight?: number; amount_cents?: number }[];
};

export async function saveEntryAction(
  key: string,
  entry: EntryInput
): Promise<ActionResult> {
  const result = await rpc(key, "save_entry", { p_key: key, p_entry: entry });

  // Privacy: once a transfer makes everyone square, stored payment methods
  // have served their purpose — wipe them.
  if (result.ok && entry.kind === "transfer") {
    const supabase = await createClient();
    if (await clearPaymentMethodsIfSettled(supabase, key)) {
      revalidatePath(`/k/${key}`);
    }
  }
  return result;
}

export async function setAutoPurgeAction(
  key: string,
  on: boolean
): Promise<ActionResult> {
  return rpc(key, "set_auto_purge", { p_key: key, p_on: on });
}

export async function setKeepPaymentAction(
  key: string,
  on: boolean
): Promise<ActionResult> {
  return rpc(key, "set_keep_payment", { p_key: key, p_on: on });
}

export async function deleteEntryAction(
  key: string,
  entryId: string
): Promise<ActionResult> {
  return rpc(key, "delete_entry", { p_key: key, p_id: entryId });
}

export async function addParticipantAction(
  key: string,
  name: string
): Promise<ActionResult> {
  return rpc(key, "add_participant", { p_key: key, p_name: name });
}

export async function renameParticipantAction(
  key: string,
  participantId: string,
  name: string
): Promise<ActionResult> {
  return rpc(key, "rename_participant", {
    p_key: key,
    p_id: participantId,
    p_name: name,
  });
}

export async function deleteParticipantAction(
  key: string,
  participantId: string
): Promise<ActionResult> {
  return rpc(key, "delete_participant", { p_key: key, p_id: participantId });
}

export async function setPaymentMethodsAction(
  key: string,
  participantId: string,
  methods: { type: string; value: string }[]
): Promise<ActionResult> {
  return rpc(key, "set_payment_methods", {
    p_key: key,
    p_id: participantId,
    p_methods: methods,
  });
}

export async function updateSplitAction(
  key: string,
  title: string,
  currency: string
): Promise<ActionResult> {
  return rpc(key, "update_split", {
    p_key: key,
    p_title: title,
    p_currency: currency,
  });
}

/**
 * In-app feedback. Deliberately does not touch GitHub: the repo is public and
 * the reporter's address bar holds the split key, so anything auto-filed would
 * publish their split. This lands in a private table; promoting a report to an
 * issue is a separate, human decision.
 */
export async function submitFeedbackAction(
  key: string | null,
  input: {
    kind: FeedbackKind;
    message: string;
    replyEmail: string;
    context: FeedbackContext;
  }
): Promise<ActionResult> {
  const supabase = await createClient();
  const ipHash = clientIpHash(await headers());

  const { data, error } = await supabase.rpc("submit_feedback", {
    p_kind: input.kind,
    p_message: input.message,
    p_split_key: key,
    p_reply_email: input.replyEmail.trim() || null,
    p_context: input.context,
    p_ip_hash: ipHash,
  });

  if (error || !data) return { ok: false, error: errorCode(error?.message) };

  const saved = data as { id: string; split_id: string | null };

  // Never let the notification decide whether the report succeeded.
  await notifyFeedback({
    id: saved.id,
    kind: input.kind,
    message: input.message,
    replyEmail: input.replyEmail.trim() || null,
    splitId: saved.split_id,
    context: input.context,
  });

  return { ok: true };
}
