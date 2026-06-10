"use server";

import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

export async function checkIfApplied(jobId: number): Promise<boolean> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);
  const existing = await prisma.job_listing_application.findFirst({
    where: { jobListingId: jobId, candidateId },
    select: { applicationId: true },
  });
  return existing !== null;
}
