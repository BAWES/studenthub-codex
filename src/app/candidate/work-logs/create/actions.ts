"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { submitWorkLogSchema } from "../schemas";
import type { SubmitWorkLogResult } from "../schemas";

// Module-level implementation — handles Prisma queries and store operations
import { submitWorkLog as moduleSubmitWorkLog } from "@/modules/candidate/work-logs/actions";

// ---------------------------------------------------------------------------
// createWorkLog — create a new work log entry for the current candidate
// ---------------------------------------------------------------------------

/**
 * Create a new work log entry for the current candidate.
 * Delegates to the module-level submitWorkLog which handles Prisma queries
 * and delegates further to modules/worklogs for the core create operation.
 * Accepts date, startTime, endTime, totalTime, note, and storeId.
 * Revalidates /candidate/work-logs on success.
 */
export async function createWorkLog(
  params: z.input<typeof submitWorkLogSchema>,
): Promise<SubmitWorkLogResult> {
  const result = await moduleSubmitWorkLog(params);

  // Revalidate only on success (module already handles validation + error formatting)
  if (result.operation === "success") {
    revalidatePath("/candidate/work-logs");
  }

  return result;
}
