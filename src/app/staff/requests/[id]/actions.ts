"use server";

import { getRequestDetail as _getRequestDetail } from "@/modules/workspace/data/shared";
import { requireRoleCapability } from "@/modules/auth/session";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const getStaffRequestDetailSchema = z.object({
  requestUuid: z.string().min(1, "Request UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetStaffRequestDetailInput = z.input<typeof getStaffRequestDetailSchema>;

// ---------------------------------------------------------------------------
// getStaffRequestDetail — get full request detail with pipeline data
// ---------------------------------------------------------------------------

/**
 * Get detailed information about a staff request, including the full
 * pipeline (applications, interviews, invitations, activities, notes,
 * stories, skills, suggestions, matched candidates with scoring).
 *
 * Verifies the request belongs to the current staff member.
 * Wraps the shared @/modules/workspace/data/shared getRequestDetail
 * as a route-level server action.
 */
export async function getStaffRequestDetail(
  params: z.input<typeof getStaffRequestDetailSchema>,
): Promise<Awaited<ReturnType<typeof _getRequestDetail>>> {
  const session = await requireRoleCapability("staff", "request.read.assigned");

  const parsed = getStaffRequestDetailSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { requestUuid } = parsed.data;
  const staffId = Number(session.id);

  return _getRequestDetail(requestUuid, staffId);
}
