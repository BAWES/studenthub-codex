import { requireRoleCapability } from "@/modules/auth/session";
import { listEmployerApplications } from "./actions";
import { EmployerApplicationsContent } from "./employer-applications-content";

export const dynamic = "force-dynamic";

export default async function EmployerApplicationsPage() {
  const session = await requireRoleCapability("company", "company.read.linked");
  const result = await listEmployerApplications({ limit: 50 });

  return (
    <EmployerApplicationsContent
      session={session}
      applications={result.applications}
      metrics={result.metrics}
    />
  );
}
