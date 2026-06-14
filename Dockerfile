# Tollysplit app image (Next.js standalone). Used by the self-host stack in
# selfhost/. NEXT_PUBLIC_* are inlined at build time, so they're build args.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_REOWN_PROJECT_ID
ARG NEXT_PUBLIC_SELFHOST
# Self-host gateway flags (consumed by next.config rewrites at build time).
ARG SUPABASE_LOCAL_GATEWAY
ARG SUPABASE_AUTH_URL
ARG SUPABASE_REST_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_REOWN_PROJECT_ID=$NEXT_PUBLIC_REOWN_PROJECT_ID \
    NEXT_PUBLIC_SELFHOST=$NEXT_PUBLIC_SELFHOST \
    SUPABASE_LOCAL_GATEWAY=$SUPABASE_LOCAL_GATEWAY \
    SUPABASE_AUTH_URL=$SUPABASE_AUTH_URL \
    SUPABASE_REST_URL=$SUPABASE_REST_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
