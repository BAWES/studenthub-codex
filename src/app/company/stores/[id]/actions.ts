"use server";

import { requireCapability } from "@/modules/auth/session";
import { getStoreDetail as getStoreDetailImpl } from "@/modules/company/stores/actions";
import { getStoreDetailSchema } from "./schemas";
import type { GetStoreDetailInput } from "./schemas";
import type { StoreDetail } from "@/modules/company/stores/schemas";
import { storeDetailOutputSchema } from "@/modules/company/stores/schemas";

// ---------------------------------------------------------------------------
// Get Store Detail
// ---------------------------------------------------------------------------

/**
 * Fetch the detail of a single store by its store ID.
 * Parses and validates the store ID via Zod, then delegates to the
 * module-level implementation. Validates the output shape before returning.
 * Called from company/stores/[id] route.
 */
export async function getStoreDetail(
  storeIdInput: GetStoreDetailInput["storeId"],
): Promise<StoreDetail | null> {
  await requireCapability("company.read.linked");

  const parsed = getStoreDetailSchema.safeParse({ storeId: storeIdInput });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid store ID input");
  }

  const result = await getStoreDetailImpl(parsed.data.storeId);

  // Validate output shape
  const validated = storeDetailOutputSchema.safeParse(result);
  if (!validated.success) {
    console.error(
      "[company/stores/[id]] getStoreDetail output validation failed:",
      validated.error.issues,
    );
  }

  return result;
}
