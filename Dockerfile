# =============================================================================
# Stage 1: Install all dependencies
# =============================================================================
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

# =============================================================================
# Stage 2: Build the application
# =============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate && npm run build

# =============================================================================
# Stage 3: Production runtime
# =============================================================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy production node_modules
COPY --from=deps /app/node_modules ./node_modules

# Copy the Next.js build output
COPY --from=builder /app/.next ./.next

# Copy public assets, package.json (for start script), and Prisma schema
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npx", "next", "start"]
