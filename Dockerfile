# =============================================================================
# StudentHub Next — Production Dockerfile
# Multi-stage build: base → deps → build → runner (Alpine)
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Base — pnpm + common system deps
# ---------------------------------------------------------------------------
FROM node:22-alpine AS base
LABEL stage=base

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# ---------------------------------------------------------------------------
# Stage 2: Dependencies (production only)
# ---------------------------------------------------------------------------
FROM base AS deps
LABEL stage=deps

COPY package.json pnpm-lock.yaml .npmrc ./
RUN npm_config_minimum_release_age=0 pnpm install --ignore-scripts --no-frozen-lockfile --prod

# ---------------------------------------------------------------------------
# Stage 3: Build (full deps + source + prisma generate + next build)
# ---------------------------------------------------------------------------
FROM base AS builder
LABEL stage=builder

COPY package.json pnpm-lock.yaml .npmrc ./
RUN npm_config_minimum_release_age=0 pnpm install --ignore-scripts --no-frozen-lockfile

COPY . .

# Generate Prisma client so the build can resolve types
RUN pnpm prisma generate

# Build Next.js (outputs standalone + static)
RUN pnpm run build

# ---------------------------------------------------------------------------
# Stage 4: Production runner (Alpine)
# ---------------------------------------------------------------------------
FROM node:22-alpine AS runner
LABEL stage=runner

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy standalone build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Prisma schema (for runtime introspection if needed)
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
