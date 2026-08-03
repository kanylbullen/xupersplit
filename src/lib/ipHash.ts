import { createHash } from "crypto";

/** Anything with a header lookup: next/headers' store, or a Request's Headers. */
type HeaderLookup = { get(name: string): string | null };

/**
 * Hashed client IP, feeding the per-IP creation throttle in `create_split`.
 *
 * A client can spoof x-forwarded-for, but x-vercel-forwarded-for / x-real-ip
 * are set by the edge to the real client IP and can't be overridden from the
 * request. Returns null when no IP can be determined — the caller then only
 * has the global cap to lean on.
 */
export function clientIpHash(headers: HeaderLookup): string | null {
  const ip =
    headers.get("x-vercel-forwarded-for")?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    // Self-host behind a reverse proxy: first hop of x-forwarded-for.
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "";
  return ip
    ? createHash("sha256").update(`xupersplit:${ip}`).digest("hex").slice(0, 32)
    : null;
}
