import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie policy — Tollysplit",
};

export default function CookiesPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link
        href="/"
        className="mb-10 inline-block text-xl font-black tracking-tight text-primary"
      >
        tollysplit
      </Link>
      <h1 className="mb-2 text-3xl font-black tracking-tight">Cookie policy</h1>
      <p className="mb-8 text-stone-500">
        Short version: Tollysplit only uses cookies that are needed for the
        site to work. No tracking, no ads, no third-party cookies — and so no
        cookie consent is required.
      </p>

      <div className="space-y-6">
        <section className="rounded-2xl border border-stone-200/80 bg-surface p-5 shadow-sm">
          <h2 className="mb-1.5 font-bold">Necessary cookies</h2>
          <p className="text-sm leading-relaxed text-stone-500">
            If you choose to sign in, a session cookie (
            <code className="rounded bg-stone-100 px-1">sb-…-auth-token</code>)
            keeps you logged in. It's set by our database provider Supabase,
            contains only your sign-in session, and disappears when you log
            out. If you never sign in, no cookie is set at all.
          </p>
        </section>

        <section className="rounded-2xl border border-stone-200/80 bg-surface p-5 shadow-sm">
          <h2 className="mb-1.5 font-bold">Local storage</h2>
          <p className="text-sm leading-relaxed text-stone-500">
            Your browser saves a few things locally that are never sent to us:
            the “Your tollysplits” list, your “who are you” choice per split,
            your chosen language, your light/dark preference, and the fact that
            you've dismissed the cookie notice. It all stays on your device and
            can be cleared from your browser settings.
          </p>
        </section>

        <section className="rounded-2xl border border-stone-200/80 bg-surface p-5 shadow-sm">
          <h2 className="mb-1.5 font-bold">What's not here</h2>
          <p className="text-sm leading-relaxed text-stone-500">
            No analytics cookies, no ad networks, no third-party tracking, no
            “us and our 847 partners”. We count page views with Vercel's
            statistics, but it's entirely cookieless and anonymous — it can't
            recognise you between visits or follow you to other sites. Since
            everything we use is strictly necessary or cookieless, the law
            requires no consent — the notice you saw is just information.
          </p>
        </section>
      </div>

      <p className="mt-8 text-center text-sm text-stone-400">
        See also the{" "}
        <Link href="/privacy" className="text-primary hover:text-primary-dark">
          privacy policy
        </Link>
        . Last updated 2026-06-10.
      </p>
    </main>
  );
}
