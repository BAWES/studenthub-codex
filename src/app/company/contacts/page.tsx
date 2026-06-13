import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCompanyContactsRows, getCompanySelectOptions } from "@/modules/company/data";
import { AddContactForm } from "@/modules/company/AddContactForm";
import { CompanyContactsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function CompanyContactsPage() {
  const session = await requireRoleCapability("company", "company.read.linked");
  const [rows, companies] = await Promise.all([
    getCompanyContactsRows(session.id),
    getCompanySelectOptions(session.id)
  ]);

  return (
    <WorkspaceShell session={session} eyebrow="Company" title="Linked Contacts" metrics={[]}>
      <AddContactForm companies={companies} />
      <CompanyContactsTable rows={rows} />
    </WorkspaceShell>
  );
}
