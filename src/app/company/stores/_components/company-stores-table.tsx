"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { RemoveStoreButton } from "@/modules/company/RemoveStoreButton";

interface StoreRow {
  id: number;
  name: string;
  location: string;
  mallName: string | null;
  brandName: string | null;
  companyName: string;
  managerName: string | null;
}

export function CompanyStoresTable({ rows }: { rows: StoreRow[] }) {
  return (
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
  );
}
