import { requireRoleCapability } from "@/modules/auth/session";
import { CompanyRequestCreateForm } from "@/modules/requests/CompanyRequestCreateForm";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCompanyList } from "./actions";

export const dynamic = "force-dynamic";

export default async function CompanyRequestCreatePage() {
  const session = await requireRoleCapability("company", "request.create");
  const companies = await getCompanyList(session.id);

  return (
    <WorkspaceShell session={session} eyebrow="Company" title="New Request" metrics={[]}>
      <CompanyRequestCreateForm companies={companies} />
    </WorkspaceShell>
  );
}
