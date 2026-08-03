import Link from "next/link";
import type { Metadata } from "next";
import { APP_ORIGIN } from "@/lib/miniapp";

const ENDPOINT = `${APP_ORIGIN}/api/mcp`;

export const metadata: Metadata = {
  // The root layout's template appends " — Xupersplit".
  title: "MCP server",
  description:
    "Xupersplit speaks Model Context Protocol. Point an AI agent at one URL and " +
    "it can create a split, add expenses and work out who owes whom — no account, " +
    "no API key.",
  alternates: { canonical: `${APP_ORIGIN}/mcp` },
};

const TOOLS: [string, string][] = [
  ["create_split", "Start a split and get its secret link back"],
  ["get_split", "Participants, expenses, balances and who should pay whom"],
  ["add_expense", "Record what someone paid — equally, by weight or exact amounts"],
  ["record_payment", "Log a payback between two people"],
  ["update_entry", "Change an existing expense or payment"],
  ["delete_entry", "Remove an expense or payment"],
  ["add_participant", "Add someone to an existing split"],
  ["rename_participant", "Change a participant’s name"],
  ["remove_participant", "Remove someone who isn’t on any expense"],
  ["set_payment_methods", "Swish, IBAN, Revolut, Lightning, USDC and the rest"],
  ["update_split", "Rename the split or set its currency"],
];

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl bg-stone-100 p-3 text-xs leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

export default function McpPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link
        href="/"
        className="mb-10 inline-block text-xl font-black tracking-tight text-primary"
      >
        xupersplit
      </Link>
      <h1 className="mb-2 text-3xl font-black tracking-tight">MCP server</h1>
      <p className="mb-8 text-stone-500">
        Xupersplit speaks{" "}
        <a
          href="https://modelcontextprotocol.io"
          className="text-primary underline underline-offset-2"
        >
          Model Context Protocol
        </a>
        . Point your AI assistant at one URL and it can set up a split, add what
        everyone paid, and tell you who owes whom — then hand you a link to
        share with the group. No account, no API key, nothing to install.
      </p>

      <div className="space-y-6">
        <section className="rounded-2xl border border-stone-200/80 bg-surface p-5 shadow-sm">
          <h2 className="mb-1.5 font-bold">Endpoint</h2>
          <Code>{ENDPOINT}</Code>
          <p className="mt-3 text-sm leading-relaxed text-stone-500">
            Streamable HTTP, stateless, unauthenticated. There is no rate-limit
            key to request and no dashboard to sign up for.
          </p>
        </section>

        <section className="rounded-2xl border border-stone-200/80 bg-surface p-5 shadow-sm">
          <h2 className="mb-1.5 font-bold">Connect</h2>
          <p className="mb-3 text-sm leading-relaxed text-stone-500">
            Claude Code, from a terminal:
          </p>
          <Code>{`claude mcp add --transport http xupersplit ${ENDPOINT}`}</Code>
          <p className="mt-4 mb-3 text-sm leading-relaxed text-stone-500">
            Any client that reads an MCP config file:
          </p>
          <Code>{`{
  "mcpServers": {
    "xupersplit": { "url": "${ENDPOINT}" }
  }
}`}</Code>
          <p className="mt-4 mb-3 text-sm leading-relaxed text-stone-500">
            Older clients that only speak stdio can bridge with{" "}
            <code className="rounded bg-stone-100 px-1">mcp-remote</code>:
          </p>
          <Code>{`{
  "mcpServers": {
    "xupersplit": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "${ENDPOINT}"]
    }
  }
}`}</Code>
        </section>

        <section className="rounded-2xl border border-stone-200/80 bg-surface p-5 shadow-sm">
          <h2 className="mb-1.5 font-bold">Tools</h2>
          <p className="mb-3 text-sm leading-relaxed text-stone-500">
            Refer to people by name — the tools resolve names to participants,
            and amounts are plain decimals in the split’s currency.
          </p>
          <dl className="space-y-2 text-sm">
            {TOOLS.map(([name, what]) => (
              <div key={name} className="sm:flex sm:gap-3">
                <dt className="shrink-0 sm:w-44">
                  <code className="rounded bg-stone-100 px-1">{name}</code>
                </dt>
                <dd className="text-stone-500">{what}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-2xl border border-stone-200/80 bg-surface p-5 shadow-sm">
          <h2 className="mb-1.5 font-bold">The link is the key</h2>
          <p className="text-sm leading-relaxed text-stone-500">
            A split lives at an unguessable URL, and holding that URL is what
            grants access — for people and agents alike. Share it with the group
            and nobody else. Splits created over MCP are the simple, accountless
            kind; a <em>secure</em> split (made by a signed-in user, with
            identity-bound participants) can’t be created or edited here,
            because this server deliberately has no sign-in. See the{" "}
            <Link
              href="/privacy"
              className="text-primary underline underline-offset-2"
            >
              privacy policy
            </Link>{" "}
            for what’s stored and for how long.
          </p>
        </section>

        <section className="rounded-2xl border border-stone-200/80 bg-surface p-5 shadow-sm">
          <h2 className="mb-1.5 font-bold">Self-hosting</h2>
          <p className="text-sm leading-relaxed text-stone-500">
            The endpoint ships with the app, so a self-hosted Xupersplit gets
            its own MCP server at{" "}
            <code className="rounded bg-stone-100 px-1">/api/mcp</code>. The
            source is on{" "}
            <a
              href="https://github.com/kanylbullen/xupersplit"
              className="text-primary underline underline-offset-2"
            >
              GitHub
            </a>{" "}
            under the MIT licence.
          </p>
        </section>
      </div>

      <p className="mt-8 text-sm text-stone-500">
        Prefer clicking?{" "}
        <Link href="/new" className="text-primary underline underline-offset-2">
          Create a split in the browser
        </Link>
        .
      </p>
    </main>
  );
}
