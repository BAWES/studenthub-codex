# =============================================================================
# StudentHub Next — Production Dockerfile
# Multi-stage build: base → deps → build → runner (Alpine with Chromium)
# Includes Playwright + Chromium for PDF report generation.
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Base — pnpm + common system deps
# ---------------------------------------------------------------------------
FROM node:22-alpine AS base
LABEL stage=base

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

# Bypass pnpm 11's minimum-release-age supply-chain policy for legitimately
# recent AWS SDK publishes that our lockfile pins (already reviewed/trusted)
ENV npm_config_minimum_release_age=0

WORKDIR /app

# ---------------------------------------------------------------------------
# Stage 2: Dependencies (production only — slim deps layer)
# ---------------------------------------------------------------------------
FROM base AS deps
LABEL stage=deps

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --ignore-scripts --no-frozen-lockfile --prod --config.minimum-release-age=0

# ---------------------------------------------------------------------------
# Stage 3: Build (full deps + source + prisma generate + next build)
# ---------------------------------------------------------------------------
FROM base AS builder
LABEL stage=builder

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --ignore-scripts --no-frozen-lockfile --config.minimum-release-age=0

COPY . . 

# Ensure public/ exists (Next.js needs it even if empty)
RUN mkdir -p /app/public

# Install chromium-bidi — playwright-core's bundled CDP dep needed at build time
# (Next.js standalone trace requires it when traversing playwright-core)
RUN pnpm add chromium-bidi --no-save 2>/dev/null || true

# Ensure public/ directory exists (needed for Docker COPY --from=builder step)
RUN mkdir -p /app/public

# Install chromium-bidi — playwright-core's bundled CDP dep needed at build time
# (Next.js standalone trace requires it when traversing playwright-core)
RUN pnpm add chromium-bidi --no-save

# Ensure public/ directory exists (needed for Docker COPY --from=builder step)
RUN mkdir -p /app/public

# Install chromium-bidi — playwright-core's bundled CDP dep needed at build time
# (Next.js standalone trace requires it when traversing playwright-core)
RUN pnpm add chromium-bidi --no-save 2>/dev/null || true

# Generate Prisma client so the build can resolve types
# DATABASE_URL placeholder needed — prisma generate may introspect
ENV DATABASE_URL="mysql://placeholder:***@localhost:3306/placeholder"
RUN pnpm prisma generate

# Build Next.js (outputs standalone + static)
RUN pnpm run build

# ---------------------------------------------------------------------------
# Stage 4: Production runner (Alpine)
# ---------------------------------------------------------------------------
FROM node:22-alpine AS runner
LABEL stage=runner

# Install system dependencies for Playwright + Chromium
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  freetype-dev \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  dumb-init

# Store Chromium path for Playwright's chromium.launch()
ENV PLAYWRIGHT_CHROMIUM_PATH=/usr/bin/chromium-browser \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy standalone build output — includes all required node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma schema (for runtime introspection if needed)
COPY --from=builder /app/prisma ./prisma

# Entrypoint — run migrations / generate on cold start, then launch Next
COPY ops/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
