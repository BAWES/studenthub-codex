"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { getJobSchema, getJobResultSchema } from "./schemas";
import type { GetJobInput, GetJobResult } from "./schemas";

export async function getJob(input: GetJobInput): Promise<GetJobResult> {
  await requireCapability("admin.read");

  const parsed = getJobSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid job UUID");
  }

  const row = await prisma.job.findUnique({
    where: { job_uuid: parsed.data.jobUuid },
    select: {
      job_uuid: true,
      position: true,
      position_ar: true,
      description: true,
      description_ar: true,
      status: true,
      hours_per_day: true,
      days_per_week: true,
      compensation_type: true,
      compensation_amount: true,
      compensation_description: true,
      compensation_description_ar: true,
      min_age: true,
      max_age: true,
      gender: true,
      available_from: true,
      available_to: true,
      area_uuid: true,
      request_uuid: true,
      created_at: true,
      updated_at: true,
      deleted_at: true,
    },
  });

  if (!row) {
    const result: GetJobResult = { job: null };
    const outputParsed = getJobResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/jobs/[id]] getJob output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }

  const result: GetJobResult = { job: row };
  const outputParsed = getJobResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/jobs/[id]] getJob output failed:",
      outputParsed.error.issues,
    );
  }
  return result;
}
