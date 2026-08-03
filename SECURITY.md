# Security policy

Xupersplit is a hobby project, but it handles people's names, what they owe each
other and — through payment links — real money. Reports are genuinely welcome.

## Reporting a vulnerability

**Please don't open a public issue for a security problem.** Use GitHub's private
vulnerability reporting instead:

👉 **[Report a vulnerability](https://github.com/kanylbullen/xupersplit/security/advisories/new)**

If you'd rather not use GitHub, email **split@xuper.fun**.

Tell us what you found, how to reproduce it, and what an attacker could do with
it. A rough proof of concept helps more than a polished write-up.

Expect a first reply within a few days. This is one person's spare-time project,
so there is no bounty — but you'll be credited in the advisory unless you'd
rather not be.

## What runs where

The live service is `split.xuper.fun` (Next.js on Vercel, Postgres on Supabase
in Stockholm). Only the deployed `main` branch is supported; there are no
maintained release branches. Self-hosted copies are your own responsibility, but
we'll still want to hear about a flaw in the code.

## Especially interesting

- Reading or writing a split **without holding its link** — enumeration, an RPC
  that skips its own auth check, an RLS gap.
- Escaping the *secure split* identity model: acting as a participant you
  haven't claimed, claiming a slot reserved for someone else.
- Anything that makes a payment link or QR code point somewhere the participant
  didn't put there — Swish, IBAN, Lightning, EVM or Solana. This is the highest
  impact area: onchain transfers are irreversible.
- Getting a split key to leak — into a referrer, a log, an OG image, an error
  message, an analytics event.
- XSS or CSP bypass on `split.xuper.fun`, or anything that lets a page frame us
  outside the Farcaster allowlist.

## Working as intended — please don't report these

These look alarming and aren't:

- **Anyone holding a split link can read and edit that split.** The link *is*
  the capability, deliberately, like a shared notepad. 122 bits of entropy, and
  the pages are `noindex`. Losing the link to the wrong person is a user
  decision, not a flaw. See [`/terms`](https://split.xuper.fun/terms).
- **The Supabase anon key is public.** It's a `NEXT_PUBLIC_` value by design.
  RLS is deny-all and every operation goes through a `SECURITY DEFINER` RPC.
- **The creation rate limit can be bypassed** by varying the IP hash you send.
  It's a spam speed bump, not an access control; the global cap is the backstop.
- **The MCP endpoint has no authentication.** It's the same accountless model as
  the web app, and it can't touch secure splits at all. See
  [`/mcp`](https://split.xuper.fun/mcp).
- Missing security headers that don't apply to us, automated scanner output with
  no described impact, or reports about the third-party services we link to.

## Testing against the live site

Small-scale poking at `split.xuper.fun` is fine — create your own splits and
have at them. Please don't run automated scanners, don't touch splits that
aren't yours, and don't do anything that would degrade the service for the
people using it.
