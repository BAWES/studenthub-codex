import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getStoreDetail } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function CompanyStoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRoleCapability("company", "company.read.linked");
  const { id } = await params;
  const store = await getStoreDetail(Number(id));

  if (!store) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Company / Store"
      title={store.store_name}
      metrics={[]}
    >
      <DetailSection
        title="Store Details"
        facts={[
          { label: "Name", value: store.store_name },
          { label: "Location", value: store.store_location },
          { label: "Status", value: store.store_status === "active" ? "Active" : "Inactive" },
          { label: "Company", value: store.company_name ?? "—" },
          { label: "Mall", value: store.mall_name ?? "—" },
          { label: "Brand", value: store.brand_name ?? "—" },
          { label: "Manager", value: store.manager_name ?? "—" },
          { label: "Manager Email", value: store.manager_email ?? "—" },
          { label: "Created", value: formatDate(new Date(store.created_at)) },
          { label: "Updated", value: formatDate(new Date(store.updated_at)) },
        ]}
      />
    </WorkspaceShell>
  );
}
