# Caddy with the Cloudflare DNS module compiled in, so it can solve the ACME
# DNS-01 challenge (the stock caddy:2-alpine image can't — DNS providers are
# plugins). Used by the `tls` compose profile. If CF_API_TOKEN is unset the
# entrypoint falls back to the default HTTP-01 challenge, so this image works
# for both modes.
FROM caddy:2-builder-alpine AS builder
RUN xcaddy build --with github.com/caddy-dns/cloudflare

FROM caddy:2-alpine
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
