#!/bin/sh
# =============================================================================
# StudentHub — Docker entrypoint
# Generates Prisma client (if needed) and runs the Next.js production server.
# =============================================================================
set -e

echo "[entrypoint] Generating Prisma client..."
npx prisma generate

echo "[entrypoint] Applying database migrations..."
npx prisma db push --accept-data-loss 2>&1 || echo "[entrypoint] WARNING: db push failed — continuing anyway"

echo "[entrypoint] Starting Next.js server..."
exec "$@"
