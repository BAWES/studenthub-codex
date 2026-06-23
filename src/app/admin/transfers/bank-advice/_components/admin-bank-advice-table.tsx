"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { TransferBankAdviceListItem } from "../actions";
import { formatDate } from "@/modules/workspace/format";

type Props = {
  session: SessionUser;
  advices: TransferBankAdviceListItem[];
};

export function AdminBankAdviceTable({ session, advices }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin finance"
      title="Transfer Bank Advice — view uploaded bank advice documents."
      metrics={[
        {
          label: "Total records",
          value: advices.length,
          note: "Uploaded bank advice documents in the system",
        },
      ]}
    >
      <DataTable
        title="Bank Advice Records"
        description="All uploaded bank advice documents. Each entry links to an uploaded file path."
        searchable={true}
        rows={advices.map((a) => ({ ...a, id: a.tba_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "tba_uuid",
            label: "UUID",
            render: (row) => (
              <span className="font-mono text-xs text-foreground">
                {row.tba_uuid.slice(0, 8)}…
              </span>
            ),
          },
          {
            key: "serial_no",
            label: "Serial No.",
            render: (row) => row.serial_no?.toString() ?? "—",
          },
          {
            key: "file_path",
            label: "File Path",
            render: (row) => row.file_path ?? "—",
          },
          {
            key: "created_by",
            label: "Created By",
            render: (row) => row.created_by?.toString() ?? "—",
          },
          {
            key: "created_at",
            label: "Created",
            render: (row) => (row.created_at ? formatDate(row.created_at) : "—"),
          },
          {
            key: "updated_at",
            label: "Updated",
            render: (row) => (row.updated_at ? formatDate(row.updated_at) : "—"),
          },
        ]}
      />
    </WorkspaceShell>
  );
}
