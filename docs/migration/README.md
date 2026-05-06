# StudentHub Next Migration

This workspace is for rebuilding StudentHub as one modern app while keeping the current Yii2/Angular system as the reference implementation.

## Raw Data Rule

`../StudentHub Backup.sql` is production data. Do not commit it, print rows from it, or use it directly in day-to-day app development.

Use the scripts to create derived artifacts:

- `data/dump-manifest.json` describes tables, columns, categories, and approximate row counts.
- `data/studenthub-sample.sql` is a smaller anonymized SQL dump for local development.

Both generated files are gitignored.

## Commands

```bash
npm run db:inspect-dump
npm run db:create-sample
docker compose up -d
npm run db:import-sample
```

Override paths when needed:

```bash
node scripts/inspect-dump.mjs --dump="../StudentHub Backup.sql" --output="./data/dump-manifest.json"
node scripts/create-sample-sql.mjs --dump="../StudentHub Backup.sql" --output="./data/studenthub-sample.sql"
```

## Migration Shape

The product direction and execution contract now live in:

- `docs/migration/nextgen-execution-plan.md`

Follow that file before making broad UX, auth, routing, or migration decisions. The short version: one public landing page, one login that resolves the account server-side, one authenticated app shell, shared entity modules, capability-scoped actions, and production-clone parity tests.

The new app should be a modular monolith:

- `src/modules/auth`
- `src/modules/candidates`
- `src/modules/companies`
- `src/modules/requests`
- `src/modules/staff`
- `src/modules/transfers`
- `src/modules/payroll`
- `src/modules/search`
- `src/modules/files`
- `src/modules/jobs`

Start with read-only views against the sample database, then migrate vertical slices from the old Yii controllers and Angular screens.

## First Vertical Slice

The original recommended first slice was:

1. Role-aware login shell.
2. Candidate list.
3. Candidate detail.
4. Company list/detail.
5. Request list/detail.

That slice touches the important shape of the business without starting with payroll, reports, mobile packaging, or external integrations.

The next actual slice should be Milestone 1 from `nextgen-execution-plan.md`: unified auth and account resolution, because the current role-picker login is the wrong foundation for the target product.
