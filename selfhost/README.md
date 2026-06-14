# Self-hosting Xupersplit

This directory brings up Xupersplit **and its own backend** — Postgres, auth
(GoTrue), the REST/RPC layer (PostgREST) and a local mailbox — with no external
services. The app itself is the gateway, so the browser only ever talks to a
single origin.

> Prefer the managed route? You can also run the app on **Vercel + Supabase
> Cloud** — see the "Deploy your own" section in the [top-level README](../README.md).

---

## Quick start

```bash
cd selfhost
cp .env.example .env       # ⚠️ change the secrets for anything non-local
docker compose up -d --build
```

- App: **http://localhost:3000**
- Mailbox (Mailpit): **http://localhost:8025**

Sign in with **email + password** — it works instantly, no SMTP required
(GoTrue auto-confirms the account). The magic-code login works too; the code
lands in Mailpit.

To change host ports, set `APP_PORT` / `MAILPIT_PORT` in `.env`.

---

## What runs

| Service | Image | Role |
| --- | --- | --- |
| `db` | `supabase/postgres` | Postgres; ships the Supabase roles + `pg_cron` |
| `migrate` | `postgres:16-alpine` | One-shot: bootstraps roles, applies migrations, exits |
| `auth` | `supabase/auth` (GoTrue) | Email + password / magic-code login, issues JWTs |
| `rest` | `postgrest/postgrest` | What `supabase.rpc()` talks to |
| `mailpit` | `axllent/mailpit` | Catches outgoing mail so you can read the code/link |
| `app` | built from [`../Dockerfile`](../Dockerfile) | Next.js app **and** the gateway |
| `caddy` | built from [`caddy.Dockerfile`](caddy.Dockerfile) | Optional HTTPS (`tls` profile only) |

The `migrate` service is idempotent: it bootstraps the auth roles/helpers, sets
the PostgREST login password, then applies every migration in
[`../supabase/migrations/`](../supabase/migrations) — skipping if the schema is
already present. Safe to re-run on every `up`.

---

## How it fits together

The app is configured as a **gateway** so the browser sees one origin:

- The browser talks only to `SITE_URL`. The app rewrites `/auth/v1/*` →
  `auth:9999` and `/rest/v1/*` → `rest:3000` internally (gated on
  `SUPABASE_LOCAL_GATEWAY=1`, set as a build arg).
- Server-side rendering calls Supabase via `SUPABASE_INTERNAL_URL`
  (`http://localhost:3000`) — the container can't reach the published host
  port, so the app calls **itself** on its internal port and uses the same
  rewrites.
- Because the browser and server reach Supabase on different origins, the auth
  cookie name is **pinned** to `sb-xupersplit-auth` (gated on
  `NEXT_PUBLIC_SELFHOST=1`) so both sides agree on it. On Vercel this is unset,
  so nothing changes there.

`NEXT_PUBLIC_*` values are **inlined at build time** — if you change `SITE_URL`,
`ANON_KEY`, or `REOWN_PROJECT_ID`, rebuild the app:
`docker compose build app`.

---

## Securing a real deployment

The `.env.example` ships with **public Supabase demo** JWT keys so it runs out
of the box. For anything internet-facing you **must**:

1. Change `POSTGRES_PASSWORD`.
2. Change `JWT_SECRET` (min 32 chars).
3. Regenerate `ANON_KEY` and `SERVICE_ROLE_KEY` so they're signed with your new
   `JWT_SECRET` — they're just HS256 JWTs. No dependencies needed:

```bash
JWT_SECRET='your-new-secret-here' python3 - <<'PY'
import hmac, hashlib, base64, json, os, time
secret = os.environ["JWT_SECRET"].encode()
b64 = lambda d: base64.urlsafe_b64encode(d).rstrip(b"=").decode()
def make(role):
    h = b64(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    iat = int(time.time()); exp = iat + 10 * 365 * 24 * 3600
    p = b64(json.dumps({"role": role, "iss": "supabase", "iat": iat, "exp": exp},
                       separators=(",", ":")).encode())
    sig = b64(hmac.new(secret, f"{h}.{p}".encode(), hashlib.sha256).digest())
    return f"{h}.{p}.{sig}"
print("ANON_KEY=" + make("anon"))
print("SERVICE_ROLE_KEY=" + make("service_role"))
PY
```

Paste the two lines into `.env`, then rebuild the app (`ANON_KEY` is inlined):
`docker compose up -d --build`.

> The `ANON_KEY` is safe to expose — security rests on RLS (deny-all) +
> `security definer` RPCs, where the secret split key in the URL is the
> capability. The `SERVICE_ROLE_KEY` is **not** used by the app and should stay
> private.

---

## HTTPS

HTTPS is one flag away — a Caddy reverse proxy (the `tls` compose profile) does
ACME for you and renews automatically.

```bash
# in .env:
#   DOMAIN=split.example.com
#   ACME_EMAIL=you@example.com
#   SITE_URL=https://split.example.com   (then rebuild the app)
docker compose --profile tls up -d --build
```

### Behind NAT / wildcard certs — Cloudflare DNS-01

By default Caddy uses the **HTTP-01** challenge, which needs ports 80/443
reachable from the internet. If the host is behind NAT, or you want a
**wildcard** cert, switch to the **Cloudflare DNS-01** challenge:

1. Create a **scoped** API token at
   <https://dash.cloudflare.com/profile/api-tokens> with:
   - **Zone → DNS → Edit**
   - **Zone → Zone → Read**
   - limited to your zone.
2. Set `CF_API_TOKEN=...` in `.env`.
3. `docker compose --profile tls up -d --build`.

The Caddy image already bundles the Cloudflare DNS plugin, so switching modes is
just an `.env` change — set the token for DNS-01, leave it blank for HTTP-01.

---

## Configuration reference

| Variable | Default | Purpose |
| --- | --- | --- |
| `SITE_URL` | `http://localhost:3000` | Where the browser reaches the app + the auth Site URL |
| `APP_PORT` | `3000` | Host port for the app |
| `MAILPIT_PORT` | `8025` | Host port for the Mailpit web UI |
| `POSTGRES_PASSWORD` | _(demo)_ | Postgres superuser + PostgREST `authenticator` password |
| `JWT_SECRET` | _(demo)_ | Shared HS256 secret for GoTrue + PostgREST (min 32 chars) |
| `ANON_KEY` | _(demo)_ | Public anon JWT — **inlined at build**, safe to expose |
| `SERVICE_ROLE_KEY` | _(demo)_ | Service-role JWT — not used by the app; keep private |
| `REOWN_PROJECT_ID` | _(blank)_ | Enables the WalletConnect crypto pay buttons |
| `GOTRUE_AUTOCONFIRM` | `true` | `true` = instant sign-up, no SMTP; set `false` only with real SMTP |
| `DOMAIN` / `ACME_EMAIL` | _(blank)_ | HTTPS via the `tls` profile |
| `CF_API_TOKEN` | _(blank)_ | Switch HTTPS to Cloudflare DNS-01 (behind NAT / wildcard) |

---

## Troubleshooting

- **Sign-in seems to do nothing.** Make sure `SITE_URL` matches the origin you
  actually open in the browser (scheme + host + port). The auth cookie is bound
  to that origin.
- **Changed `SITE_URL` / `ANON_KEY` and nothing happened.** They're inlined at
  build time — `docker compose build app` (or `up -d --build`).
- **No login email.** There's no real SMTP by design — open **Mailpit** at
  `http://localhost:8025` to read the code/link. (Email + password needs no
  mail at all.)
- **`migrate` exited / want to re-check it.** It's a one-shot and idempotent;
  `docker compose logs migrate` shows what it did. It skips migrations if
  `public.splits` already exists.
- **Reset everything.** `docker compose down -v` drops the Postgres + Caddy
  volumes (⚠️ deletes all data) for a clean start.
