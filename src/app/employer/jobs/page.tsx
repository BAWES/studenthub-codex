import { requireRoleCapability } from "@/modules/auth/session";
import { listJobs } from "./actions";
import { EmployerJobsTable } from "./employer-jobs-table";

export const dynamic = "force-dynamic";

export default async function EmployerJobsPage() {
  const session = await requireRoleCapability("company", "company.read.linked");
  const result = await listJobs({ limit: 50 });

  // Map Prisma rows to include `id` for DataTable compatibility
  const rows = result.items.map((job) => ({
    id: job.jobListingId,
    title: job.title,
    employmentType: job.employmentType ?? undefined,
    location: job.location ?? undefined,
    salaryRange: job.salaryRange ?? undefined,
    status: job.status,
    createdAt: job.createdAt.toISOString().slice(0, 10),
  }));

  return <EmployerJobsTable session={session} rows={rows} total={result.total} />;
}
