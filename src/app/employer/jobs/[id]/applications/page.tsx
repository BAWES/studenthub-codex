import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { getJob } from "../../actions";
import { listJobApplications } from "./actions";
import { EmployerApplicationsTable } from "./employer-applications-table";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EmployerJobApplicationsPage({ params }: Props) {
  const session = await requireRoleCapability("company", "company.read.linked");
  const { id } = await params;

  const job = await getJob({ jobId: Number(id) });
  if (!job) notFound();

  const result = await listJobApplications({ jobListingId: Number(id), limit: 100 });

  return (
    <div className="py-6">
      <EmployerApplicationsTable
        applications={result.applications}
        total={result.total}
        jobTitle={job.title}
      />
    </div>
  );
}
