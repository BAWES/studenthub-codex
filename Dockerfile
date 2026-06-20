# =============================================================================
# StudentHub Next — Production Dockerfile
# Multi-stage build: base → deps → build → runner (Alpine, pnpm)
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Base — shared tooling (pnpm, deps)
# ---------------------------------------------------------------------------
FROM node:22-alpine AS base
LABEL stage=base

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# ---------------------------------------------------------------------------
# Stage 2: Dependencies (production-only, frozen lockfile)
# ---------------------------------------------------------------------------
FROM base AS deps
LABEL stage=deps

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# ---------------------------------------------------------------------------
# Stage 3: Build (full deps + Prisma + Next.js standalone)
# ---------------------------------------------------------------------------
FROM base AS builder
LABEL stage=builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client so the build can resolve types
RUN npx prisma generate

# Build Next.js (outputs standalone + static)
RUN pnpm run build

# ---------------------------------------------------------------------------
# Stage 4: Production runner (minimal, non-root)
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
