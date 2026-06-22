import { requireRoleCapability } from "@/modules/auth/session";
import { EmployerApplicationsContent } from "./employer-applications-content";
import { getEmployerApplicationsData } from "@/modules/employer/data";

export const dynamic = "force-dynamic";

export default async function EmployerApplicationsPage() {
  const session = await requireRoleCapability("company", "request.read.linked");
  const data = await getEmployerApplicationsData(session.id);

  return (
    <EmployerApplicationsContent
      session={session}
      applications={data.applications}
      total={data.total}
      metrics={data.metrics}
    />
  );
}
