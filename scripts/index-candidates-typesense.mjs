/**
 * Index candidates into Typesense from MySQL.
 *
 * Usage:
 *   node scripts/index-candidates-typesense.mjs
 *
 * Environment variables:
 *   TYPESENSE_HOST        (default: localhost)
 *   TYPESENSE_PORT        (default: 8108)
 *   TYPESENSE_PROTOCOL    (default: http)
 *   TYPESENSE_API_KEY     (required for writes)
 *   TYPESENSE_BATCH_SIZE  (default: 500)
 *   TYPESENSE_CLEAR       (set to "1" to drop and recreate the collection)
 *   DATABASE_URL          (used by Prisma)
 */

import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

function loadEnv() {
  if (!fs.existsSync(".env")) return;
  const env = fs.readFileSync(".env", "utf8");
  for (const line of env.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=["']?(.+?)["']?$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}
if (!fs.existsSync(".env.local")) loadEnv();
if (fs.existsSync(".env.local")) {
  const env = fs.readFileSync(".env.local", "utf8");
  for (const line of env.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=["']?(.+?)["']?$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  }
}

const prisma = new PrismaClient();

const TYPESENSE_HOST = process.env.TYPESENSE_HOST ?? "localhost";
const TYPESENSE_PORT = Number(process.env.TYPESENSE_PORT ?? 8108);
const TYPESENSE_PROTOCOL = process.env.TYPESENSE_PROTOCOL ?? "http";
const TYPESENSE_API_KEY = process.env.TYPESENSE_API_KEY ?? "";
const BATCH_SIZE = Math.max(Number(process.env.TYPESENSE_BATCH_SIZE ?? 500), 1);
const CLEAR = process.env.TYPESENSE_CLEAR === "1";
const COLLECTION = "candidates";

const BASE = `${TYPESENSE_PROTOCOL}://${TYPESENSE_HOST}:${TYPESENSE_PORT}`;

async function tsRequest(path, options = {}) {
  const url = `${BASE}${path}`;
  const resp = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "content-type": "application/json",
      "x-typesense-api-key": TYPESENSE_API_KEY,
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await resp.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  if (!resp.ok) {
    if (resp.status === 404 && options.allow404) return null;
    throw new Error(`Typesense ${options.method ?? "GET"} ${path} failed: ${resp.status} ${JSON.stringify(body)}`);
  }
  return body;
}

const CANDIDATE_SCHEMA = {
  name: COLLECTION,
  fields: [
    { name: "candidate_id", type: "int32" },
    { name: "candidate_name", type: "string" },
    { name: "candidate_name_ar", type: "string" },
    { name: "candidate_email", type: "string" },
    { name: "candidate_phone", type: "string" },
    { name: "candidate_uid", type: "string" },
    { name: "country_id", type: "int32", facet: true },
    { name: "country_name", type: "string", facet: true },
    { name: "university_id", type: "int32", facet: true },
    { name: "university_name", type: "string", facet: true },
    { name: "company_id", type: "int32", facet: true },
    { name: "company_name", type: "string", facet: true },
    { name: "store_name", type: "string" },
    { name: "skills", type: "string[]", facet: true },
    { name: "candidate_gender", type: "int32", facet: true },
    { name: "candidate_status", type: "int32" },
    { name: "approved", type: "int32" },
    { name: "is_incomplete_profile", type: "bool" },
    { name: "candidate_civil_need_verification", type: "bool" },
    { name: "has_resume", type: "bool" },
    { name: "store_id", type: "int32" },
    { name: "candidate_updated_at", type: "int64" },
    { name: "tags", type: "string[]" },
    { name: "candidate_hourly_rate", type: "float" },
    { name: "currency_code", type: "string" },
  ],
  default_sorting_field: "candidate_updated_at",
};

async function ensureCollection() {
  if (CLEAR) {
    console.log(`Dropping existing ${COLLECTION} collection...`);
    const existing = await tsRequest(`/collections/${COLLECTION}`, { allow404: true, method: "DELETE" });
    if (existing) {
      // Wait for async drop to settle
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  const existing = await tsRequest(`/collections/${COLLECTION}`, { allow404: true });
  if (!existing) {
    console.log(`Creating ${COLLECTION} collection...`);
    const result = await tsRequest("/collections", {
      method: "POST",
      body: CANDIDATE_SCHEMA,
    });
    console.log(`Collection created: ${JSON.stringify({ name: result.name, num_documents: result.num_documents })}`);
  } else {
    console.log(`Collection ${COLLECTION} already exists: ${existing.num_documents} documents`);
  }
}

async function* fetchAllCandidates() {
  let cursor = 0;
  while (true) {
    const batch = await prisma.candidate.findMany({
      where: { deleted: 0, candidate_id: { gt: cursor } },
      orderBy: { candidate_id: "asc" },
      take: BATCH_SIZE,
      select: {
        candidate_id: true,
        candidate_uid: true,
        candidate_name: true,
        candidate_name_ar: true,
        candidate_email: true,
        candidate_phone: true,
        candidate_status: true,
        approved: true,
        candidate_hourly_rate: true,
        currency_code: true,
        candidate_gender: true,
        candidate_updated_at: true,
        is_incomplete_profile: true,
        candidate_civil_need_verification: true,
        candidate_resume: true,
        store_id: true,
        country_id: true,
        university_id: true,
        country: { select: { country_name_en: true } },
        university: { select: { university_name_en: true } },
        store: {
          select: {
            store_name: true,
            company: { select: { company_id: true, company_name: true } },
          },
        },
        candidate_skill: {
          where: { deleted: 0 },
          select: { skill: true },
        },
        candidate_tag: {
          where: { deleted: 0 },
          select: { tag: true },
        },
      },
    });

    if (batch.length === 0) break;
    cursor = batch[batch.length - 1].candidate_id;
    yield batch;
  }
}

function toTypesenseDoc(row) {
  const skills = (row.candidate_skill ?? []).map((s) => s.skill).filter(Boolean);
  const tags = (row.candidate_tag ?? []).map((t) => t.tag).filter(Boolean);

  return {
    candidate_id: row.candidate_id,
    candidate_name: row.candidate_name ?? "",
    candidate_name_ar: row.candidate_name_ar ?? "",
    candidate_email: row.candidate_email ?? "",
    candidate_phone: row.candidate_phone ?? "",
    candidate_uid: row.candidate_uid ?? "",
    country_id: row.country_id ?? 0,
    country_name: row.country?.country_name_en ?? "",
    university_id: row.university_id ?? 0,
    university_name: row.university?.university_name_en ?? "",
    company_id: row.store?.company?.company_id ?? 0,
    company_name: row.store?.company?.company_name ?? "",
    store_name: row.store?.store_name ?? "",
    skills,
    tags,
    candidate_gender: row.candidate_gender ?? 0,
    candidate_status: row.candidate_status ?? 0,
    approved: row.approved ?? 0,
    is_incomplete_profile: row.is_incomplete_profile ?? false,
    candidate_civil_need_verification: row.candidate_civil_need_verification ?? false,
    has_resume: row.candidate_resume != null,
    store_id: row.store_id ?? 0,
    candidate_updated_at: row.candidate_updated_at
      ? Math.floor(row.candidate_updated_at.getTime() / 1000)
      : 0,
    candidate_hourly_rate: row.candidate_hourly_rate ?? 0,
    currency_code: row.currency_code ?? "KWD",
  };
}

async function indexBatch(docs) {
  // Typesense uses the /collections/:name/documents/import endpoint for bulk upserts
  // The format is newline-delimited JSON (one JSON object per line)
  const body = docs.map((d) => JSON.stringify(d)).join("\n");
  const resp = await fetch(`${BASE}/collections/${COLLECTION}/documents/import?action=upsert`, {
    method: "POST",
    headers: {
      "content-type": "text/plain",
      "x-typesense-api-key": TYPESENSE_API_KEY,
    },
    body,
  });
  const text = await resp.text();
  // Typesense returns one JSON result per line, one per document
  const lines = text.trim().split("\n").map((l) => JSON.parse(l));
  const succeeded = lines.filter((l) => l.success === true).length;
  const failed = lines.length - succeeded;
  if (!resp.ok || failed > 0) {
    const errors = lines.filter((l) => !l.success).slice(0, 3);
    console.error(`  Batch result: ${succeeded} ok, ${failed} failed. Sample errors:`, JSON.stringify(errors));
  }
  return { succeeded, failed, total: lines.length };
}

async function main() {
  const start = Date.now();
  console.log("Typesense candidate indexer starting...");

  // Validate API key
  if (!TYPESENSE_API_KEY) {
    console.error("ERROR: TYPESENSE_API_KEY not set. Add it to .env.local");
    process.exit(1);
  }

  // Health check
  const health = await tsRequest("/health");
  console.log(`Typesense health: ${JSON.stringify(health)}`);

  // Ensure collection
  await ensureCollection();

  // Fetch and index
  let totalDocs = 0;
  let batchNum = 0;
  for await (const batch of fetchAllCandidates()) {
    batchNum++;
    const docs = batch.map(toTypesenseDoc);
    const { succeeded, failed } = await indexBatch(docs);
    totalDocs += succeeded;

    const rate = Math.round((Date.now() - start) / totalDocs);
    console.log(
      `Batch ${batchNum}: ${docs.length} docs (${succeeded} ok, ${failed} failed) — total ${totalDocs} indexed — ${rate}ms/doc avg`
    );

    if (failed > docs.length / 2) {
      console.error("ERROR: More than 50% of docs in this batch failed. Aborting.");
      process.exit(1);
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nDone: ${totalDocs} candidates indexed in ${elapsed}s`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
