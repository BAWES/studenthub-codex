import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getStoreAssignmentRequest } from "../actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

/** Map TinyInt status to display label. */
function statusLabel(value: number | null): string {
  if (value === 1) return "Approved";
  return "Pending";
}

export default async function AdminUserRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;
  const data = await getStoreAssignmentRequest(id);

  if (!data.request) {
    notFound();
  }

  const req = data.request;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / User Requests"
        title={req.candidate_name ?? "Store Assignment Request"}
        metrics={[
          {
            label: "Status",
            value: statusLabel(req.status),
            note: "",
          },
          {
            label: "Store",
            value: req.store_name ?? "—",
            note: "",
          },
        ]}
      >
        <DetailSection
          title="Request Details"
          facts={[
            { label: "UUID", value: req.sar_uuid },
            {
              label: "Candidate",
              value: req.candidate_name ?? "—",
            },
            {
              label: "Store",
              value: req.store_name ?? "—",
            },
            {
              label: "Currency",
              value: req.currency_code ?? "—",
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
          <Link href={"/admin/user-requests" as Route}>
            <Button variant="outline">Back to User Requests</Button>
          </Link>
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
