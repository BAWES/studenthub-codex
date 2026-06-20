import { requireRoleCapability } from "@/modules/auth/session";
import { getCompanyWorkspace } from "./actions";
import { CompanyWorkspaceTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function CompanyWorkspacePage() {
  const session = await requireRoleCapability("company", "company.read.linked");
  const data = await getCompanyWorkspace(session.id);

  return (
    <CompanyWorkspaceTable
      session={session}
      welcomeTitle={`Welcome, ${data.contact?.contact_name ?? session.name}.`}
      metrics={data.metrics}
      companies={data.companies.map((c) => ({
        ...c,
        status: c.meta ?? "",
        updated: "",
      }))}
      requests={data.requests}
    />
  );
}
