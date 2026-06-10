"use server";

// ---------------------------------------------------------------------------
// Employer Dashboard — server actions
// Provides stats summary, recent applications, and job listing counts
// for the employer/company role dashboard overview.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { requireCapability, getSession } from "@/modules/auth/session";
import type { EmployerDashboardData, RecentApplication, JobStatusBreakdown } from "./schemas";

// ---------------------------------------------------------------------------
// getEmployerDashboardData
// ---------------------------------------------------------------------------

/**
 * Fetch employer dashboard data for the logged-in company user.
 * Returns metrics summary, recent applications, and job status breakdown.
 */
export async function getEmployerDashboardData(): Promise<EmployerDashboardData> {
  await requireCapability("company.read.linked");

  const session = await getSession();
  if (!session) {
    return {
      metrics: [],
      recentApplications: [],
      jobStatusBreakdown: [],
      totalJobs: 0,
      totalApplications: 0,
    };
  }

  // Get the employer's company ID from their contact link
  const contactLink = await prisma.company_contact.findFirst({
    where: { contact_uuid: session.id },
    select: { company: { select: { company_id: true } } },
  });

  const employerId = contactLink?.company?.company_id;
  if (!employerId) {
    return {
      metrics: [],
      recentApplications: [],
      jobStatusBreakdown: [],
      totalJobs: 0,
      totalApplications: 0,
    };
  }

  // Run all queries in parallel for performance
  const [
    totalJobs,
    activeJobs,
    totalApplications,
    newApplications30d,
    jobStatusRows,
    recentAppRows,
  ] = await Promise.all([
    // Total job listings
    prisma.job_listing.count({
      where: { employerId },
    }),
    // Active job listings
    prisma.job_listing.count({
      where: { employerId, status: "active" },
    }),
    // Total applications across all employer's jobs
    prisma.job_listing_application.count({
      where: {
        jobListing: { employerId },
      },
    }),
    // New applications in the last 30 days
    prisma.job_listing_application.count({
      where: {
        jobListing: { employerId },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    // Job status breakdown
    prisma.job_listing.groupBy({
      by: ["status"],
      where: { employerId },
      _count: { status: true },
    }),
    // Recent 10 applications with candidate + job info
    prisma.job_listing_application.findMany({
      where: {
        jobListing: { employerId },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        jobListing: { select: { title: true, jobListingId: true } },
        candidate: {
          select: {
            candidate_id: true,
            candidate_name: true,
            candidate_name_ar: true,
          },
        },
      },
    }),
  ]);

  // Build job status breakdown
  const jobStatusBreakdown: JobStatusBreakdown[] = jobStatusRows.map((row) => ({
    status: row.status ?? "unknown",
    count: row._count.status,
  }));

  // Map recent applications
  const recentApplications: RecentApplication[] = recentAppRows.map((r) => ({
    applicationId: r.id,
    candidateId: r.candidateId,
    candidateName: r.candidate?.candidate_name ?? r.candidate?.candidate_name_ar ?? null,
    jobTitle: r.jobListing.title,
    jobListingId: r.jobListing.jobListingId,
    status: r.status,
    createdAt: r.createdAt,
  }));

  return {
    metrics: [
      {
        label: "Active Job Listings",
        value: activeJobs,
        note: `${totalJobs} total job postings`,
      },
      {
        label: "Total Applications",
        value: totalApplications,
        note: `${newApplications30d} submitted in the last 30 days`,
      },
      {
        label: "New Applications (30d)",
        value: newApplications30d,
        note: "Received across all active jobs",
      },
    ],
    recentApplications,
    jobStatusBreakdown,
    totalJobs,
    totalApplications,
  };
}
