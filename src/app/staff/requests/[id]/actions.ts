"use server";

import { getRequestDetail as _getRequestDetail } from "@/modules/workspace/request-detail-core";
import { requireRoleCapability } from "@/modules/auth/session";
import { z } from "zod";
import {
  getStaffRequestDetailSchema,
  type GetStaffRequestDetailInput,
} from "./schemas";

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
