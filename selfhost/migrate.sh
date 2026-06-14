#!/bin/sh
# One-shot: bootstrap roles/auth helpers, set the PostgREST login password,
# then apply the app migrations once (skipped if the schema is already there).
set -e

SUPER="postgres://postgres:${POSTGRES_PASSWORD}@db:5432/postgres"
# supabase_admin is the true superuser (password = POSTGRES_PASSWORD) and the
# only role allowed to modify the reserved `authenticator` role.
ADMIN="postgres://supabase_admin:${POSTGRES_PASSWORD}@db:5432/postgres"

echo "→ bootstrap"
psql "$SUPER" -v ON_ERROR_STOP=1 -f /init/00-bootstrap.sql

echo "→ authenticator password (PostgREST login)"
psql "$ADMIN" -v ON_ERROR_STOP=1 \
  -c "alter role authenticator login password '${POSTGRES_PASSWORD}';"

if [ "$(psql "$SUPER" -tAc "select to_regclass('public.splits') is not null")" = "t" ]; then
  echo "→ schema already present, skipping migrations"
else
  for f in $(ls /migrations/*.sql | sort); do
    echo "→ migrate $(basename "$f")"
    psql "$SUPER" -v ON_ERROR_STOP=1 -f "$f"
  done
fi

echo "✓ database ready"
