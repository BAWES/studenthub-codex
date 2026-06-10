"use server";

// ---------------------------------------------------------------------------
// Hub workspace — server actions
// Mirrors the legacy getUnifiedHub() from @/modules/hub/data.
// ---------------------------------------------------------------------------

import { requireSession } from "@/modules/auth/session";
import { getUnifiedHub } from "@/modules/hub/data";
import { getHubInputSchema } from "./schemas";

/**
 * Fetch unified hub data for the current session.
 * Wraps the module-level getUnifiedHub with session retrieval and input validation.
 */
export async function getUnifiedHubAction(options: {
  query?: string;
  scope?: string;
  record?: string;
}) {
  const session = await requireSession();

  const parsed = getHubInputSchema.safeParse(options);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid hub input");
  }

  return getUnifiedHub(session, {
    query: parsed.data.query,
    scope: parsed.data.scope,
    record: parsed.data.record,
  });
}
