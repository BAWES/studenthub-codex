import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getAdminDiscountCategoryRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function AdminDiscountCategoryPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const rows = await getAdminDiscountCategoryRows();

  return (
    <WorkspaceShell session={session} eyebrow="Admin" title="Discount Categories" metrics={[]}>
      <DataTable
        title="Discount Categories"
        description="Manage discount categories"
        rows={rows}
        rowHref={(row) => `/admin/discount-category/${row.id}` as Route}
        columns={[
          { key: "name_en", label: "Name (EN)", render: (row) => <strong>{row.name_en}</strong> },
          { key: "name_ar", label: "Name (AR)", render: (row) => row.name_ar },
          { key: "discounts", label: "Discounts", render: (row) => row.discounts },
          { key: "updated", label: "Updated", render: (row) => row.updated }
        ]}
      />
    </WorkspaceShell>
  );
}
