"use server";

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listStaffInterviews as moduleListStaffInterviews,
  getStaffInterviewDetail as moduleGetStaffInterviewDetail,
  updateInterviewStatus as moduleUpdateInterviewStatus,
} from "@/modules/staff/interviews/actions";

// ---------------------------------------------------------------------------
// App-level wrappers that add auth + revalidation, delegating to module actions
// ---------------------------------------------------------------------------

export async function listStaffInterviews(
  params: Record<string, unknown> = {},
): Promise<Awaited<ReturnType<typeof moduleListStaffInterviews>>> {
  await requireRoleCapability("staff", "request.interview");
  return moduleListStaffInterviews(params as any);
}

export async function getStaffInterviewDetail(
  params: Record<string, unknown>,
): Promise<Awaited<ReturnType<typeof moduleGetStaffInterviewDetail>>> {
  await requireRoleCapability("staff", "request.interview");
  return moduleGetStaffInterviewDetail(params as any);
}

export async function updateInterviewStatus(
  params: Record<string, unknown>,
): Promise<Awaited<ReturnType<typeof moduleUpdateInterviewStatus>>> {
  await requireRoleCapability("staff", "request.interview");

  const result = await moduleUpdateInterviewStatus(params as any);

  if (result.operation === "success") {
    revalidatePath("/staff/interviews");
  }

  return result;
}
