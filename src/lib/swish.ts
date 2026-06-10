/** Normalize a Swedish mobile number to Swish format (07XXXXXXXX). */
export function normalizeSwishNumber(input: string): string | null {
  let digits = input.replace(/[\s\-()+.]/g, "");
  if (digits.startsWith("0046")) digits = "0" + digits.slice(4);
  else if (digits.startsWith("46") && digits.length === 11)
    digits = "0" + digits.slice(2);
  return /^07\d{8}$/.test(digits) ? digits : null;
}

/** Pretty-print 0701234567 as "070-123 45 67". */
export function formatSwishNumber(number: string): string {
  return `${number.slice(0, 3)}-${number.slice(3, 6)} ${number.slice(6, 8)} ${number.slice(8)}`;
}

/** Official Swish app link — opens the Swish app with everything prefilled. */
export function swishAppLink(
  number: string,
  amountCents: number,
  message: string
): string {
  const params = new URLSearchParams({
    sw: number,
    amt: (amountCents / 100).toFixed(2),
    cur: "SEK",
    msg: message.slice(0, 50),
  });
  return `https://app.swish.nu/1/p/sw/?${params.toString()}`;
}
