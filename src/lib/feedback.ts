export const FEEDBACK_KINDS = ["bug", "suggestion", "other"] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

/** Diagnostics a reporter would never think to type. Never split contents. */
export type FeedbackContext = {
  locale?: string;
  secure?: boolean;
  participants?: number;
  entries?: number;
  currency?: string;
  userAgent?: string;
};

// A split key is 32 hex characters, and holding it *is* the access. It shows up
// in the address bar of anyone filling in the form, so assume it will be pasted
// into the message sooner or later.
const SPLIT_KEY = /\b[0-9a-f]{32}\b/gi;

/**
 * Strip split keys from text that is leaving the database — a notification
 * email, a GitHub issue, anything forwardable. The row keeps the real key so
 * the report stays reproducible; reaching for it should be a deliberate act,
 * not something that happens because you forwarded a mail.
 */
export function scrubSplitKeys(text: string): string {
  return text.replace(SPLIT_KEY, "[split key removed]");
}
