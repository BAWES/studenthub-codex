"use server";

// ---------------------------------------------------------------------------
// Admin Invoices [id] — server actions
// ---------------------------------------------------------------------------
// Detail-page server actions for a single invoice.
// Re-exports getInvoice from the parent module with the proper Next.js 15
// wrapper pattern (bare re-exports are forbidden in "use server" files).
// ---------------------------------------------------------------------------

import { getInvoice as _getInvoice } from "../../invoices/actions";
import type { InvoiceDetail } from "../../invoices/schemas";

/**
 * Get a single invoice with transfer details and candidate payouts.
 * Requires finance.read capability.
 */
export async function getInvoice(
  invoiceId: number,
): Promise<InvoiceDetail> {
  return _getInvoice(invoiceId);
}
