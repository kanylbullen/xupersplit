import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy — Tollysplit",
};

const SECTIONS: [string, React.ReactNode][] = [
  [
    "What data is stored?",
    <>
      Only what you enter yourself: the split's name, participant names (first
      names are plenty), expenses and transfers. Optionally, participants can
      add a payment method (Swish/Vipps/MobilePay number or IBAN, used only to
      show payment links and QR codes) and you can sign in with your email
      (entirely optional — all it does is make your splits follow you across
      devices). When a split is created we also store a hashed version of your
      IP address as spam protection.
    </>,
  ],
  [
    "For how long?",
    <>
      <strong>Payment details</strong> are wiped automatically as soon as
      everyone in the split is square — they're not needed anymore.{" "}
      <strong>Whole splits</strong> are deleted automatically after 6 months of
      inactivity (opening a split counts as activity). If you create splits
      while signed in, you can turn that purge off per split under Settings.{" "}
      <strong>The IP hash</strong> is deleted within 24 hours.
    </>,
  ],
  [
    "Who can see your data?",
    <>
      Anyone with the secret link to a split can view and edit its contents —
      that's how Tollysplit works, just like a shared notepad. Only share the
      link with the people who should be in on it. No data is sold, shared or
      used for advertising. No tracking, no analytics beyond anonymous page
      counts, no third-party cookies.
    </>,
  ],
  [
    "Subprocessors",
    <>
      Tollysplit runs on Vercel (hosting and anonymous, cookieless visitor
      statistics) and Supabase (database in Stockholm, EU). Sign-in emails are
      sent via Resend. When a Swish QR code is shown, the recipient's number,
      amount and the split's name are sent to Swish's official QR service to
      draw the code — nothing more.
    </>,
  ],
  [
    "Cookies & local storage",
    <>
      If you sign in, a session cookie is set — that's all. The “Your
      tollysplits” list and your “who are you” choice are stored locally in
      your browser (localStorage) and never leave your device. Details are in
      the{" "}
      <Link href="/cookies" className="text-primary hover:text-primary-dark">
        cookie policy
      </Link>
      .
    </>,
  ],
  [
    "Your rights",
    <>
      Want a split, a name or an email address deleted right away instead of
      waiting for the purge? Email{" "}
      <a
        href="mailto:tollysplit@xuper.fun"
        className="text-primary hover:text-primary-dark"
      >
        tollysplit@xuper.fun
      </a>{" "}
      and we'll take care of it.
    </>,
  ],
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link
        href="/"
        className="mb-10 inline-block text-xl font-black tracking-tight text-primary"
      >
        tollysplit
      </Link>
      <h1 className="mb-2 text-3xl font-black tracking-tight">Privacy policy</h1>
      <p className="mb-8 text-stone-500">
        Tollysplit is built to know as little about you as possible. The core
        principle: we only store what's needed to split expenses, and delete it
        when it's no longer needed.
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
        Last updated 2026-06-10
      </p>
    </main>
  );
}
