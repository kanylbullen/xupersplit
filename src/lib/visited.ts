// Splits this device has opened, so the landing page can list them without an
// account. Written by SplitApp on every visit, read by MySplits and AccountMenu.
export const VISITED_KEY = "xupersplit:visited";

export type VisitedSplit = { key: string; title: string; at: number };

export function writeVisited(items: VisitedSplit[]): void {
  try {
    localStorage.setItem(VISITED_KEY, JSON.stringify(items.slice(0, 50)));
  } catch {
    // private mode or a full quota — the list is a convenience, not state
  }
}

export function readVisited(): VisitedSplit[] {
  try {
    const raw = JSON.parse(
      localStorage.getItem(VISITED_KEY) ?? "[]"
    ) as VisitedSplit[];
    return raw.filter((v) => v.key && v.title);
  } catch {
    // corrupt localStorage — start over
    return [];
  }
}

// Keys this browser has already handed to an account. Once follow_splits has
// seen a key the account's answer is the whole truth, and my_splits() leaves
// out two kinds of split on purpose: the ones the user hid, and members-only
// ones they can't open. Neither may crawl back onto the list just because the
// key is still sitting in this browser's history. Kept per user so a second
// account signing in on the same browser still syncs its own history.
const SYNCED_PREFIX = "xupersplit:synced:";

export function readSynced(userId: string): string[] {
  try {
    const raw = JSON.parse(
      localStorage.getItem(SYNCED_PREFIX + userId) ?? "[]"
    ) as string[];
    return raw.filter((k) => typeof k === "string");
  } catch {
    return [];
  }
}

export function writeSynced(userId: string, keys: string[]): void {
  try {
    // Same 200 as follow_splits' own cap — no point remembering keys we'd
    // never be allowed to send in one batch anyway.
    localStorage.setItem(
      SYNCED_PREFIX + userId,
      JSON.stringify([...new Set(keys)].slice(-200))
    );
  } catch {
    // private mode or a full quota — worst case the sync runs again
  }
}
