# Contributing

Issues and pull requests are welcome. The codebase is small, fully typed and has
no build magic beyond Next.js.

## ⚠️ Never post a split link

A split's URL is its password. Anyone who sees `split.xuper.fun/k/<key>` can
open the split, read every name and amount in it, and edit or delete anything —
permanently, and a public issue is indexed by search engines.

So when you report something: **describe the problem, don't link to your split.**
If you need to show a broken state, create a throwaway split with made-up names
and no payment details, and link that instead. Same goes for screenshots — crop
the address bar.

## Reporting a bug

Use the [bug report template](https://github.com/kanylbullen/xupersplit/issues/new?template=bug_report.yml).
What helps most: what you did, what happened, what you expected, and which
browser or AI client you were using.

Security problems go through [private reporting](SECURITY.md), not issues.

Not a developer, or a GitHub account feels like too much? Just email
**split@xuper.fun**. That reaches the same person.

## Suggesting a feature

Open a [feature request](https://github.com/kanylbullen/xupersplit/issues/new?template=feature_request.yml)
and say what problem it solves for your group. Xupersplit deliberately stays
small — the bar is "would most groups splitting a bill want this?"

Things that are already on the wish list:

- A real open P2P deep link for **Vipps** or **MobilePay**, so the amount can be
  prefilled the way Swish and Lightning already do.
- Additional payment rails.
- Translation fixes. The UI ships in English, Swedish, Norwegian, Danish,
  Finnish and Icelandic; the legal pages are English-only on purpose.

Small, self-contained tasks are labelled
[`good first issue`](https://github.com/kanylbullen/xupersplit/labels/good%20first%20issue).

## Working on the code

Setup is in the [README](README.md#run-it-locally). In short: `npm install`,
copy `.env.example` to `.env.local`, `npm run dev`.

Before you open a PR:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

`main` is protected. Branch, open a PR, and let CI finish — it builds the app and
runs Playwright smoke tests, and merging is blocked until that passes.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/)
(`feat:`, `fix:`, `docs:`, `refactor:`).

### Database changes

Every read and write goes through a `SECURITY DEFINER` RPC in
[`supabase/migrations/`](supabase/migrations); RLS is deny-all and the app never
touches tables directly. Two rules when you add a migration:

- **Make it backward compatible.** Migrations are applied to production before
  the PR merges, so the old code runs against your new schema for a while. New
  RPC parameters need defaults.
- **Enforce authorisation inside the function.** A definer function runs with
  elevated rights, so it has to check the split key — or `auth.uid()` for secure
  splits — itself.

### Style

Match the file you're editing. Comments explain *why*, not *what* — if a line
looks odd, the comment should say what bit us. Keep components in
`src/components/`, pure logic in `src/lib/`. The split and settlement maths lives
in `src/lib/money.ts` and is the one place worth being paranoid about.

## Licence

Contributions are accepted under the [MIT licence](LICENSE), same as the rest of
the project.
