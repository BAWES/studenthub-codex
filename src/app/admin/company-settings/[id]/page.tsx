import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getAdminCompanySettings } from "@/app/admin/company-settings/actions";
import { AdminCompanySettingsEditForm } from "./_components/admin-company-settings-edit-form";

export const dynamic = "force-dynamic";

export default async function AdminCompanySettingsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "company.read.any");
  const { id } = await params;
  const settings = await getAdminCompanySettings(Number(id));

  if (!settings) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Company Settings"
        title={settings.company_name || `Company #${settings.company_id}`}
        metrics={[
          { label: "Company ID", value: String(settings.company_id), note: "" },
          { label: "Currency", value: settings.currency_code || "—", note: "" },
        ]}
      >
        <DetailSection
          title="Settings"
          facts={[
            { label: "Company name", value: settings.company_name || "—" },
            { label: "Common name (EN)", value: settings.company_common_name_en || "—" },
            { label: "Common name (AR)", value: settings.company_common_name_ar || "—" },
            { label: "Description (EN)", value: settings.company_description_en || "—" },
            { label: "Description (AR)", value: settings.company_description_ar || "—" },
            { label: "Website", value: settings.company_website || "—" },
            { label: "Email", value: settings.company_email || "—" },
            {
              label: "Hourly rate",
              value: settings.company_hourly_rate != null ? String(settings.company_hourly_rate) : "—",
            },
            {
              label: "Bonus commission",
              value: settings.company_bonus_commission != null ? String(settings.company_bonus_commission) : "—",
            },
            { label: "Followup", value: settings.company_followup ? "Yes" : "No" },
            {
              label: "Followup interval (weeks)",
              value: settings.company_followup_interval_weeks != null
                ? String(settings.company_followup_interval_weeks)
                : "—",
            },
            { label: "Approved to hire", value: settings.company_approved_to_hire ? "Yes" : "No" },
          ]}
        />
        <AdminCompanySettingsEditForm settings={settings} />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
