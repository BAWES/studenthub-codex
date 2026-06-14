"use server";

// ---------------------------------------------------------------------------
// Admin Reports [id] — server actions barrel
// ---------------------------------------------------------------------------
// Detail-page server actions for a single report.
// getReport already lives in the parent module — re-export with Next.js 15
// compatible pattern (bare re-exports are forbidden in "use server" files).
// ---------------------------------------------------------------------------

import { getReport as _getReport } from "../../../../modules/admin/reports/actions";
import type { SingleReportResult } from "../../../../modules/admin/reports/actions";

/**
 * Get a single generated report by ID and type.
 * Requires admin.read capability.
 */
export async function getReport(input: { id: string; type: string }): Promise<SingleReportResult> {
  return _getReport(input);
}
