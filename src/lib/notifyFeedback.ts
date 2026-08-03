import "server-only";
import { scrubSplitKeys, type FeedbackContext, type FeedbackKind } from "./feedback";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * Mail a new feedback row to whoever triages. Best effort in both directions:
 * a no-op until RESEND_API_KEY is set, and a failure here never fails the
 * submission — someone reporting a bug shouldn't see an error because our
 * outbound mail is down.
 *
 * The split key is stripped from the message and the split is identified by its
 * id instead. An inbox gets forwarded and screenshotted; the database doesn't.
 */
export async function notifyFeedback(args: {
  id: string;
  kind: FeedbackKind;
  message: string;
  replyEmail: string | null;
  splitId: string | null;
  context: FeedbackContext;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const to = process.env.FEEDBACK_EMAIL_TO ?? "split@xuper.fun";
  const message = scrubSplitKeys(args.message);
  const firstLine = message.split("\n")[0].slice(0, 60);

  const body = [
    message,
    "",
    "—",
    `kind:      ${args.kind}`,
    `feedback:  ${args.id}`,
    `split:     ${args.splitId ?? "(none — outside a split, or already purged)"}`,
    `reply to:  ${args.replyEmail ?? "(not given)"}`,
    `context:   ${JSON.stringify(args.context)}`,
    "",
    "The split key is deliberately not in this mail. Look the split up by id if",
    "you need to reproduce it.",
  ].join("\n");

  try {
    await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Xupersplit <split@xuper.fun>",
        to,
        reply_to: args.replyEmail ?? undefined,
        subject: `[${args.kind}] ${firstLine || "feedback"}`,
        text: body,
      }),
    });
  } catch {
    // Swallowed on purpose — see the note above.
  }
}
