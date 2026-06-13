import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCompanyStoresRows, getCompanyMallsAndBrands, getCompanySelectOptions } from "@/modules/company/data";
import { AddStoreForm } from "@/modules/company/AddStoreForm";
import { CompanyStoresTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function CompanyStoresPage() {
  const session = await requireRoleCapability("company", "company.read.linked");
  const [rows, { malls, brands }, companies] = await Promise.all([
    getCompanyStoresRows(session.id),
    getCompanyMallsAndBrands(session.id),
    getCompanySelectOptions(session.id)
  ]);

  return (
    <WorkspaceShell session={session} eyebrow="Company" title="Stores &amp; Branches" metrics={[]}>
      <AddStoreForm companies={companies} malls={malls} brands={brands} />
      <CompanyStoresTable rows={rows} />
    </WorkspaceShell>
  );
}
