"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import { z } from "zod";

const checkApplicationSchema = z.object({
  jobId: z.coerce.number().int().positive(),
});

export async function checkIfApplied(jobId: number): Promise<boolean> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const parsed = checkApplicationSchema.safeParse({ jobId });
  if (!parsed.success) return false;

  const candidateId = Number(session.id);
  const existing = await prisma.job_listing_application.findFirst({
    where: { jobListingId: parsed.data.jobId, candidateId },
    select: { id: true },
  });

  return existing !== null;
}
