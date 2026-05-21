import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCompanyStoresRows, getCompanyMallsAndBrands, getCompanySelectOptions } from "@/modules/company/data";
import { AddStoreForm } from "@/modules/company/AddStoreForm";
import { RemoveStoreButton } from "@/modules/company/RemoveStoreButton";

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
      <DataTable
        title="Stores"
        description="Store locations linked to companies you manage."
        rows={rows}
        columns={[
          { key: "name", label: "Store", render: (row) => <strong>{row.name}</strong> },
          { key: "location", label: "Location", render: (row) => row.location },
          { key: "mall", label: "Mall", render: (row) => row.mallName || "—" },
          { key: "brand", label: "Brand", render: (row) => row.brandName || "—" },
          { key: "company", label: "Company", render: (row) => row.companyName },
          { key: "manager", label: "Manager", render: (row) => row.managerName || "—" },
          { key: "actions", label: "Actions", render: (row) => <RemoveStoreButton storeId={row.id} storeName={row.name} /> }
        ]}
      />
    </WorkspaceShell>
  );
}
