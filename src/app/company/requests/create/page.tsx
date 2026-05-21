import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCompanyCreateFormCompanies } from "@/modules/workspace/company-data";
import { CompanyRequestCreateForm } from "@/modules/requests/CompanyRequestCreateForm";

export const dynamic = "force-dynamic";

export default async function CompanyRequestCreatePage() {
  const session = await requireRoleCapability("company", "request.create");
  const companies = await getCompanyCreateFormCompanies(session.id);

  if (!companies.length) {
    return (
      <WorkspaceShell session={session} eyebrow="Company" title="New Request" metrics={[]}>
        <p className="emptyState">
          No linked company accounts found. Contact support to link a company to your account.
        </p>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell session={session} eyebrow="Company" title="New Request" metrics={[]}>
      <CompanyRequestCreateForm companies={companies} />
    </WorkspaceShell>
  );
}
