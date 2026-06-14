#!/bin/sh
# Pick the ACME challenge based on whether a Cloudflare token is provided:
#   CF_API_TOKEN set   → DNS-01 via Cloudflare (works behind NAT, no port 80
#                        needed for issuance, supports wildcard certs).
#   CF_API_TOKEN unset → default managed TLS (HTTP-01 / TLS-ALPN), as before.
# The chosen tls block is injected into the Caddyfile via {$CADDY_TLS_BLOCK}.
set -e

if [ -n "$CF_API_TOKEN" ]; then
	export CADDY_TLS_BLOCK="tls {
		dns cloudflare $CF_API_TOKEN
		resolvers 1.1.1.1
	}"
else
	export CADDY_TLS_BLOCK=""
fi

exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
