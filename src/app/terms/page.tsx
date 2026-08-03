import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of use — Xupersplit",
  description:
    "The short version: Xupersplit is a free hobby project, it never touches your money, and the split link is the key.",
};

const SECTIONS: [string, React.ReactNode][] = [
  [
    "What Xupersplit is",
    <>
      A free hobby project run by a private individual in Sweden — not a company
      and not a business. The code is open source under the MIT licence, so you
      are welcome to run your own copy. There is no contract, no subscription
      and nothing to pay. The “buy me a beer” link is a voluntary gift, not a
      purchase: it buys no service, support or priority.
    </>,
  ],
  [
    "No account — the link is the key",
    <>
      A split has no owner in the usual sense. Whoever holds the secret link can
      read it, add expenses, edit them and delete them. That is the design, not
      a flaw. Share the link only with the people who belong in the split, and
      treat it like a password. If you sign in you can create a{" "}
      <em>secure split</em> instead, where editing is limited to signed-in
      participants.
    </>,
  ],
  [
    "We never touch your money",
    <>
      Xupersplit does not hold, receive, transfer or process funds, and it is
      not a payment service. It does arithmetic and it draws links: it works out
      who owes whom and shows a Swish, Vipps, MobilePay or Revolut link, an
      IBAN, a Lightning invoice or a wallet address that a participant entered
      themselves. Three things follow from that.{" "}
      <strong>Check the recipient before you send anything</strong> — payment
      details come from whoever typed them in, and anyone with the link could
      have changed them.{" "}
      <strong>Onchain transfers are irreversible</strong> — USDC sent to the
      wrong address or the wrong person cannot be recovered, by us or by anyone
      else. And <strong>balances are a calculation, not a debt</strong>: they
      are not a legally binding record, not accounting, and not financial
      advice.
    </>,
  ],
  [
    "AI assistants and agents",
    <>
      Xupersplit runs an{" "}
      <Link href="/mcp" className="text-primary hover:text-primary-dark">
        MCP server
      </Link>{" "}
      so an AI assistant can manage a split for you. If you connect one, you are
      responsible for what it does in your splits — including any link it passes
      on to someone else. Assistants get things wrong: read the balances
      yourself before anybody pays.
    </>,
  ],
  [
    "Availability",
    <>
      Best effort on a hobby budget. The service may be slow, unavailable,
      changed or discontinued at any time, with or without notice. There is no
      uptime commitment and no obligation to provide support, though email
      generally gets an answer. If a split matters to you, export it from
      Settings.
    </>,
  ],
  [
    "Data is deleted on a schedule",
    <>
      Splits are deleted automatically after 6 months of inactivity, and payment
      details are wiped as soon as everyone in the split is square. The{" "}
      <Link href="/privacy" className="text-primary hover:text-primary-dark">
        privacy policy
      </Link>{" "}
      has the details. Don’t rely on Xupersplit as your only record of anything
      you need to keep.
    </>,
  ],
  [
    "Fair use",
    <>
      Don’t use Xupersplit to break the law, to harass anyone, or to store other
      people’s personal data without their knowledge. Don’t automate abusive
      volumes of requests — split creation is rate-limited, and traffic or
      content that is abusive, illegal or degrades the service for everyone else
      may be blocked or deleted without notice.
    </>,
  ],
  [
    "No warranty",
    <>
      Xupersplit is provided “as is”, without warranties of any kind, express or
      implied, including any implied warranty of merchantability or fitness for
      a particular purpose. Calculations can be wrong. Verify anything that
      matters before money changes hands.
    </>,
  ],
  [
    "Liability",
    <>
      To the fullest extent permitted by law, we are not liable for any loss
      arising from your use of Xupersplit — money sent to the wrong recipient, a
      split someone else edited or deleted, or data lost while the service was
      unavailable. Nothing here excludes liability that cannot be excluded by
      law, and if you are a consumer in the EU your mandatory statutory rights
      are unaffected by anything on this page.
    </>,
  ],
  [
    "Changes, law and contact",
    <>
      These terms may change; the date below says when they last did, and
      continuing to use the service means the current version applies. Swedish
      law governs, without depriving you of the mandatory consumer protection of
      the country you live in. Questions go to{" "}
      <a
        href="mailto:split@xuper.fun"
        className="text-primary hover:text-primary-dark"
      >
        split@xuper.fun
      </a>
      .
    </>,
  ],
];

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link
        href="/"
        className="mb-10 inline-block text-xl font-black tracking-tight text-primary"
      >
        xupersplit
      </Link>
      <h1 className="mb-2 text-3xl font-black tracking-tight">Terms of use</h1>
      <p className="mb-8 text-stone-500">
        The short version: it’s a free hobby project, it never touches your
        money, and the split link is the key. The longer version follows.
      </p>
      <div className="space-y-6">
        {SECTIONS.map(([title, body]) => (
          <section
            key={title}
            className="rounded-2xl border border-stone-200/80 bg-surface p-5 shadow-sm"
          >
            <h2 className="mb-1.5 font-bold">{title}</h2>
            <p className="text-sm leading-relaxed text-stone-500">{body}</p>
          </section>
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-stone-400">
        Last updated 2026-08-03
      </p>
    </main>
  );
}
