/**
 * Index companies into Typesense from MySQL.
 *
 * Usage:
 *   node scripts/index-companies-typesense.mjs
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
const COLLECTION = "companies";

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

const COMPANY_SCHEMA = {
  name: COLLECTION,
  fields: [
    { name: "company_id", type: "int32" },
    { name: "company_name", type: "string" },
    { name: "company_common_name_en", type: "string" },
    { name: "company_email", type: "string" },
    { name: "company_approved_to_hire", type: "bool", facet: true },
    { name: "no_of_active_requests", type: "int32" },
    { name: "company_hourly_rate", type: "float" },
    { name: "currency_code", type: "string" },
    { name: "company_updated_at", type: "int64" },
    { name: "staff_name", type: "string" },
    { name: "country_name", type: "string", facet: true },
    { name: "deleted", type: "int32" },
  ],
  default_sorting_field: "company_updated_at",
};

async function ensureCollection() {
  if (CLEAR) {
    console.log(`Dropping existing ${COLLECTION} collection...`);
    const existing = await tsRequest(`/collections/${COLLECTION}`, { allow404: true, method: "DELETE" });
    if (existing) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  const existing = await tsRequest(`/collections/${COLLECTION}`, { allow404: true });
  if (!existing) {
    console.log(`Creating ${COLLECTION} collection...`);
    const result = await tsRequest("/collections", {
      method: "POST",
      body: COMPANY_SCHEMA,
    });
    console.log(`Collection created: ${JSON.stringify({ name: result.name, num_documents: result.num_documents })}`);
  } else {
    console.log(`Collection ${COLLECTION} already exists: ${existing.num_documents} documents`);
  }
}

async function* fetchAllCompanies() {
  let cursor = 0;
  while (true) {
    const batch = await prisma.company.findMany({
      where: { deleted: 0, company_id: { gt: cursor } },
      orderBy: { company_id: "asc" },
      take: BATCH_SIZE,
      select: {
        company_id: true,
        company_name: true,
        company_common_name_en: true,
        company_email: true,
        company_approved_to_hire: true,
        no_of_active_requests: true,
        company_hourly_rate: true,
        currency_code: true,
        company_updated_at: true,
        staff: { select: { staff_name: true } },
        country: { select: { country_name_en: true } },
      },
    });

    if (batch.length === 0) break;
    cursor = batch[batch.length - 1].company_id;
    yield batch;
  }
}

function toTypesenseDoc(row) {
  return {
    company_id: row.company_id,
    company_name: row.company_name ?? "",
    company_common_name_en: row.company_common_name_en ?? "",
    company_email: row.company_email ?? "",
    company_approved_to_hire: row.company_approved_to_hire ?? false,
    no_of_active_requests: row.no_of_active_requests ?? 0,
    company_hourly_rate: row.company_hourly_rate ? Number(row.company_hourly_rate) : 0,
    currency_code: row.currency_code ?? "KWD",
    company_updated_at: row.company_updated_at
      ? Math.floor(row.company_updated_at.getTime() / 1000)
      : 0,
    staff_name: row.staff?.staff_name ?? "",
    country_name: row.country?.country_name_en ?? "",
    deleted: 0,
  };
}

async function indexBatch(docs) {
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
  console.log("Typesense company indexer starting...");

  if (!TYPESENSE_API_KEY) {
    console.error("ERROR: TYPESENSE_API_KEY not set. Add it to .env.local");
    process.exit(1);
  }

  const health = await tsRequest("/health");
  console.log(`Typesense health: ${JSON.stringify(health)}`);

  await ensureCollection();

  let totalDocs = 0;
  let batchNum = 0;
  for await (const batch of fetchAllCompanies()) {
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
  console.log(`\nDone: ${totalDocs} companies indexed in ${elapsed}s`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
