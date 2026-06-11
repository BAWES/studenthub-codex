"use server";

import { getTypesenseClient, CANDIDATES_COLLECTION } from "@/lib/typesense";

export interface CandidatePaletteResult {
  id: number;
  uid: string;
  name: string;
  email: string;
}

/**
 * Quick Typesense candidate name search for the command palette.
 * Returns top N candidates matching the query by name.
 */
export async function searchCandidatesForPalette(
  query: string
): Promise<CandidatePaletteResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  try {
    const client = getTypesenseClient();

    const searchResult = await client
      .collections(CANDIDATES_COLLECTION)
      .documents()
      .search({
        q: trimmed,
        query_by: "candidate_name,candidate_name_ar",
        per_page: 6,
        page: 1,
      });

    const hits = searchResult.hits ?? [];
    return hits.map((hit: any) => {
      const doc = hit.document;
      return {
        id: doc.candidate_id as number,
        uid: doc.candidate_uid || `#${doc.candidate_id}`,
        name: doc.candidate_name as string,
        email: doc.candidate_email as string,
      };
    });
  } catch {
    // Typesense unavailable — fall back silently
    return [];
  }
}
