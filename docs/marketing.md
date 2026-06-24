# Xupersplit — organic marketing plan

Focus: **organic** social on **Farcaster + X** (and Nostr as a bonus), aimed at
the crypto crowd — because crypto settlement is the one thing Xupersplit does
that Splitwise / Tricount / Kittysplit don't.

## 1. Positioning (the wedge)

> **Splitwise, but you settle in USDC or sats. No account, no app — just a link.
> Open source.**

Why it lands with crypto people:
- **Crypto settlement** — no other splitter does it (the rest are fiat + accounts).
- **No account / the link is the key** — this audience distrusts accounts and
  custody. We're already non-custodial ("money never touches us") with SIWE
  login — trust signals they recognise.
- **Open source + self-hostable** — credibility with exactly this group.

Two crypto sub-segments (they live in different places):

| Segment | Hook | Where |
| --- | --- | --- |
| ETH / Base / Solana (USDC) | "settle the dinner in USDC on Base, one tap" | **Farcaster** + X |
| Bitcoin / Lightning (sats) | "run the whole trip in sats ⚡, exact-amount LN invoices" | **Nostr** + X |

The app does Lightning **and** sats expenses, so Nostr is a natural third
channel for the BTC angle — cheap to cover by cross-posting.

## 2. The real growth engine: the share link

Organic social is the top of the funnel; the viral mechanic is the **split
itself**. Every time someone drops a split link in their group chat, N people
see the app *with the crypto pay buttons visible*. Optimise that:

- **OG preview** sells the crypto angle, not just "split expenses".
- **"settle in crypto" in shared views** — a discreet "made with Xupersplit ·
  settle in USDC/sats" so non-users see the hook.
- **"Share to Farcaster / X" button** on the balances view — one tap → cast/tweet
  with link + OG. Highest-ROI product change for organic spread.

## 3. The sharpest Farcaster move: a Mini App / Frame

Farcaster's native distribution is the **Frame / Mini App** — interactive cards
in-feed. Two levels:

1. **Simple:** a "view split" embed with a good OG + "Open" → the app. Makes
   shared splits interactive in-feed.
2. **Killer:** a **transactional** frame — "Pay your share" → USDC tx on Base
   *inside the client*, without leaving the feed. That's settling group
   expenses in-feed. No competitor has it; this alone can be the Farcaster story.

Level 1 is a small build and should ship with launch.

## 4. Content pillars

1. **Use-case storytelling** — "6 frens, hacker house, 4 currencies, 0 Venmo."
2. **Build in public** — solo, open source, ship logs. This crowd rewards it.
3. **Payment flex (demo GIFs)** — Lightning exact-amount invoice, USDC one-tap,
   SIWE login. 5–10s loops.
4. **Privacy / ethos** — non-custodial, MIT, self-host, "your data is yours".
5. **Memes / relatable** — "splitting the bill but make it onchain".

Mix ≈ 40% use-case, 30% build-in-public, 20% demo, 10% meme.

## 5. Channel tactics

**Farcaster (priority 1 — highest signal):**
- Cast in channels: /someone-build, /devs, /base, /farcaster, /crypto, /design,
  /indiehackers.
- Relationship-driven, not volume. ~3–5 casts/week + genuine replies to others'
  building. Ask for feedback — builders give it. Frame > link every time.

**X (priority 2 — reach):**
- 1 thread/week with a demo GIF; 4–6 short posts; **#buildinpublic**.
- Reply in relevant threads ("how do you split costs at a hacker house / conf?",
  "crypto UX is bad" → show the one-tap). Quote-tweet crypto-UX discourse with
  the product as proof.

**Nostr (bonus — BTC/Lightning):** cross-post the sats/Lightning angle.

## 6. Launch sequence

- **Phase 0 (prep, ~1 week):** 60s demo video + 3 GIFs (LN / USDC / SIWE),
  landing copy that **leads with crypto**, the share button, optionally Frame
  level 1, set up accounts.
- **Phase 1 (launch week):** Farcaster "I built this" in /someone-build + /devs ·
  X #buildinpublic thread · **Show HN** (open-source + privacy + crypto is a
  strong combo) · r/selfhosted + a PR to awesome-selfhosted.
- **Phase 2 (sustain):** weekly ship log + use-case posts + replies + Nostr
  cross-post.
- **Phase 3 (event piggyback):** target Devcon / ETHDenver / ETHCC / Token2049 +
  hacker houses — "settle your conf dinners in USDC". Get 3–5 builders to try it
  on site; one good anecdote beats 100 posts.

## 7. Ready-to-use hooks (English — the right audience)

- "Splitwise, but you settle in USDC or sats. No account. No app. Just a link.
  And it's open source. split.xuper.fun"
- "Hacker house math, solved: drop a link → everyone adds what they paid →
  settle onchain in one tap. 🧾⚡"
- "Your group trip to Devcon: 6 people, 4 currencies, 0 Venmo. Split it, settle
  in USDC on Base."
- "No app to install. No account to make. The link is the key, your data stays
  yours — MIT + self-hostable."
- "You can run an entire group trip in sats. Exact-amount Lightning invoices, no
  custody. ⚡"
- (demo GIF) "This is settling a $43.50 debt in USDC. One tap. Money never
  touches us."

## 8. Measurement

North star = **crypto settlements**, not followers. We already track
`wallet_pay_sent` / `web3_login` (+ Vercel Analytics). Weekly:
- splits created · **% using a crypto pay method** · traffic source (X/FC) ·
  link clicks.
- Every 2 weeks: which posts actually drove *splits* (not likes). Double down.

## 9. If you only do three things

1. **"Share to Farcaster/X" button + a Farcaster Frame (≥ level 1)** — make the
   product self-spreading on the right network.
2. **Build in public on Farcaster** (/someone-build, /devs) + Show HN on the
   open-source/privacy angle.
3. **Event piggyback** at a crypto conference with "settle your dinners in USDC"
   and a few real test anecdotes.
