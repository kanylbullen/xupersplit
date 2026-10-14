export type PaymentType =
  | "swish"
  | "vipps"
  | "mobilepay"
  | "iban"
  | "revolut"
  | "lightning"
  | "evm"
  | "solana";

type PaymentMeta = {
  label: string;
  /** Country hint shown next to the label. */
  hint: string;
  kind: "phone" | "iban" | "revtag" | "lnaddress" | "evmaddress" | "soladdress";
  placeholder: string;
};

export const PAYMENT_META: Record<PaymentType, PaymentMeta> = {
  swish: { label: "Swish", hint: "SE", kind: "phone", placeholder: "070-123 45 67" },
  vipps: { label: "Vipps", hint: "NO", kind: "phone", placeholder: "412 34 567" },
  mobilepay: { label: "MobilePay", hint: "DK/FI", kind: "phone", placeholder: "12 34 56 78" },
  revolut: { label: "Revolut", hint: "revtag", kind: "revtag", placeholder: "@john" },
  lightning: { label: "Lightning", hint: "bitcoin", kind: "lnaddress", placeholder: "satoshi@strike.me" },
  evm: { label: "Ethereum", hint: "EVM", kind: "evmaddress", placeholder: "0x… / namn.eth" },
  solana: { label: "Solana", hint: "USDC", kind: "soladdress", placeholder: "Solana-adress" },
  iban: { label: "IBAN", hint: "", kind: "iban", placeholder: "SE35 5000 0000 0549 1000 0003" },
};

export const PAYMENT_TYPES = Object.keys(PAYMENT_META) as PaymentType[];

/** Strip formatting; returns canonical value, or null if invalid for the type. */
export function normalizePayment(type: PaymentType, input: string): string | null {
  if (PAYMENT_META[type].kind === "iban") {
    const clean = input.replace(/\s/g, "").toUpperCase();
    return /^[A-Z]{2}[0-9]{2}[A-Z0-9]{8,30}$/.test(clean) ? clean : null;
  }
  if (PAYMENT_META[type].kind === "revtag") {
    // Revtags are case-insensitive; store lowercase without the leading '@'.
    const clean = input.trim().replace(/^@/, "").toLowerCase();
    return /^[a-z0-9]{4,30}$/.test(clean) ? clean : null;
  }
  if (PAYMENT_META[type].kind === "lnaddress") {
    // LUD-16 lightning address — email-like, case-insensitive.
    const clean = input.trim().toLowerCase();
    return /^[a-z0-9._%+-]+@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(clean) &&
      clean.length <= 320
      ? clean
      : null;
  }
  if (PAYMENT_META[type].kind === "evmaddress") {
    // 0x address (stored lowercase — wallets accept non-checksummed) or ENS.
    const clean = input.trim().toLowerCase();
    if (/^0x[0-9a-f]{40}$/.test(clean)) return clean;
    return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.eth$/.test(clean) &&
      clean.length <= 255
      ? clean
      : null;
  }
  if (PAYMENT_META[type].kind === "soladdress") {
    // base58 Solana address — case-sensitive, never lowercase.
    const clean = input.trim();
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(clean) ? clean : null;
  }
  // Swish is Swedish-only, so it gets a stricter check than vipps/mobilepay
  // and is stored in the one form the QR and app link take.
  if (type === "swish") {
    return swishPayee(input);
  }
  // phone-type (vipps/mobilepay)
  const clean = input.replace(/[\s\-()./]/g, "");
  return /^\+?[0-9]{6,15}$/.test(clean) ? clean : null;
}

/**
 * Canonical Swish payee: a mobile number as 07XXXXXXXX, or a Swish Handel
 * (123…) or charity (90…) number as-is. Null when it is not a Swish number.
 *
 * Stored Swish values can still be +46…, 0046… or 46…: the database (and so
 * the MCP tools) only checks for 6–15 digits, and an agent writes a Swedish
 * number the international way. Read paths canonicalise through this rather
 * than trusting the stored form.
 */
export function swishPayee(value: string): string | null {
  const clean = value.replace(/[\s\-()./]/g, "");
  const mobile = clean.match(/^(?:\+46|0046|46)?0?(7\d{8})$/);
  if (mobile) return `0${mobile[1]}`;
  return /^123\d{7}$/.test(clean) || /^90\d{5}$/.test(clean) ? clean : null;
}

/** Pretty-print a stored payment value for display. */
export function formatPayment(type: PaymentType, value: string): string {
  if (PAYMENT_META[type].kind === "iban") {
    return value.replace(/(.{4})/g, "$1 ").trim();
  }
  if (type === "revolut") {
    return `@${value}`;
  }
  // Long 0x addresses get the usual middle-ellipsis; ENS names shown as-is.
  if (type === "evm" && value.startsWith("0x")) {
    return `${value.slice(0, 6)}…${value.slice(-4)}`;
  }
  // Solana addresses are long base58 — middle-ellipsize.
  if (type === "solana") {
    return `${value.slice(0, 4)}…${value.slice(-4)}`;
  }
  // Swedish Swish numbers get the familiar grouping; others shown as-is.
  const swish = type === "swish" ? swishPayee(value) : null;
  if (swish && /^07\d{8}$/.test(swish)) {
    return `${swish.slice(0, 3)}-${swish.slice(3, 6)} ${swish.slice(6, 8)} ${swish.slice(8)}`;
  }
  return value;
}

/** True when this method supports a prefilled QR + app link (Swish only). */
export function hasRichLink(type: PaymentType): boolean {
  return type === "swish";
}

/** True when this method opens a one-tap deep link to pay (Revolut). */
export function hasAppLink(type: PaymentType): boolean {
  return type === "revolut";
}

/**
 * Revolut.me deep link — opens Revolut to pay this revtag. Revolut only honours
 * the bare profile path; amount can't be prefilled in a static revtag link
 * (amount-bearing links are generated in-app), so the payer enters it manually.
 */
export function revolutLink(tag: string): string {
  return `https://revolut.me/${tag}`;
}

/**
 * Official Swish app link — opens the Swish app with everything prefilled.
 * `amountOre` is in kronor (öre); null leaves the amount for the payer to
 * enter, for when a split in another currency couldn't be converted.
 */
export function swishAppLink(
  number: string,
  amountOre: number | null,
  message: string
): string {
  const params = new URLSearchParams({ sw: number });
  if (amountOre !== null) {
    params.set("amt", (amountOre / 100).toFixed(2));
    params.set("cur", "SEK");
  }
  params.set("msg", message.slice(0, 50));
  return `https://app.swish.nu/1/p/sw/?${params.toString()}`;
}
