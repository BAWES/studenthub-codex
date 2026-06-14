"use server";

// ---------------------------------------------------------------------------
// Admin Stores [id] — server actions wrapper
// ---------------------------------------------------------------------------
// Detail-page server actions for a single store.
// Re-exports getStore from the parent module with the proper Next.js 15
// wrapper pattern (bare re-exports are forbidden in "use server" files).
// ---------------------------------------------------------------------------

import { getStore as _getStore } from "../actions";
import type { StoreDetail } from "../schemas";

/**
 * Get a single store with full detail.
 * Requires admin.read capability.
 */
export async function getStore(storeId: number): Promise<StoreDetail> {
  return _getStore(storeId);
}
