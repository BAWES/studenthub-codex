"use server";

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listStaffInterviews as moduleListStaffInterviews,
  getStaffInterviewDetail as moduleGetStaffInterviewDetail,
  updateInterviewStatus as moduleUpdateInterviewStatus,
} from "@/modules/staff/interviews/actions";
import {
  interviewListOutputSchema,
  interviewDetailOutputSchema,
  updateInterviewStatusOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// App-level wrappers that add auth + revalidation, delegating to module actions
// ---------------------------------------------------------------------------

export async function listStaffInterviews(
  params: Record<string, unknown> = {},
): Promise<Awaited<ReturnType<typeof moduleListStaffInterviews>>> {
  await requireRoleCapability("staff", "request.interview");

  const result = await moduleListStaffInterviews(params as any);

  // Validate output shape
  const outputParsed = interviewListOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[staff/interviews] listStaffInterviews output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

export async function getStaffInterviewDetail(
  params: Record<string, unknown>,
): Promise<Awaited<ReturnType<typeof moduleGetStaffInterviewDetail>>> {
  await requireRoleCapability("staff", "request.interview");

  const result = await moduleGetStaffInterviewDetail(params as any);

  // Validate output shape
  const outputParsed = interviewDetailOutputSchema.nullable().safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[staff/interviews] getStaffInterviewDetail output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

export async function updateInterviewStatus(
  params: Record<string, unknown>,
): Promise<Awaited<ReturnType<typeof moduleUpdateInterviewStatus>>> {
  await requireRoleCapability("staff", "request.interview");

  const result = await moduleUpdateInterviewStatus(params as any);

  // Validate output shape
  const outputParsed = updateInterviewStatusOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[staff/interviews] updateInterviewStatus output validation failed:",
      outputParsed.error.issues,
    );
  }

  if (result.operation === "success") {
    revalidatePath("/staff/interviews");
  }

  return result;
}
