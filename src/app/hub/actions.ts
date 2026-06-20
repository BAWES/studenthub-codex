"use server";

// ---------------------------------------------------------------------------
// Hub — page-level server action
// ---------------------------------------------------------------------------
// Wraps the unified hub action with page-level Zod input validation.
// Auth is handled internally by getUnifiedHubAction (requireSession).
// ---------------------------------------------------------------------------

import { getUnifiedHubAction } from "@/modules/app/actions";
import {
  getHubDataSchema,
  type GetHubDataInput,
} from "./schemas";

/**
 * Fetch hub workspace data for the authenticated user.
 * Input validated against getHubDataSchema. Delegates to the module-level
 * getUnifiedHubAction which handles auth, data fetching, and output validation.
 */
export async function getHubData(input: GetHubDataInput) {
  const parsed = getHubDataSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  return getUnifiedHubAction({
    query: parsed.data.query,
    scope: parsed.data.scope,
    record: parsed.data.record,
  });
}
