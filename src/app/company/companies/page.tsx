import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCompanyAccountRows } from "@/modules/workspace/data";
import { CompanyCompaniesTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function CompanyCompaniesPage() {
  const session = await requireRoleCapability("company", "company.read.linked");
  const rows = await getCompanyAccountRows(session.id);

  return (
    <WorkspaceShell session={session} eyebrow="Company" title="Linked Companies" metrics={[]}>
      <CompanyCompaniesTable rows={rows} />
    </WorkspaceShell>
  );
}
