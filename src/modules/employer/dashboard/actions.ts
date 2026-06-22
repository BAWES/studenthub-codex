"use server";

// ---------------------------------------------------------------------------
// Employer Dashboard — server actions (module-level)
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { requireCapability, getSession } from "@/modules/auth/session";
import {
  employerDashboardDataSchema,
  type EmployerDashboardData,
  type RecentApplication,
  type JobStatusBreakdown,
} from "./schemas";

// ---------------------------------------------------------------------------
// getEmployerDashboardData
// ---------------------------------------------------------------------------

/**
 * Fetch employer dashboard data for the logged-in company user.
 */
export async function getEmployerDashboardData(): Promise<EmployerDashboardData> {
  await requireCapability("company.read.linked");

  const session = await getSession();
  if (!session) {
    return { metrics: [], recentApplications: [], jobStatusBreakdown: [], totalJobs: 0, totalApplications: 0, pendingReviews: 0 };
  }

  // Get the employer's company ID from their contact link
  const contactLink = await prisma.company_contact.findFirst({
    where: { contact_uuid: session.id },
    select: { company: { select: { company_id: true } } },
  });

  const employerId = contactLink?.company?.company_id;
  if (!employerId) {
    return { metrics: [], recentApplications: [], jobStatusBreakdown: [], totalJobs: 0, totalApplications: 0, pendingReviews: 0 };
  }

  // Run all queries in parallel for performance
  const [
    totalJobs,
    activeJobs,
    totalApplications,
    newApplications30d,
    pendingReviews,
    jobStatusRows,
    recentAppRows,
  ] = await Promise.all([
    prisma.job_listing.count({ where: { employerId } }),
    prisma.job_listing.count({ where: { employerId, status: "active" } }),
    prisma.job_listing_application.count({ where: { jobListing: { employerId } } }),
    prisma.job_listing_application.count({
      where: {
        jobListing: { employerId },
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.job_listing_application.count({
      where: {
        jobListing: { employerId },
        status: { in: ["reviewing", "shortlisted"] },
      },
    }),
    prisma.job_listing.groupBy({
      by: ["status"],
      where: { employerId },
      _count: { status: true },
    }),
    prisma.job_listing_application.findMany({
      where: { jobListing: { employerId } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        jobListing: { select: { title: true, jobListingId: true } },
        candidate: { select: { candidate_id: true, candidate_name: true, candidate_name_ar: true } },
      },
    }),
  ]);

  const jobStatusBreakdown: JobStatusBreakdown[] = jobStatusRows.map((row: any) => ({
    status: row.status ?? "unknown",
    count: row._count.status,
  }));

  const recentApplications: RecentApplication[] = recentAppRows.map((r: any) => ({
    applicationId: r.id,
    candidateId: r.candidateId,
    candidateName: r.candidate?.candidate_name ?? r.candidate?.candidate_name_ar ?? null,
    jobTitle: r.jobListing.title,
    jobListingId: r.jobListing.jobListingId,
    status: r.status,
    createdAt: r.createdAt,
  }));

  const result: EmployerDashboardData = {
    metrics: [
      { label: "Active Job Listings", value: activeJobs, note: `${totalJobs} total job postings` },
      { label: "Total Applications", value: totalApplications, note: `${totalJobs} active job postings` },
      { label: "Pending Reviews", value: pendingReviews, note: "Applications awaiting your review" },
      { label: "New Applications (30d)", value: newApplications30d, note: "Submitted in the last 30 days" },
    ],
    recentApplications,
    jobStatusBreakdown,
    totalJobs,
    totalApplications,
    pendingReviews,
  };

  // Validate output shape
  const outputParsed = employerDashboardDataSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/employer/dashboard] getEmployerDashboardData output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
