import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getComplianceSummary } from "./actions";
import { ComplianceSummaryRow, ComplianceList } from "./_components";
import type { ComplianceSummary } from "./schemas";

export const dynamic = "force-dynamic";

export default async function AdminCompliancePage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const summary: ComplianceSummary = await getComplianceSummary();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin"
      title="Compliance Hub"
      metrics={[]}
    >
      <ComplianceSummaryRow summary={summary} />
      <ComplianceList initialSummary={summary} />
    </WorkspaceShell>
  );
}