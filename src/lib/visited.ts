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
