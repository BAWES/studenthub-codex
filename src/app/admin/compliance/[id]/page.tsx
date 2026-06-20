import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getComplianceRecord } from "./actions";
import { formatDate } from "@/modules/workspace/format";
import type { CompanyComplianceDetail, IdRequestComplianceDetail } from "./actions";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Parse composite ID like "company-123" or "id_request-uuid"
// ---------------------------------------------------------------------------
function parseComplianceId(
  raw: string,
): { type: "company" | "id_request"; id: string } | null {
  const idx = raw.indexOf("-");
  if (idx === -1) return null;
  const prefix = raw.slice(0, idx);
  const rest = raw.slice(idx + 1);
  if (prefix === "company") return { type: "company" as const, id: rest };
  if (prefix === "id_request") return { type: "id_request" as const, id: rest };
  return null;
}

// ---------------------------------------------------------------------------
// Company detail sub-renderer
// ---------------------------------------------------------------------------
function CompanyDetailView({
  company,
  idRequests,
}: {
  company: NonNullable<CompanyComplianceDetail["company"]>;
  idRequests: CompanyComplianceDetail["idRequests"];
}) {
  return (
    <>
      <DetailSection
        title="Company Details"
        facts={[
          { label: "Company ID", value: String(company.company_id) },
          { label: "Name", value: company.company_name },
          { label: "Email", value: company.company_email ?? "—" },
          {
            label: "Approved to Hire",
            value: company.company_approved_to_hire ? "Yes" : "No",
          },
          {
            label: "Staff Name",
            value: company.staff_name ?? "—",
          },
          {
            label: "Country",
            value: company.country_name_en ?? "—",
          },
          {
            label: "Active Requests",
            value: String(company.no_of_active_requests ?? 0),
          },
          {
            label: "Created",
            value: company.company_created_at
              ? formatDate(new Date(company.company_created_at))
              : "—",
          },
          {
            label: "Updated",
            value: company.company_updated_at
              ? formatDate(new Date(company.company_updated_at))
              : "—",
          },
        ]}
      />

      {idRequests.length > 0 && (
        <DetailSection
          title="Recent ID Requests"
          facts={idRequests.map((r) => ({
            label: r.id.slice(0, 12) + "…",
            value: r.rejection_reason
              ? `${r.status} — ${r.rejection_reason}`
              : r.status,
          }))}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// ID Request detail sub-renderer
// ---------------------------------------------------------------------------
function IdRequestDetailView({
  record,
}: {
  record: NonNullable<IdRequestComplianceDetail["record"]>;
}) {
  return (
    <DetailSection
      title="ID Request Details"
      facts={[
        { label: "UUID", value: record.cir_uuid },
        {
          label: "Candidate IDs",
          value: record.candidate_ids ?? "—",
        },
        {
          label: "Status",
          value: record.status ?? "—",
        },
        {
          label: "Rejection Reason",
          value: record.rejection_reason ?? "—",
        },
        {
          label: "Created",
          value: record.created_at
            ? formatDate(new Date(record.created_at))
            : "—",
        },
        {
          label: "Updated",
          value: record.updated_at
            ? formatDate(new Date(record.updated_at))
            : "—",
        },
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default async function AdminComplianceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;

  const parsed = parseComplianceId(id);
  if (!parsed) {
    notFound();
  }

  const data = await getComplianceRecord({ id: parsed.id, type: parsed.type });
  if (!data) {
    notFound();
  }

  const eyebrow = "Admin / Compliance";
  const backHref = "/admin/compliance" as Route;

  if (data.type === "company") {
    if (!data.company) {
      notFound();
    }

    return (
      <ErrorBoundary>
        <WorkspaceShell
          session={session}
          eyebrow={eyebrow}
          title={data.company.company_name}
          metrics={data.metrics.map((m: { label: string; value: string | number; note: string }) => ({
            label: m.label,
            value: String(m.value),
            note: m.note,
          }))}
        >
          <CompanyDetailView company={data.company} idRequests={data.idRequests} />

          <section className="flex gap-2 p-4">
            <Link href={backHref}>
              <Button variant="outline">Back to Compliance</Button>
            </Link>
          </section>
        </WorkspaceShell>
      </ErrorBoundary>
    );
  }

  // id_request type
  if (!data.record) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow={eyebrow}
        title={`ID Request — ${data.record.cir_uuid.slice(0, 12)}…`}
        metrics={data.metrics.map((m: { label: string; value: string | number; note: string }) => ({
          label: m.label,
          value: String(m.value),
          note: m.note,
        }))}
      >
        <IdRequestDetailView record={data.record} />

        <section className="flex gap-2 p-4">
          <Link href={backHref}>
            <Button variant="outline">Back to Compliance</Button>
          </Link>
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
