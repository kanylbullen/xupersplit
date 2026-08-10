import Link from "next/link";
import type { Metadata } from "next";
import { CopyCode } from "@/components/CopyCode";
import { getLocale } from "@/lib/i18n/server";
import { getHelp } from "@/lib/i18n/help";

export const metadata: Metadata = {
  // The root layout's template appends " — xupersplit".
  title: "Help & getting started",
  description:
    "How to split expenses with xupersplit: getting started, worked examples for the situations people actually hit, answers to the common questions, and how to run a whole split from an AI assistant.",
  alternates: { canonical: "/help" },
};

/** Section wrapper — same card as the rest of the site, with an anchor. */
function Section({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="mb-3 text-xl font-black tracking-tight">{heading}</h2>
      {children}
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-surface p-5 shadow-sm">
      {children}
    </div>
  );
}

export default async function HelpPage() {
  const locale = await getLocale();
  const h = getHelp(locale);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link
        href="/"
        className="mb-10 inline-block text-xl font-black tracking-tight text-primary"
      >
        xupersplit
      </Link>

      <h1 className="mb-3 text-3xl font-black tracking-tight">{h.title}</h1>
      <p className="mb-8 leading-relaxed text-stone-500">{h.intro}</p>

      {/* Plain anchor list rather than a sticky sidebar: the page is read on a
          phone more often than not, and everything below is one Ctrl+F away. */}
      <nav className="mb-10 flex flex-wrap gap-2">
        {[
          ["start", h.toc.start],
          ["examples", h.toc.examples],
          ["ai", h.toc.ai],
          ["faq", h.toc.faq],
        ].map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="rounded-full border border-stone-200/80 bg-surface px-3.5 py-1.5 text-xs font-medium text-stone-500 transition-colors hover:border-primary/40 hover:text-primary"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="space-y-12">
        <Section id="start" heading={h.startHeading}>
          <ol className="space-y-4">
            {h.steps.map((step) => (
              <li key={step.title}>
                <Card>
                  <h3 className="mb-1 font-bold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-stone-500">
                    {step.body}
                  </p>
                </Card>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="examples" heading={h.examplesHeading}>
          <p className="mb-4 text-sm leading-relaxed text-stone-500">
            {h.examplesIntro}
          </p>
          <div className="space-y-4">
            {h.examples.map((example) => (
              <Card key={example.title}>
                <h3 className="mb-1 font-bold">{example.title}</h3>
                <p className="text-sm leading-relaxed text-stone-500">
                  {example.body}
                </p>
              </Card>
            ))}
          </div>
        </Section>

        <Section id="ai" heading={h.aiHeading}>
          <p className="mb-4 text-sm leading-relaxed text-stone-500">
            {h.aiIntro}
          </p>
          <Link
            href="/mcp"
            className="mb-6 inline-block text-sm font-semibold text-primary hover:underline"
          >
            {h.aiSetupCta} →
          </Link>
          <p className="mb-4 text-sm leading-relaxed text-stone-500">
            {h.promptsIntro}
          </p>
          <div className="space-y-4">
            {h.prompts.map((prompt, i) => (
              <Card key={prompt.title}>
                <h3 className="mb-2 font-bold">{prompt.title}</h3>
                {/* Numbered, not locale-tagged: which prompt people copy is
                    the interesting question, and the label has to stay stable
                    across six translations to be countable at all. */}
                <CopyCode
                  location={`help-prompt-${i + 1}`}
                  label={h.copy}
                  copiedLabel={h.copied}
                  wrap
                >
                  {prompt.prompt}
                </CopyCode>
                <p className="mt-3 text-sm leading-relaxed text-stone-500">
                  {prompt.body}
                </p>
              </Card>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-stone-500">
            {h.aiNote}
          </p>
        </Section>

        <Section id="faq" heading={h.faqHeading}>
          {/* Expanded, not collapsed: the point of one page is that the
              browser's own find lands on the answer. */}
          <dl className="space-y-4">
            {/* Card is the div wrapping each dt/dd pair — a <dl> may hold
                divs, but not a div holding another div holding the pair. */}
            {h.faq.map((qa) => (
              <Card key={qa.q}>
                <dt className="mb-1 font-bold">{qa.q}</dt>
                <dd className="text-sm leading-relaxed text-stone-500">
                  {qa.a}
                  {qa.more ? (
                    <>
                      {" "}
                      <Link
                        href={qa.more.href}
                        className="font-semibold text-primary hover:underline"
                      >
                        {qa.more.label} →
                      </Link>
                    </>
                  ) : null}
                </dd>
              </Card>
            ))}
          </dl>
        </Section>

        <Section id="stuck" heading={h.stuckHeading}>
          <Card>
            <p className="mb-3 text-sm leading-relaxed text-stone-500">
              {h.stuck}
            </p>
            <a
              href="mailto:split@xuper.fun"
              className="text-sm font-semibold text-primary hover:underline"
            >
              {h.stuckCta}
            </a>
          </Card>
        </Section>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/new"
          className="inline-block rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-md transition-colors hover:bg-primary-dark"
        >
          {h.backHome}
        </Link>
      </div>
    </main>
  );
}
