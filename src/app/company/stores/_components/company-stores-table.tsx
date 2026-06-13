"use client";

import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { AddStoreForm } from "@/modules/company/AddStoreForm";
import { RemoveStoreButton } from "@/modules/company/RemoveStoreButton";
import type { SessionUser } from "@/modules/auth/types";

type Row = Record<string, unknown> & { id: string | number };

type MallAndBrand = { uuid: string; name: string };
type CompanyOpt = { id: number; name: string };

type Props = {
  session: SessionUser;
  rows: Row[];
  malls: MallAndBrand[];
  brands: MallAndBrand[];
  companies: CompanyOpt[];
};

export function CompanyStoresTable({ session, rows, malls, brands, companies }: Props) {
  return (
    <WorkspaceShell session={session} eyebrow="Company" title="Stores &amp; Branches" metrics={[]}>
      <AddStoreForm companies={companies} malls={malls} brands={brands} />
      <DataTablePage
        title="Stores"
        description="Store locations linked to companies you manage."
        rows={rows}
        searchable
        searchPlaceholder="Search by store, location, mall, brand..."
        columns={[
          { key: "name", label: "Store", render: (row) => <strong>{String(row.name)}</strong> },
          { key: "location", label: "Location", render: (row) => String(row.location) },
          { key: "mall", label: "Mall", render: (row) => String(row.mallName || "—") },
          { key: "brand", label: "Brand", render: (row) => String(row.brandName || "—") },
          { key: "company", label: "Company", render: (row) => String(row.companyName) },
          { key: "manager", label: "Manager", render: (row) => String(row.managerName || "—") },
          { key: "actions", label: "Actions", render: (row) => <RemoveStoreButton storeId={row.id as number} storeName={String(row.name)} /> }
        ]}
      />
    </WorkspaceShell>
  );
}
