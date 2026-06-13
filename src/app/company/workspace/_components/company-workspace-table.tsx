"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";

type CompanyRow = {
  id: string | number;
  title: string;
  subtitle: string;
  status: string;
  updated: string;
};

type RequestRow = {
  id: string | number;
  title: string;
  subtitle: string;
  meta?: string;
};

type Metrics = {
  label: string;
  value: string | number;
  note: string;
  trend?: "up" | "down" | "flat";
  trendLabel?: string;
  sparklineData?: number[];
  accent?: "primary" | "success" | "warning" | "info";
};

type Props = {
  session: SessionUser;
  companies: CompanyRow[];
  requests: RequestRow[];
  metrics: Metrics[];
  welcomeTitle: string;
};

export function CompanyWorkspaceTable({ session, companies, requests, metrics, welcomeTitle }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Company Workspace"
      title={welcomeTitle}
      metrics={metrics.map((m) => ({ ...m, trend: "flat" as const }))}
    >
      <div className="space-y-6" style={{ marginTop: "1.5rem" }}>
        {/* Linked Companies */}
        <DataTable
          title="Linked Companies"
          description="Companies linked to your contact account."
          rows={companies}
          rowHref="/company/workspace/"
          columns={[
            { key: "title", label: "Company", render: (row) => <strong>{row.title}</strong> },
            { key: "subtitle", label: "Position", render: (row) => row.subtitle },
            { key: "status", label: "Access", render: (row) => row.status ? <StatusBadge variant={genericStatusVariant(row.status)} label={row.status} size="sm" /> : null },
          ]}
        />

        {/* Recent Requests */}
        <DataTable
          title="Recent Requests"
          description="Latest hiring requests across your linked companies."
          rows={requests}
          rowHref="/company/requests/"
          columns={[
            { key: "title", label: "Position", render: (row) => <strong>{row.title}</strong> },
            { key: "subtitle", label: "Company", render: (row) => row.subtitle },
            { key: "meta", label: "Details", render: (row) => row.meta ?? "" },
          ]}
        />
      </div>
    </WorkspaceShell>
  );
}
