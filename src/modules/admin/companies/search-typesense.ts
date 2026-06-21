/**
 * Typesense-powered company search adapter.
 *
 * Matches the same return shape as listAdminCompanies from actions.ts
 * but queries Typesense instead of MySQL/Prisma for the main search.
 *
 * Fallback: if Typesense is down or has no documents, falls back to the
 * Prisma-based search automatically.
 */

import { getTypesenseClient, COMPANIES_COLLECTION, type CompanyDocument, isTypesenseAvailable } from "@/lib/typesense";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDate } from "@/modules/workspace/format";
import type { ListAdminCompaniesInput, CompanyRow } from "./schemas";

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function listAdminCompaniesTypesense(input: ListAdminCompaniesInput = {}): Promise<{
  items: CompanyRow[];
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
  const { listAdminCompanies } = await import("./actions");
  const prismaResult = await listAdminCompanies(input);
  return {
    ...prismaResult,
    source: { current: "MySQL", target: "Typesense" },
  };
}

// ---------------------------------------------------------------------------
// Typesense search
// ---------------------------------------------------------------------------

async function searchTypesense(input: ListAdminCompaniesInput): Promise<any> {
  const client = getTypesenseClient();

  // Quick health check with 60s cache — avoids 1s timeout on every SSR request
  // when Typesense is simply not running (e.g. CI, local dev).
  const available = await isTypesenseAvailable();
  if (!available) return null;

  // Verify collection exists and has docs
  try {
    const coll = await client.collections(COMPANIES_COLLECTION).retrieve();
    if (!coll.num_documents || coll.num_documents === 0) return null;
  } catch {
    return null;
  }

  const { page = 1, limit = 60, q, status = "all" } = input;

  // ---- Build filter expression ----
  const filterByParts: string[] = ["deleted: 0"];

  if (status === "approved") {
    filterByParts.push("company_approved_to_hire: true");
  } else if (status === "not_approved") {
    filterByParts.push("company_approved_to_hire: false");
  }

  const filterBy = filterByParts.length > 0 ? filterByParts.join(" && ") : undefined;
  const searchQuery = (q?.trim()) || "*";

  // ---- Execute search ----
  const searchResult = await client
    .collections(COMPANIES_COLLECTION)
    .documents()
    .search(
      {
        q: searchQuery,
        query_by: "company_name,company_common_name_en,company_email,staff_name",
        query_by_weights: "4,2,1,1",
        filter_by: filterBy,
        sort_by: "company_updated_at:desc",
        per_page: limit,
        page,
      },
      {},
    );

  const hits = searchResult.hits ?? [];
  const found = searchResult.found ?? 0;

  // ---- Build rows ----
  const items: CompanyRow[] = hits.map((hit: any) => {
    const doc = hit.document as CompanyDocument;
    return {
      id: doc.company_id,
      name: doc.company_name,
      email: doc.company_email || "No email",
      owner: doc.staff_name || "Unassigned",
      requests: doc.no_of_active_requests ?? 0,
      status: doc.company_approved_to_hire ? "Approved" : "Not approved",
      rate: formatMoney(doc.company_hourly_rate, doc.currency_code || "KWD"),
      updated: doc.company_updated_at
        ? formatDate(new Date(doc.company_updated_at * 1000))
        : "",
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
