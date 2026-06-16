"use server";

// ---------------------------------------------------------------------------
// Employer Applications — server actions (module-level)
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { requireCapability, getSession } from "@/modules/auth/session";
import {
  listApplicationsSchema,
  listApplicationsResultSchema,
  type ApplicationRow,
  type ListApplicationsInput,
  type ListApplicationsResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listEmployerApplications
// ---------------------------------------------------------------------------

/**
 * List job listing applications for the logged-in employer's company,
 * with pagination, status filter, and computed metrics.
 */
export async function listEmployerApplications(
  input: ListApplicationsInput = {},
): Promise<ListApplicationsResult> {
  await requireCapability("company.read.linked");

  const session = await getSession();
  if (!session) {
    return emptyResult();
  }

  // Resolve employer company ID from the logged-in contact
  const contactLink = await prisma.company_contact.findFirst({
    where: { contact_uuid: session.id },
    select: { company: { select: { company_id: true } } },
  });

  const employerId = contactLink?.company?.company_id;
  if (!employerId) {
    return emptyResult();
  }

  const parsed = listApplicationsSchema.safeParse(input);
  if (!parsed.success) {
    return emptyResult();
  }

  const { page, limit, status } = parsed.data;
  const skip = (page - 1) * limit;

  // Base where clause: only applications for this employer's job listings
  const where: Record<string, unknown> = {
    jobListing: { employerId },
  };
  if (status) {
    where.status = status;
  }

  // Run queries in parallel
  const [items, total, pendingCount, acceptedCount, rejectedCount] =
    await Promise.all([
      prisma.job_listing_application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          jobListing: { select: { title: true } },
          candidate: { select: { candidate_name: true, candidate_name_ar: true } },
        },
      }),
      prisma.job_listing_application.count({ where }),
      prisma.job_listing_application.count({
        where: { ...where, status: { in: ["pending", "new", "review"] } },
      }),
      prisma.job_listing_application.count({
        where: { ...where, status: "accepted" },
      }),
      prisma.job_listing_application.count({
        where: { ...where, status: "rejected" },
      }),
    ]);

  const rows: ApplicationRow[] = items.map((r) => ({
    id: r.id,
    jobListingId: r.jobListingId,
    candidateId: r.candidateId,
    candidateName:
      r.candidate?.candidate_name ?? r.candidate?.candidate_name_ar ?? null,
    jobTitle: r.jobListing.title,
    status: r.status,
    createdAt: r.createdAt,
  }));

  const result: ListApplicationsResult = {
    items: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    metrics: {
      total,
      pending: pendingCount,
      accepted: acceptedCount,
      rejected: rejectedCount,
    },
  };

  // Validate output shape
  const outputParsed = listApplicationsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/employer/applications] listEmployerApplications output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyResult(): ListApplicationsResult {
  return {
    items: [],
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
    metrics: { total: 0, pending: 0, accepted: 0, rejected: 0 },
  };
}
