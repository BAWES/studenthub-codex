import { requireRoleCapability } from "@/modules/auth/session";
import { listEmployerApplications } from "./actions";
import { EmployerApplicationsContent } from "./employer-applications-content";

export const dynamic = "force-dynamic";

export default async function EmployerApplicationsPage() {
  const session = await requireRoleCapability("company", "company.read.linked");
  const result = await listEmployerApplications({ limit: 50 });

  // Map rows to include `id` for DataTable compatibility
  const rows = result.items.map((app) => ({
    id: app.id,
    candidateName: app.candidateName,
    jobTitle: app.jobTitle,
    status: app.status,
    createdAt: app.createdAt.toISOString().slice(0, 10),
  }));

  return (
    <EmployerApplicationsContent
      session={session}
      rows={rows}
      total={result.total}
      metrics={result.metrics}
    />
  );
}
