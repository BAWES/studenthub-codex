/**
 * Typesense-powered job listing search adapter.
 *
 * Matches the same return shape as listJobs from actions.ts
 * but queries Typesense instead of MySQL/Prisma for the main search.
 *
 * Fallback: if Typesense is down or has no documents, falls back to the
 * Prisma-based search automatically.
 */

import { getTypesenseClient, JOBS_COLLECTION, type JobDocument, isTypesenseAvailable } from "@/lib/typesense";
import type { ListJobsInput, JobRow } from "./schemas";

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function listJobsTypesense(input: ListJobsInput = {}): Promise<{
  items: JobRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  source: { current: string; target: string };
}> {
  // Try Typesense first
  const tsResult = await searchTypesense(input);

  if (tsResult) {
    return tsResult;
  }

  // Fallback to Prisma/MySQL
  const { listJobs } = await import("./actions");
  const prismaResult = await listJobs(input);
  return {
    ...prismaResult,
    source: { current: "MySQL", target: "Typesense" },
  };
}

// ---------------------------------------------------------------------------
// Typesense search
// ---------------------------------------------------------------------------

async function searchTypesense(input: ListJobsInput): Promise<any> {
  const client = getTypesenseClient();

  // Quick health check with 60s cache — avoids 1s timeout on every SSR request
  // when Typesense is simply not running (e.g. CI, local dev).
  const available = await isTypesenseAvailable();
  if (!available) return null;

  // Verify collection exists and has docs
  try {
    const coll = await client.collections(JOBS_COLLECTION).retrieve();
    if (!coll.num_documents || coll.num_documents === 0) return null;
  } catch {
    return null;
  }

  const { page = 1, limit = 20, q, status } = input;

  // ---- Build filter expression ----
  const filterByParts: string[] = [];

  if (status) {
    filterByParts.push(`status: ${status}`);
  }

  const filterBy = filterByParts.length > 0 ? filterByParts.join(" && ") : undefined;
  const searchQuery = (q?.trim()) || "*";

  // ---- Execute search ----
  const searchResult = await client
    .collections(JOBS_COLLECTION)
    .documents()
    .search(
      {
        q: searchQuery,
        query_by: "title,description,requirements,location,company_name",
        query_by_weights: "4,2,1,1,1",
        filter_by: filterBy,
        sort_by: "updated_at:desc",
        per_page: limit,
        page,
      },
      {},
    );

  const hits = searchResult.hits ?? [];
  const found = searchResult.found ?? 0;

  // ---- Build rows matching the JobRow shape ----
  const items: JobRow[] = hits.map((hit: any) => {
    const doc = hit.document as JobDocument;
    return {
      jobListingId: doc.job_listing_id,
      employerId: doc.employer_id,
      title: doc.title,
      description: doc.description,
      requirements: doc.requirements || null,
      location: doc.location || null,
      employmentType: doc.employment_type || null,
      salaryRange: doc.salary_range || null,
      status: doc.status || null,
      createdAt: doc.created_at ? new Date(doc.created_at * 1000) : new Date(0),
      updatedAt: doc.updated_at ? new Date(doc.updated_at * 1000) : new Date(0),
    };
  });

  return {
    items,
    total: found,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(found / limit)),
    source: {
      current: "Typesense",
      target: "Typesense",
    },
  };
}
