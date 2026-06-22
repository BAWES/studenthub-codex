import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getMyEmployerId } from "../actions";
import { JobNewForm } from "./JobNewForm";

export const dynamic = "force-dynamic";

export default async function EmployerJobNewPage() {
  const session = await requireRoleCapability("company", "company.write.linked");
  const employerId = await getMyEmployerId();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Employer / Jobs"
      title="New Job Posting"
      metrics={[]}
    >
      <JobNewForm employerId={employerId} />
    </WorkspaceShell>
  );
}
