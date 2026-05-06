# Search Migration

StudentHub should keep MySQL as the source of truth for permissions, writes, finance, and audit-sensitive workflows. Candidate discovery should move behind a search adapter so staff and admins get fast typo-tolerant search, facets, and saved operational views without dragging every interaction through wide SQL queries.

## Direction

- Use Meilisearch first for the candidate search layer.
- Index candidates from the existing Prisma/MySQL model into `studenthub_candidates`.
- Keep all candidate preview and mutation reads server-side and role-scoped in Next.js.
- Treat the search index as disposable derived data. Rebuild it from MySQL whenever needed.

## Local Indexing

Start Meilisearch locally, then run:

```bash
MEILI_HOST=http://127.0.0.1:7700 MEILI_MASTER_KEY=dev-master-key npm run search:index-candidates
```

Useful options:

- `MEILI_CANDIDATE_INDEX`: defaults to `studenthub_candidates`.
- `MEILI_BATCH_SIZE`: defaults to `500`.
- `MEILI_LIMIT`: set a smaller number for a quick trial.
- `MEILI_CLEAR=1`: delete existing candidate documents before indexing.
- `MEILI_TASK_TIMEOUT_MS`: setup task timeout, defaults to `120000`.

The script is at `scripts/index-candidates-meilisearch.mjs`. It loads `.env`, reads the production-clone database through Prisma, and sends documents directly to Meilisearch over HTTP without adding another npm dependency.

## Candidate Document Shape

The index includes:

- identity: candidate id, UID, name, Arabic name, email, phone, civil ID
- facets: country, university, company, store, status, approval, skills, tags
- operating flags: needs review, incomplete profile, civil ID review, duplicate
- ranking helpers: updated date, created date, hourly rate, score

## Migration Gates

- Search UI works today from live MySQL.
- Smoke tests assert the new candidate search surface renders for admin and staff.
- Next step is to add a read adapter that queries Meilisearch first and falls back to MySQL when the search service is unavailable.
