import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getCompanyRequest } from "../actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

/** Map TinyInt status to display label. */
function statusLabel(value: number | null): string {
  if (value === 1) return "Approved";
  return "Pending";
}

export default async function AdminCompanyRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;
  const data = await getCompanyRequest(id);

  if (!data.request) {
    notFound();
  }

  const req = data.request;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Company Requests"
        title={req.company_name ?? "Company Request"}
        metrics={[
          {
            label: "Status",
            value: statusLabel(req.status),
            note: "",
          },
          {
            label: "Contact",
            value: req.contact_name ?? "—",
            note: "",
          },
        ]}
      >
        <DetailSection
          title="Request Details"
          facts={[
            { label: "UUID", value: req.company_request_uuid },
            {
              label: "Company Name",
              value: req.company_name ?? "—",
            },
            {
              label: "Company Email",
              value: req.company_email ?? "—",
            },
            {
              label: "Contact Name",
              value: req.contact_name ?? "—",
            },
            {
              label: "Contact Position",
              value: req.contact_position ?? "—",
            },
            {
              label: "Phone",
              value: req.phone_number ?? "—",
            },
            {
              label: "Requesting For",
              value: req.requesting_for ?? "—",
            },
            {
              label: "Currency",
              value: req.currency_code ?? "—",
            },
            {
              label: "Country",
              value: req.country_name_en ?? "—",
            },
            {
              label: "Status",
              value: statusLabel(req.status),
            },
            {
              label: "Created",
              value: req.created_at
                ? formatDate(new Date(req.created_at))
                : "—",
            },
            {
              label: "Updated",
              value: req.updated_at
                ? formatDate(new Date(req.updated_at))
                : "—",
            },
          ]}
        />

        <section className="flex gap-2 p-4">
          <Link href={"/admin/company-requests" as Route}>
            <Button variant="outline">Back to Company Requests</Button>
          </Link>
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
