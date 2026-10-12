/**
 * How this device first met xupersplit, and whether it later crossed over.
 *
 * The product's only real distribution is the share link: someone drops a
 * split in a group chat and a handful of people use the app without ever
 * signing up. Whether that compounds comes down to one number — how many of
 * those recipients later start a split of their own — and none of the
 * existing events can tell the two apart, because both paths end up on the
 * same /k/<key> screen.
 *
 * So: /new leaves a one-shot marker in sessionStorage before the form posts,
 * and the split view reads it on arrival. Marker present → you made this.
 * Absent → somebody sent it to you.
 *
 * Known bias: a split an assistant created over MCP has no marker either, so
 * its owner opening the returned link counts as invited. That undercounts
 * creators by however much MCP is used — compare against the server-side
 * `mcp_split_created` before reading too much into a shift.
 */

/** Set by /new, consumed by the split view one navigation later. */
const JUST_CREATED = "xupersplit:just-created";

/** "created" | "invited" — how this device arrived, written once and kept. */
const ORIGIN = "xupersplit:origin";

/** Set once the crossover has been counted, so it's reported a single time. */
const CROSSED = "xupersplit:crossed";

export type Origin = "created" | "invited";

/** Called as the new-split form posts; survives the redirect to /k/<key>. */
export function markJustCreated(): void {
  try {
    sessionStorage.setItem(JUST_CREATED, "1");
  } catch {
    // private mode — the split just reads as an invite, which only costs us
    // a slightly pessimistic conversion number
  }
}

/** Reads and clears the marker. True when this device made the split. */
export function takeJustCreated(): boolean {
  try {
    const had = sessionStorage.getItem(JUST_CREATED) !== null;
    sessionStorage.removeItem(JUST_CREATED);
    return had;
  } catch {
    return false;
  }
}

export function readOrigin(): Origin | null {
  try {
    const v = localStorage.getItem(ORIGIN);
    return v === "created" || v === "invited" ? v : null;
  } catch {
    return null;
  }
}

/** First arrival wins — later splits don't rewrite how you got here. */
export function rememberOrigin(origin: Origin): void {
  try {
    if (!localStorage.getItem(ORIGIN)) localStorage.setItem(ORIGIN, origin);
  } catch {
    // nothing to do; the event still carries this visit's own origin
  }
}

/**
 * True exactly once: the first time a device that arrived through someone
 * else's link creates a split of its own. That's the loop closing.
 */
export function takeCrossover(): boolean {
  try {
    if (readOrigin() !== "invited") return false;
    if (localStorage.getItem(CROSSED)) return false;
    localStorage.setItem(CROSSED, "1");
    return true;
  } catch {
    return false;
  }
}

/*
 * The "start your own" nudge.
 *
 * The footer already says "made with xupersplit · create your own", but it
 * sits below everything and reads as boilerplate. The moment a recipient is
 * most open to the idea is right after they've used the thing — they just
 * logged what they paid and watched the balances update. So: invited devices
 * see one dismissible card after their first saved expense, and never again
 * once they act on it either way.
 */

/** Per split: this device made it ("created") or was sent it ("invited"). */
const SPLIT_ORIGIN = (key: string) => `xupersplit:origin:${key}`;

/** Device-wide: set once the nudge has been clicked or dismissed. */
const NUDGE_DONE = "xupersplit:nudge-done";

/** Recorded on first open, alongside the device-wide origin. */
export function rememberSplitOrigin(key: string, origin: Origin): void {
  try {
    if (!localStorage.getItem(SPLIT_ORIGIN(key)))
      localStorage.setItem(SPLIT_ORIGIN(key), origin);
  } catch {
    // no storage — the nudge just never shows, which is the safe failure
  }
}

/** True when this device arrived at this split through someone's link. */
export function wasInvitedTo(key: string): boolean {
  try {
    return localStorage.getItem(SPLIT_ORIGIN(key)) === "invited";
  } catch {
    return false;
  }
}

export function nudgeDone(): boolean {
  try {
    return localStorage.getItem(NUDGE_DONE) !== null;
  } catch {
    return true;
  }
}

export function markNudgeDone(): void {
  try {
    localStorage.setItem(NUDGE_DONE, "1");
  } catch {
    // worst case it comes back on the next expense; still one tap to close
  }
}
