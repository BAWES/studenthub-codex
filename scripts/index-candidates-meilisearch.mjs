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

loadEnv();

const prisma = new PrismaClient();
const meiliHost = (process.env.MEILI_HOST ?? "http://127.0.0.1:7700").replace(/\/$/, "");
const meiliKey = process.env.MEILI_MASTER_KEY ?? process.env.MEILI_API_KEY ?? "";
const indexUid = process.env.MEILI_CANDIDATE_INDEX ?? "studenthub_candidates";
const batchSize = Math.max(Number(process.env.MEILI_BATCH_SIZE ?? 500), 1);
const limit = Number(process.env.MEILI_LIMIT ?? 0);
const clearIndex = process.env.MEILI_CLEAR === "1";
const taskTimeoutMs = Number(process.env.MEILI_TASK_TIMEOUT_MS ?? 120000);

async function meiliRequest(path, options = {}) {
  const response = await fetch(`${meiliHost}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "content-type": "application/json",
      ...(meiliKey ? { authorization: `Bearer ${meiliKey}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (response.status === 404 && options.allow404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Meilisearch ${options.method ?? "GET"} ${path} failed: ${response.status} ${JSON.stringify(body)}`);
  }

  return body;
}

async function waitForTask(task, label) {
  const taskUid = task?.taskUid ?? task?.uid;
  if (taskUid == null) return;

  const started = Date.now();
  while (Date.now() - started < taskTimeoutMs) {
    const current = await meiliRequest(`/tasks/${taskUid}`);
    if (current.status === "succeeded") {
      console.log(`${label} task ${taskUid} succeeded`);
      return;
    }
    if (current.status === "failed" || current.status === "canceled") {
      throw new Error(`${label} task ${taskUid} ${current.status}: ${current.error?.message ?? "no error message"}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`${label} task ${taskUid} exceeded ${taskTimeoutMs}ms`);
}

async function ensureCandidateIndex() {
  const existingIndex = await meiliRequest(`/indexes/${indexUid}`, { allow404: true });
  if (!existingIndex) {
    const createTask = await meiliRequest("/indexes", {
      method: "POST",
      body: { uid: indexUid, primaryKey: "id" }
    });
    console.log(`queued ${indexUid} creation task ${createTask.taskUid ?? createTask.uid ?? "unknown"}`);
    await waitForTask(createTask, "index creation");
  }

  const settingsTask = await meiliRequest(`/indexes/${indexUid}/settings`, {
    method: "PATCH",
    body: {
      searchableAttributes: [
        "name",
        "arabicName",
        "email",
        "phone",
        "uid",
        "civilId",
        "skills",
        "tags",
        "company",
        "store",
        "country",
        "university",
        "objective",
        "intro"
      ],
      filterableAttributes: [
        "status",
        "approval",
        "countryId",
        "universityId",
        "companyId",
        "storeId",
        "skills",
        "tags",
        "needsReview",
        "incomplete",
        "civilIdReview",
        "duplicate",
        "jobSearchStatus"
      ],
      sortableAttributes: ["updatedAt", "createdAt", "score", "hourlyRate"],
      displayedAttributes: ["*"]
    }
  });

  if (clearIndex) {
    const clearTask = await meiliRequest(`/indexes/${indexUid}/documents`, { method: "DELETE" });
    console.log(`queued index clear task ${clearTask.taskUid ?? clearTask.uid ?? "unknown"}`);
    await waitForTask(clearTask, "index clear");
  }

  console.log(`configured ${indexUid} settings task ${settingsTask.taskUid ?? settingsTask.uid ?? "unknown"}`);
  await waitForTask(settingsTask, "settings");
}

async function fetchCandidateBatch(cursor) {
  return prisma.candidate.findMany({
    where: { deleted: 0, candidate_id: { gt: cursor } },
    orderBy: { candidate_id: "asc" },
    take: batchSize,
    select: {
      candidate_id: true,
      candidate_uid: true,
      candidate_name: true,
      candidate_name_ar: true,
      candidate_email: true,
      candidate_phone: true,
      candidate_civil_id: true,
      candidate_objective: true,
      candidate_intro: true,
      candidate_status: true,
      approved: true,
      candidate_job_search_status: true,
      candidate_civil_need_verification: true,
      is_incomplete_profile: true,
      is_duplicate: true,
      candidate_hourly_rate: true,
      currency_code: true,
      country_id: true,
      university_id: true,
      store_id: true,
      candidate_created_at: true,
      candidate_updated_at: true,
      country: { select: { country_name_en: true } },
      university: { select: { university_name_en: true } },
      store: {
        select: {
          store_id: true,
          store_name: true,
          company_id: true,
          company: { select: { company_id: true, company_name: true } }
        }
      },
      candidate_skill: {
        where: { deleted: 0 },
        orderBy: { candidate_skill_created_at: "desc" },
        take: 40,
        select: { skill: true }
      },
      candidate_tag: {
        where: { deleted: 0 },
        orderBy: { created_at: "desc" },
        take: 40,
        select: { tag: true }
      }
    }
  });
}

function candidateDocument(row) {
  const skills = unique(row.candidate_skill.map((item) => item.skill));
  const tags = unique(row.candidate_tag.map((item) => item.tag));
  const needsReview = row.approved === 0;
  const incomplete = Boolean(row.is_incomplete_profile);
  const civilIdReview = Boolean(row.candidate_civil_need_verification);
  const status = needsReview ? "needs-review" : row.candidate_status === 10 ? "active" : `status-${row.candidate_status}`;
  const score =
    (needsReview ? 42 : 0) +
    (incomplete ? 28 : 0) +
    (civilIdReview ? 22 : 0) +
    (row.candidate_status !== 10 ? 10 : 0) +
    Math.min(skills.length * 3, 18);

  return {
    id: row.candidate_id,
    uid: row.candidate_uid,
    name: row.candidate_name,
    arabicName: row.candidate_name_ar,
    email: row.candidate_email,
    phone: row.candidate_phone,
    civilId: row.candidate_civil_id,
    objective: row.candidate_objective,
    intro: row.candidate_intro,
    status,
    approval: needsReview ? "pending" : "approved",
    needsReview,
    incomplete,
    civilIdReview,
    duplicate: Boolean(row.is_duplicate),
    jobSearchStatus: row.candidate_job_search_status ?? null,
    hourlyRate: decimalToNumber(row.candidate_hourly_rate),
    currency: row.currency_code ?? "KWD",
    countryId: row.country_id,
    country: row.country?.country_name_en ?? null,
    universityId: row.university_id,
    university: row.university?.university_name_en ?? null,
    storeId: row.store_id ?? row.store?.store_id ?? null,
    store: row.store?.store_name ?? null,
    companyId: row.store?.company_id ?? row.store?.company?.company_id ?? null,
    company: row.store?.company?.company_name ?? null,
    skills,
    tags,
    score,
    createdAt: dateToIso(row.candidate_created_at),
    updatedAt: dateToIso(row.candidate_updated_at)
  };
}

async function indexCandidates() {
  let cursor = 0;
  let indexed = 0;
  let latestTask = null;

  while (true) {
    const remaining = limit ? Math.max(limit - indexed, 0) : Infinity;
    if (remaining === 0) break;

    const rows = await fetchCandidateBatch(cursor);
    if (!rows.length) break;

    const documents = rows.slice(0, remaining).map(candidateDocument);
    const task = await meiliRequest(`/indexes/${indexUid}/documents?primaryKey=id`, {
      method: "POST",
      body: documents
    });

    latestTask = task;
    indexed += documents.length;
    cursor = rows[rows.length - 1].candidate_id;
    console.log(`queued ${indexed.toLocaleString("en-US")} candidates through id ${cursor}`);

    if (documents.length < rows.length) break;
  }

  return { indexed, latestTask };
}

function unique(values) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean))];
}

function decimalToNumber(value) {
  if (value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function dateToIso(value) {
  return value instanceof Date ? value.toISOString() : null;
}

async function main() {
  console.log(`indexing candidates from MySQL into ${meiliHost}/indexes/${indexUid}`);
  await ensureCandidateIndex();
  const { indexed, latestTask } = await indexCandidates();
  console.log(
    `queued ${indexed.toLocaleString("en-US")} candidate documents; latest task ${
      latestTask?.taskUid ?? latestTask?.uid ?? "unknown"
    }`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
