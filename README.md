# StudentHub Next

Modern rebuild workspace for StudentHub.

This app is intentionally separate from the Yii2 backend and Angular/Ionic frontends. The current system remains the reference while this project rebuilds the product as one role-based Next.js app.

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

Choose the role that matches the old portal and use the existing credentials from the imported local production clone.

## Data Safety

The root `StudentHub Backup.sql` file contains production data. Scripts in this project generate smaller anonymized artifacts for local development. Do not commit raw dumps or generated sample dumps.
