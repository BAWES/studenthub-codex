import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRoleCapability } from "@/modules/auth/session";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { listCompanyRequests } from "./actions";

export const dynamic = "force-dynamic";

const statusBadge = (status: string) => {
  const colors: Record<string, string> = {
    pending: "#f59e0b",
    started: "#3b82f6",
    delivered: "#10b981",
    cancelled: "#ef4444",
    finished_by_recruitment: "#8b5cf6",
  };
  const color = colors[status] ?? "#6b7280";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.125rem 0.625rem",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        color: "#fff",
        background: color,
        textTransform: "capitalize",
      }}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
};

export default async function CompanyRequestsPage() {
  const session = await requireRoleCapability("company", "request.read.linked");
  const result = await listCompanyRequests();

  return (
    <WorkspaceShell session={session} eyebrow="Company" title="Requests" metrics={[]}>
      <div style={{ marginBottom: "1rem" }}>
        <Link
          href="/company/requests/create"
          className={cn(
            buttonVariants({ variant: "default" }),
            "inline-flex items-center gap-2",
          )}
        >
          <Plus className="size-4" />
          New Request
        </Link>
      </div>
      <DataTable
        title="Hiring Requests"
        description="Requests across the company accounts linked to this contact."
        rows={result.requests.map((r) => ({
          id: r.request_uuid,
          title: r.request_position_title ?? "Untitled request",
          company: r.company_name ?? "No company",
          owner: "",
          seats: r.request_number_of_employees ?? 0,
          status: r.request_status ?? "pending",
          updated: r.request_updated_datetime ? new Date(r.request_updated_datetime).toLocaleDateString() : "N/A",
        }))}
        rowHref="/company/requests/"
        columns={[
          { key: "title", label: "Request", render: (row) => <strong>{row.title}</strong> },
          { key: "company", label: "Company", render: (row) => row.company },
          { key: "owner", label: "Owner", render: (row) => row.owner },
          { key: "seats", label: "Seats", render: (row) => row.seats },
          {
            key: "status",
            label: "Status",
            render: (row) => statusBadge(row.status as string),
          },
          { key: "updated", label: "Updated", render: (row) => row.updated }
        ]}
      />
    </WorkspaceShell>
  );
}
