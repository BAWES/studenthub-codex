import { requireRoleCapability } from "@/modules/auth/session";
import { getCompanyWorkspace } from "@/modules/workspace/data";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

export const dynamic = "force-dynamic";

export default async function CompanyPage() {
  const session = await requireRoleCapability("company", "company.read.linked");
  const data = await getCompanyWorkspace(session.id);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Company Workspace"
      title={`Hiring workspace for ${data.contact?.contact_name ?? session.name}.`}
      metrics={data.metrics}
      primary={{ title: "Linked Companies", rows: data.companies }}
      secondary={{ title: "Recent Requests", rows: data.requests }}
    />
  );
}
