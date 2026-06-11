import { requireRoleCapability } from "@/modules/auth/session";
import { getCompanyHomeData } from "./actions";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { CompanyRoleHeader } from "@/modules/company/home/CompanyRoleHeader";
import { CompanyMetrics } from "@/modules/company/home/CompanyMetrics";
import { CompanyRequestPipeline } from "@/modules/company/home/CompanyRequestPipeline";
import { CompanyActivityPanel } from "@/modules/company/home/CompanyActivityPanel";

export const dynamic = "force-dynamic";

export default async function CompanyPage() {
  const session = await requireRoleCapability("company", "company.read.linked");
  const data = await getCompanyHomeData(session.id);

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Company Workspace"
        title={`Hiring workspace for ${data.contact?.contact_name ?? session.name}.`}
        metrics={data.metrics.map((m) => ({
          ...m,
          trend: "flat" as const,
        }))}
      >
        <div className="space-y-6" style={{ marginTop: "1.5rem" }}>
          {/* Role header with contact info + Create Request CTA */}
          <CompanyRoleHeader
            contactName={data.contact?.contact_name ?? session.name}
            contactEmail={data.contact?.contact_email ?? session.email}
            linkedCompanyCount={data.companies.length}
          />

          {/* Extended metric cards */}
          <CompanyMetrics
            baseMetrics={data.metrics}
            activeRequestCount={data.activeRequestCount}
            pendingRequestCount={data.pendingRequestCount}
            openPositionsCount={data.openPositionsCount}
          />

          {/* Pipeline + Activity two-column layout */}
          <div className="grid gap-6 lg:grid-cols-2">
            <CompanyRequestPipeline activeRequests={data.activeRequests} />
            <CompanyActivityPanel activities={data.recentActivity} />
          </div>
        </div>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
