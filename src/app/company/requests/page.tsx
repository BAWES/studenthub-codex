import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCompanyRequestRows } from "@/modules/workspace/data";
import { CompanyRequestsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function CompanyRequestsPage() {
  const session = await requireRoleCapability("company", "request.read.linked");
  const rows = await getCompanyRequestRows(session.id);

  return (
    <WorkspaceShell session={session} eyebrow="Company" title="Requests" metrics={[]}>
      <CompanyRequestsTable rows={rows} />
    </WorkspaceShell>
  );
}
