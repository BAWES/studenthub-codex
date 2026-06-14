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
  const storeId = Number(id);

  if (Number.isNaN(storeId)) {
    notFound();
  }

  const data = await getStoreDetail(storeId);

  if (!data) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Company / Stores"
      title={data.store_name}
      metrics={[]}
    >
      <DetailSection
        title="Store Details"
        facts={[
          { label: "Name", value: data.store_name },
          { label: "Location", value: data.store_location },
          { label: "Status", value: data.store_status },
          { label: "Company", value: data.company_name },
          { label: "Mall", value: data.mall_name },
          { label: "Brand", value: data.brand_name },
          { label: "Manager", value: data.manager_name },
          { label: "Manager Email", value: data.manager_email },
          { label: "Created", value: formatDate(new Date(data.created_at)) },
          { label: "Updated", value: formatDate(new Date(data.updated_at)) },
        ]}
      />
    </WorkspaceShell>
  );
}
