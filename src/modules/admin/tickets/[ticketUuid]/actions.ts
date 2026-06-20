"use server";

// ---------------------------------------------------------------------------
// Admin Tickets [ticketUuid] — server actions wrapper
// ---------------------------------------------------------------------------
// Detail-page server actions for a single ticket.
// Re-exports getTicket from the parent module with the proper Next.js 15
// wrapper pattern (bare re-exports are forbidden in "use server" files).
// ---------------------------------------------------------------------------

import { getTicket as _getTicket } from "../actions";
import type { TicketDetail } from "../schemas";

/**
 * Get a single ticket with full detail.
 * Requires admin.read capability.
 */
export async function getTicket(
  ticketUuid: string,
): Promise<{ ticket: TicketDetail | null }> {
  return _getTicket(ticketUuid);
}
