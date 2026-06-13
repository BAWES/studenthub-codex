import { requireRoleCapability } from "@/modules/auth/session";
import { list } from "./actions";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { CompanySettingsForm } from "./company-settings-form";

export const dynamic = "force-dynamic";

export default async function CompanySettingsPage() {
  const session = await requireRoleCapability("company", "company.read.linked");
  const { items } = await list();

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Company Settings"
        title="Manage your company profile, rates, and preferences."
        metrics={[
          { label: "Companies", value: items.length, note: "Linked companies" },
        ]}
      >
        <div className="space-y-6" style={{ marginTop: "1.5rem" }}>
          {items.length === 0 ? (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
              <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                No company settings found. Contact support if you believe this is an error.
              </p>
            </div>
          ) : (
            items.map((company) => (
              <CompanySettingsForm
                key={company.company_id}
                companyId={company.company_id}
                companyName={company.company_name}
                settings={company}
              />
            ))
          )}
        </div>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
