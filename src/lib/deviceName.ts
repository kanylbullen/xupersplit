// Supabase doesn't name a passkey when it's registered, so a list of several
// reads as "Passkey, Passkey, Passkey". Label it after the device it was made
// on instead — best effort, and the user can't be worse off than no name.
export function guessDeviceName(): string | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android";
  if (/Macintosh|Mac OS X/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows";
  if (/Linux/.test(ua)) return "Linux";
  return null;
}
