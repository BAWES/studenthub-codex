import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getWorkspace } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function CompanyWorkspaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRoleCapability("company", "company.read.linked");
  const { id } = await params;
  const data = await getWorkspace(id);

  if (!data?.contact) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Company / Workspace"
      title={data.contact.contact_name}
      metrics={data.metrics}
      primary={{ title: "Companies", rows: data.companies }}
      secondary={{ title: "Requests", rows: data.requests }}
    >
      <DetailSection
        title="Contact"
        facts={[
          { label: "Name", value: data.contact.contact_name },
          { label: "Email", value: data.contact.contact_email },
        ]}
      />
    </WorkspaceShell>
  );
}
