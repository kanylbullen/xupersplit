<div align="center">

<img src="docs/cover.png" alt="Tollysplit — dela utgifter, slipp tjafset" width="640" />

# Tollysplit

**Dela utgifter i grupp utan krångel.** Skapa en split, dela länken och låt
alla lägga in vad de betalat — saldon och vem-betalar-vem räknas ut
automatiskt, med betalning på ett tryck direkt från saldovyn.

[**tollysplit.xuper.fun**](https://tollysplit.xuper.fun) · [English](README.md) · Svenska

[![Licens: MIT](https://img.shields.io/badge/License-MIT-0d9488.svg)](LICENSE)
&nbsp;Next.js 16 · Supabase · Tailwind v4 · wagmi/viem

</div>

---

## Vad det är

En ren utgiftsdelare utan konton. Den **hemliga länken är nyckeln** — vem som
helst med den kan lägga in utgifter och göra upp; ingen inloggning krävs.
Valfri e-postinloggning gör bara att dina splits följer med mellan enheter.
Byggd som ett en-prompt-projekt och vidareutvecklad därifrån.

## Funktioner

- **Inget konto behövs.** Den ogissningsbara split-länken (122 bitars entropi)
  *är* behörigheten. Inloggning är valfri.
- **Flexibel delning** — lika, viktade andelar eller exakta belopp, med
  öresavrundning enligt största-rest-metoden.
- **Smart avräkning** — minsta antal "A betalar B"-överföringar, med
  **delbetalningar** ("betala allt eller en del") och överstrykning när det är
  gjort.
- **Gör inte upp för tidigt** — se vilka som öppnat spliten och vilka som
  markerat sig klara; betaldialogen varnar om någon inte vägt in ännu.
- **Säkra splits** *(valfritt, inloggad)* — bind deltagare till sina konton:
  du kan bara redigera dina egna betaluppgifter och bokföra dina egna utlägg.
  Skaparen väljer vilka som måste logga in, vem som kan se, och hur man går med.
- **Multivaluta** — lägg in utgifter i valfri valuta med kursen **låst vid
  spara** (Kittysplit-modell); sätt en huvudvaluta per split. Inklusive **sats**
  — kör en hel split i bitcoin om du vill.
- **Åtta betalsätt**, flera med äkta förifyllning på ett tryck — [se nedan](#betalsätt).
- **Sex språk** — English, Svenska, Norsk, Dansk, Suomi, Íslenska
  (autodetekteras, kan bytas).
- **Inbyggd integritet** — betaluppgifter kan raderas när alla är kvitt,
  inaktiva splits gallras efter 6 månader, IP-hashar tas bort inom ett dygn,
  CSV/JSON-export, fullständig GDPR-policy.
- **Mörkt / ljust / system**-tema, cookie-fri analys, diskret cookie-notis.

## Betalsätt

Tollysplit lagrar varje mottagares betaluppgift(er) och, där ett betalnätverk
erbjuder ett **öppet, avtalsfritt** gränssnitt, gör saldoraden till en riktig
betalning på ett tryck — **förifylld med exakt belopp**. Inga pengar passerar
någonsin Tollysplit; appen bygger bara länken/fakturan/transaktionen som
betalaren godkänner i sin egen app.

| Betalsätt | Upplevelse | Hur |
| --- | --- | --- |
| **Swish** 🇸🇪 | QR + app-deeplänk, belopp förifyllt | Öppen `app.swish.nu`-länk + QR-endpoint — inget handlaravtal |
| **Lightning** ⚡ | QR + `lightning:`-länk, **exakt belopp inbakat** | LNURL-pay (LUD-16): en lightning-adress → BOLT11-faktura |
| **Ethereum / USDC** Ξ | **Förifylld USDC** på ett tryck | WalletConnect (Reown AppKit) — anslut, välj kedja, godkänn |
| **Solana / USDC** ◎ | **Förifylld USDC** (SPL) på ett tryck | WalletConnect (Reown AppKit) — Phantom/Solflare, mottagarens ATA skapas automatiskt |
| **Ethereum-/Solana-adress** | Adress-QR + kopiera, ENS löses | `0x…` / `namn.eth` / base58 — för valfri plånbok |
| **Revolut** | Klickbar `revolut.me`-profillänk | Öppnar mottagarens profil för att betala |
| **Vipps · MobilePay · IBAN** | Lagrad uppgift + kopiera-knapp | Inget öppet P2P-API — betalaren avslutar i sin egen app |

**Varför skillnaden?** Swish har en genuint öppen förifylld deeplänk och
QR-endpoint; Lightnings LNURL och EVM/Solana via WalletConnect är öppna
protokoll. Vipps
och MobilePay (numera Vipps MobilePay) erbjuder bara beloppsförifyllda flöden
via sina **handlar-API:er** — ett företagsavtal som dirigerar pengar till ett
bolag, inte person-till-person — så för dem gör Tollysplit det ärliga och visar
uppgiften med en kopiera-knapp. Skulle de någon gång släppa en öppen
P2P-deeplänk är det en liten ändring att koppla in. PR:er välkomnas. 🤞

> **Krypto är oåterkalleligt.** Kryptometoder visar extra varningar, och **alla**
> betalsätt varnar (med datum) om mottagarens uppgifter någonsin ändrats från
> det som först lades in — vem som helst med länken kan ändra dem.

## Arkitektur

- **Ingen service-role-nyckel i appen.** All dataåtkomst går via
  `security definer`-RPC:er i Postgres (`split_data`, `save_entry`,
  `set_payment_methods`, …) där den hemliga split-nyckeln i URL:en är
  behörigheten. RLS är deny-all på alla tabeller och direkta grants är
  återkallade — klienten håller bara den publika publishable-nyckeln. Schema
  och varje ändring finns i [`supabase/migrations/`](supabase/migrations).
- **Next.js App Router** + server actions; klienten är ren React, inget
  state-bibliotek. Tailwind v4 med CSS-variabeltema.
- **Tunna, nyckellösa API-routes** proxar de öppna betalnätverken, alla
  same-origin-låsta: `/api/swish-qr`, `/api/ln-invoice` (LNURL-pay),
  `/api/ens` (viem), `/api/fx` (fiat + BTC, med leverantörs-fallback).
- **WalletConnect** är helt gated på ett projekt-ID — saknas det faller
  EVM-dialogen rent tillbaka på QR + kopiera.
- **Integritet & missbruksskydd** — radering av betaluppgifter vid kvittning
  (kan stängas av), 6-månadersgallring av inaktiva splits, skapande-gräns per
  IP-hash + globalt, och ett dagligt jobb som flaggar enumererings­försök på
  split-nycklar.

## Teknikstack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Supabase (Postgres,
Auth) · wagmi + viem + @solana/web3.js + Reown AppKit · Playwright · Vercel

## Kör lokalt

```bash
npm install
cp .env.example .env.local   # lägg in din egen Supabase-URL + anon-nyckel
npm run dev
```

`.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<ditt-projekt>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<din publishable-nyckel>
# Valfritt — aktiverar WalletConnect-USDC-flödet (gratis-ID från cloud.reown.com)
NEXT_PUBLIC_REOWN_PROJECT_ID=<ditt reown-projekt-ID>
```

## Hosta själv

Self-hostbar på gratisnivåerna hos **Supabase + Vercel**.

1. **Supabase** — skapa ett projekt (EU-regionerna håller data i Europa),
   applicera sedan schemat med `supabase link --project-ref <ref> && supabase
   db push` (kör varje migration i
   [`supabase/migrations/`](supabase/migrations)). Hämta **Project URL** och
   **publishable (anon)-nyckel**. För valfri e-postinloggning, konfigurera SMTP
   och `…/auth/confirm`-redirecten.
2. **Vercel** — importera repot, lägg till `NEXT_PUBLIC_SUPABASE_URL` och
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (båda säkra att exponera; säkerheten vilar på
   RLS + RPC:er). Lägg till `NEXT_PUBLIC_REOWN_PROJECT_ID` också om du vill ha
   WalletConnect. Deploya.
3. **Egen domän (valfritt)** — lägg till den i Vercel, peka en **DNS-only**
   CNAME mot `cname.vercel-dns.com`, och lägg domänens `…/auth/confirm` i
   Supabases redirect-allowlist om du använder e-postinloggning.

## Tester & CI

Playwright-smoke-tester (`npm run test:e2e`) körs på varje PR mot en lokal
produktionsbuild och gatear merge till `main`; den rena
delnings-/saldo-/avräkningslogiken finns i `src/lib/money.ts`.

## Bidra

Issues och PR:er välkomnas — särskilt en riktig öppen P2P-deeplänk för Vipps
eller MobilePay, eller fler betalspår. Kodbasen är liten och fullt typad.

## Licens

MIT — se [LICENSE](LICENSE).

---

<div align="center">

Om Tollysplit besparade din grupp lite tjafs kan du

[![Buy me a beer](https://img.shields.io/badge/Buy%20me%20a%20beer-%F0%9F%8D%BA-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/xuperfun)

*byggd med kärlek, kaffe och öl*

</div>
