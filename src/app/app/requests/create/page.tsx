import { redirect } from "next/navigation";
import { requireSession } from "@/modules/auth/session";
import { CompanyRequestCreateForm } from "@/modules/requests/CompanyRequestCreateForm";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCompanyCreateFormCompanies } from "@/modules/workspace/company-data";

export const dynamic = "force-dynamic";

export default async function AppRequestCreatePage() {
  const session = await requireSession();

  if (session.role !== "company") {
    redirect("/app/requests");
  }

  const companies = await getCompanyCreateFormCompanies(session.id);

  return (
    <WorkspaceShell session={session} eyebrow="Requests" title="New Request" metrics={[]}>
      <CompanyRequestCreateForm companies={companies} />
    </WorkspaceShell>
  );
}
