# Production Deployment Guide

## Overview

StudentHub Next runs in Docker Compose with four services:

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| **app** | `studenthub-next-app` | 3000 | Next.js 15 production server |
| **mysql** | `studenthub-next-mysql` | 3307 | Primary database (MySQL 8.4) |
| **redis** | `studenthub-next-redis` | 6379 | Cache / session store (Redis 7) |
| **minio** | `studenthub-next-minio` | 9000 / 9001 | S3-compatible object storage |

## Quick Start

```bash
# 1. Clone and enter
git clone https://github.com/BAWES/studenthub-codex.git
cd studenthub-codex

# 2. Configure environment
cp .env.example .env
# Edit .env with your secrets

# 3. Build and start
docker compose up -d

# 4. Verify
curl http://localhost:3000/api/health
# → {"status":"ok","timestamp":"...","uptime":...}
```

## Service Details

### Next.js App (`app`)

- Multi-stage Docker build (deps → build → runner)
- Runs as unprivileged `nextjs` user (UID 1001)
- Exposes port 3000
- Health check: `GET /api/health`
- Depends on: mysql, redis, minio, minio-setup

### MySQL (`mysql`)

- MySQL 8.4 with utf8mb4 charset
- Data persisted in `studenthub-next-mysql` volume
- Health check: `mysqladmin ping`
- Port 3307 (mapped from 3306)

### Redis (`redis`)

- Redis 7 Alpine
- Data persisted in `studenthub-next-redis` volume
- Health check: `redis-cli ping`

### MinIO (`minio`)

- MinIO latest (S3-compatible)
- API on port 9000, Console on port 9001
- Data persisted in `studenthub-next-minio` volume
- Auto-creates `studenthub-temp` bucket on first start via `minio-setup` init container
- Default credentials: `studenthub` / `studenthub_minio_secret` (change in production!)

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | yes | — | MySQL connection string |
| `AUTH_SECRET` | yes | — | Session encryption secret |
| `REDIS_URL` | no | `redis://redis:6379` | Redis connection (future use) |
| `AWS_ENDPOINT_URL` | no | — | S3 endpoint (set for MinIO) |
| `AWS_S3_FORCE_PATH_STYLE` | no | `false` | `true` for MinIO compatibility |
| `AWS_TEMP_BUCKET_REGION` | yes | `us-east-1` | S3 region |
| `AWS_TEMP_ACCESS_KEY_ID` | yes | — | S3 access key |
| `AWS_TEMP_SECRET_ACCESS_KEY` | yes | — | S3 secret key |
| `AWS_TEMP_BUCKET_NAME` | yes | `studenthub-temp` | S3 bucket for uploads |

## Database Initialization

On first start, MySQL starts with an empty database. Import production data:

```bash
# Download a recent dump and copy it into the container
docker cp ./StudentHub\ Backup.sql studenthub-next-mysql:/tmp/
docker exec studenthub-next-mysql bash -c \
  'mysql -u root -pstudenthub_root studenthub_sample < /tmp/StudentHub Backup.sql'

# Or use the local import script:
./scripts/import-prod-local-db.sh
```

## S3 Storage (MinIO)

Access the MinIO Console at http://localhost:9001 (credentials: `studenthub` / `studenthub_minio_secret`).

**For production with real AWS S3**, update these env vars:
```env
# Comment out MinIO vars
# AWS_ENDPOINT_URL=
# AWS_S3_FORCE_PATH_STYLE=

# Set real AWS credentials
AWS_TEMP_ACCESS_KEY_ID=AKIAXXXXXXXX
AWS_TEMP_SECRET_ACCESS_KEY=*** AWS_TEMP_BUCKET_NAME=studenthub-production-uploads
AWS_TEMP_BUCKET_REGION=us-east-1
```

## Health Checks

Each service has a Docker health check:

| Service | Check | Interval |
|---------|-------|----------|
| app | `GET /api/health` | 15s |
| mysql | `mysqladmin ping` | 10s |
| redis | `redis-cli ping` | 10s |
| minio | `mc ready local` | 10s |

View health status:
```bash
docker compose ps
```

## Logs

```bash
# All services
docker compose logs -f

# Single service
docker compose logs -f app
docker compose logs -f mysql
```

## Useful Commands

```bash
# Build without cache
docker compose build --no-cache app

# Rebuild and restart a single service
docker compose up -d --build app

# Stop everything
docker compose down

# Stop and remove volumes (WARNING: deletes all data!)
docker compose down -v

# Run Prisma migrations
docker compose exec app npx prisma db push

# Open a shell in the app container
docker compose exec app sh

# Check MySQL
docker compose exec mysql mysql -u root -pstudenthub_root studenthub_sample -e "SHOW TABLES;"
```

## Production Hardening

Before deploying to production:

1. **Change all default passwords** in `docker-compose.yml`
2. **Set a strong `AUTH_SECRET`** (64+ random chars)
3. **Remove `ports:`** for internal services (mysql, redis, minio) or restrict to internal network
4. **Use real AWS S3** instead of MinIO (or lock down MinIO with proper auth)
5. **Add a reverse proxy** (nginx/Caddy) in front of the app for TLS termination
6. **Configure log rotation** for Docker containers
7. **Set up monitoring** (health check alerts, metrics)
8. **Regular backups** of MySQL volume
9. **Enable Docker Content Trust** for image signing
