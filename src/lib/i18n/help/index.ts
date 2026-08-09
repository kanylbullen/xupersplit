import type { Locale } from "../config";
import type { Help } from "./types";
import sv from "./sv";
import en from "./en";
import nb from "./nb";
import da from "./da";
import fi from "./fi";
import is from "./is";

// Kept out of the main dictionaries on purpose: /help is longer than every
// other page's copy put together, and the six 440-line dictionary files are
// hard enough to scan already.
const HELP: Record<Locale, Help> = { sv, en, nb, da, fi, is };

export function getHelp(locale: Locale): Help {
  return HELP[locale] ?? en;
}

export type { Help };
