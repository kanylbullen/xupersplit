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
