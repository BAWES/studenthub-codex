# =============================================================================
# StudentHub Next — Production Dockerfile
# Multi-stage build: deps → build → runner (Alpine)
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Base — pnpm global install
# ---------------------------------------------------------------------------
FROM node:22-alpine AS base
LABEL stage=base

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# ---------------------------------------------------------------------------
# Stage 2: Dependencies (frozen lockfile — production deps only)
# ---------------------------------------------------------------------------
FROM base AS deps
LABEL stage=deps

COPY package.json pnpm-lock.yaml ./

# minimumReleaseAge=0 disables pnpm 9's supply-chain check against recently-
# published packages (e.g. @aws-sdk/* published the same day as build)
RUN pnpm install --frozen-lockfile --config.minimumReleaseAge=0 --prod --ignore-scripts

# ---------------------------------------------------------------------------
# Stage 3: Build (full deps + build)
# ---------------------------------------------------------------------------
FROM base AS builder
LABEL stage=builder

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --config.minimumReleaseAge=0 --ignore-scripts

COPY . .

# Generate Prisma client so the build can resolve types
RUN pnpm prisma generate

# Build Next.js (outputs standalone + static)
RUN pnpm run build

# ---------------------------------------------------------------------------
# Stage 4: Production runner
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

# Prisma schema (needed at runtime for generate)
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
