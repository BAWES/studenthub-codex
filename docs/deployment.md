# Production Deployment — Docker Compose

Full production stack for StudentHub Next.js OS Launch (M3).

## Architecture

```
┌─────────────┐    ┌────────┐    ┌──────────┐
│  Next.js    │───▶│ Redis  │    │  MinIO   │
│  (port 3000)│    │(:6379) │    │(:9000/1) │
└──────┬──────┘    └────────┘    └──────────┘
       │
┌──────▼──────┐
│   MySQL     │
│  (port 3307)│
└─────────────┘
```

- **Next.js 15** — Production server with multi-stage Docker build
- **MySQL 8.4** — Primary database with health check
- **Redis 7** — Caching and session/queue backend
- **MinIO** — S3-compatible object storage for file uploads

## Prerequisites

- Docker Desktop 4.x+
- Docker Compose v2

## Quick Start

```bash
# 1. Create .env with AUTH_SECRET
echo "AUTH_SECRET=***-key-here" > .env

# 2. Build and start all services
docker compose up --build -d

# 3. Wait for health checks (30-60s first time)
docker compose ps

# 4. Verify the app is running
curl http://localhost:3000/api/health
```

## Environment

| Variable | Default | Description |
|---|---|---|
| `AUTH_SECRET` | **(required)** | Secret key for session encryption |
| `DATABASE_URL` | `mysql://studenthub:***@mysql:3306/studenthub_prod` | Inferred from compose defaults |

## Services

### MySQL (`studenthub-next-mysql`)
- Database: `studenthub_prod`, User: `studenthub`, Password: `studenthub`
- Host port: `3307`, Health: `mysqladmin ping` (10s interval, 30s start period)
- Persistent volume: `studenthub-next-mysql`

### Redis (`studenthub-next-redis`)
- Port: `6379`, Health: `redis-cli ping` (10s interval)
- Persistent volume: `studenthub-next-redis`

### MinIO (`studenthub-next-minio`)
- S3 API: `9000`, Web console: `9001`
- Credentials: `minioadmin` / `minioadmin`
- Health: `/minio/health/live` (10s interval)
- Auto-creates `studenthub-temp` bucket via `minio-init`
- Persistent volume: `studenthub-next-minio`

### Next.js App (`studenthub-next-app`)
- Port: `3000`, Multi-stage Docker build (3 stages)
- Health: `GET /api/health` (30s interval, 60s start period)
- Runs as non-root `nextjs` user
- Depends on: mysql → redis → minio → minio-init (all healthy/completed)

## Common Commands

```bash
docker compose up -d         # Start
docker compose down          # Stop
docker compose down -v       # Stop and reset all data
docker compose logs -f app   # Tail app logs
docker compose build --no-cache app  # Force rebuild
docker compose exec app sh   # Enter app container
docker compose ps            # Check health
```

## Production Notes

1. **AUTH_SECRET** — Generate with `openssl rand -hex 32`
2. **Credentials** — Change MySQL, MinIO defaults for real production
3. **SSL/TLS** — Add a reverse proxy (Nginx, Caddy, Traefik) for TLS
4. **Resources** — Add `deploy.resources` limits for production memory/CPU
5. **Backup** — Volumes persist data; use `docker run` to backup MySQL/Minis
6. **Logging** — Configure Docker log driver for production aggregation
