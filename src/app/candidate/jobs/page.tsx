import { requireRoleCapability } from "@/modules/auth/session";
import { prisma } from "@/lib/prisma";
import { CandidateJobsTable } from "./candidate-jobs-table";

export const dynamic = "force-dynamic";

export default async function CandidateJobsPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const rows = await prisma.job_listing.findMany({
    where: { status: "active" },
    orderBy: [{ createdAt: "desc" }, { jobListingId: "desc" }],
    include: {
      employer: {
        select: { company_name: true },
      },
    },
  });

  const mappedRows = rows.map((r) => ({
    id: r.jobListingId,
    title: r.title,
    employerName: r.employer.company_name,
    employmentType: r.employmentType ?? undefined,
    location: r.location ?? undefined,
    salaryRange: r.salaryRange ?? undefined,
    createdAt: String(r.createdAt),
  }));

  return <CandidateJobsTable session={session} rows={mappedRows} />;
}
