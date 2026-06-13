import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getAdminCompanyDetail } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminCompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRoleCapability("admin", "company.read.any");
  const { id } = await params;
  const data = await getAdminCompanyDetail(Number(id));

  if (!data.company) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Company"
        title={data.company.company_name}
        metrics={data.metrics}
        primary={{ title: "Requests", rows: data.requests }}
        secondary={{ title: "Contacts", rows: data.contacts }}
      >
        <DetailSection
          title="Account"
          facts={[
            { label: "Email", value: data.company.company_email },
            { label: "Common Name", value: data.company.company_common_name_en },
            { label: "Website", value: data.company.company_website },
            { label: "Country", value: data.company.country_name_en },
            { label: "Created", value: formatDate(data.company.company_created_at) },
            { label: "Updated", value: formatDate(data.company.company_updated_at) }
          ]}
        />
        <section className="detailGrid">
          <DetailSection type="list" title="Stores" rows={data.stores} />
          <DetailSection type="list" title="Notes" rows={data.notes} />
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
