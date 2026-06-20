# =============================================================================
# StudentHub Next — Production Dockerfile
# Multi-stage build: deps → build → runner (distroless)
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Dependencies
# ---------------------------------------------------------------------------
FROM node:22-alpine AS deps
LABEL stage=deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json pnpm-lock.yaml* ./

# Use npm since the project uses package-lock.json
RUN npm ci --only=production --ignore-scripts || npm ci --ignore-scripts

# ---------------------------------------------------------------------------
# Stage 2: Build
# ---------------------------------------------------------------------------
FROM node:22-alpine AS builder
LABEL stage=builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client so the build can resolve types
RUN npx prisma generate

# Build Next.js (outputs standalone + static)
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3: Production runner
# ---------------------------------------------------------------------------
FROM node:22-alpine AS runner
LABEL stage=runner

# Install system dependencies for Playwright / Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    libx11 \
    libxcomposite \
    libxdamage \
    libxrandr \
    libxfixes \
    libxext \
    pango \
    atk \
    at-spi2-atk \
    cups-libs \
    alsa-lib

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

# Install Playwright Chromium browser (uses system-installed chromium)
ENV PLAYWRIGHT_BROWSERS_PATH=/app/ms-playwright
RUN npx playwright install chromium 2>&1

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
