# StudentHub Next

Modern rebuild workspace for StudentHub.

This app is intentionally separate from the Yii2 backend and Angular/Ionic frontends. The current system remains the reference while this project rebuilds the product as one role-based Next.js app.

The current execution contract is in `docs/migration/nextgen-execution-plan.md`. Use it as the source of truth for the next rebuild steps.

## Setup

```bash
cp .env.example .env
npm install
npm run db:inspect-dump
npm run db:create-sample
docker compose up -d
npm run db:import-sample
npm run dev
```

For local-only manual validation against the raw production backup:

```bash
docker compose up -d
npm run db:import-prod-local
```

Then use `DATABASE_URL="mysql://studenthub:studenthub@localhost:3307/studenthub_prod_local"`.

The generated SQL sample lands in `data/studenthub-sample.sql`.

Current local preview:

```bash
npm run dev -- --port 3000
```

Open `http://localhost:3000`.

The local login page is at:

```txt
http://localhost:3000/login
```

Use existing credentials from the imported local production clone. The login form asks for email/password only and resolves the matching legacy account type server-side.

## Candidate Search Index

The app currently renders candidate search from MySQL and includes a Meilisearch indexing path for the open-source search layer:

```bash
MEILI_HOST=http://127.0.0.1:7700 MEILI_MASTER_KEY=dev-master-key npm run search:index-candidates
```

See `docs/migration/search.md` for the candidate index shape and migration gates.

## Data Safety

The root `StudentHub Backup.sql` file contains production data. Scripts in this project generate smaller anonymized artifacts for local development. Do not commit raw dumps or generated sample dumps.
