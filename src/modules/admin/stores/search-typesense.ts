/**
 * Typesense-powered store search adapter.
 *
 * Matches the same return shape as listStores from actions.ts
 * but queries Typesense instead of MySQL/Prisma for the main search.
 *
 * Fallback: if Typesense is down or has no documents, falls back to the
 * Prisma-based search automatically.
 */

import { getTypesenseClient, STORES_COLLECTION, type StoreDocument, isTypesenseAvailable } from "@/lib/typesense";
import { prisma } from "@/lib/prisma";
import type { ListStoresInput, StoreRow } from "./schemas";

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function listStoresTypesense(input: ListStoresInput = {}): Promise<{
  items: StoreRow[];
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
  const { listStores } = await import("./actions");
  const prismaResult = await listStores(input);
  return {
    ...prismaResult,
    source: { current: "MySQL", target: "Typesense" },
  };
}

// ---------------------------------------------------------------------------
// Typesense search
// ---------------------------------------------------------------------------

async function searchTypesense(input: ListStoresInput): Promise<any> {
  const client = getTypesenseClient();

  // Quick health check with 60s cache — avoids 1s timeout on every SSR request
  // when Typesense is simply not running (e.g. CI, local dev).
  const available = await isTypesenseAvailable();
  if (!available) return null;

  // Verify collection exists and has docs
  try {
    const coll = await client.collections(STORES_COLLECTION).retrieve();
    if (!coll.num_documents || coll.num_documents === 0) return null;
  } catch {
    return null;
  }

  const { page = 1, limit = 20, q, companyId, status } = input;

  // ---- Build filter expression ----
  const filterByParts: string[] = ["deleted: 0"];

  if (companyId !== undefined) {
    filterByParts.push(`company_id: ${companyId}`);
  }

  if (status === "active") {
    filterByParts.push("store_status: 10");
  } else if (status === "inactive") {
    filterByParts.push("store_status: 0");
  }

  const filterBy = filterByParts.length > 0 ? filterByParts.join(" && ") : undefined;
  const searchQuery = (q?.trim()) || "*";

  // ---- Execute search ----
  const searchResult = await client
    .collections(STORES_COLLECTION)
    .documents()
    .search(
      {
        q: searchQuery,
        query_by: "store_name,store_location,brand_name,manager_name,company_name",
        query_by_weights: "4,2,2,1,1",
        filter_by: filterBy,
        sort_by: "store_updated_at:desc",
        per_page: limit,
        page,
      },
      {},
    );

  const hits = searchResult.hits ?? [];
  const found = searchResult.found ?? 0;

  // ---- Build rows ----
  const items: StoreRow[] = hits.map((hit: any) => {
    const doc = hit.document as StoreDocument;
    return {
      store_id: doc.store_id,
      store_name: doc.store_name,
      store_location: doc.store_location,
      store_status: doc.store_status,
      store_total_candidates: doc.store_total_candidates ?? null,
      company_name: doc.company_name || null,
      brand_name: doc.brand_name || null,
      mall_name: doc.mall_name || null,
      manager_name: doc.manager_name || null,
      created_at: null,
      updated_at: doc.store_updated_at
        ? new Date(doc.store_updated_at * 1000).toISOString()
        : null,
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
