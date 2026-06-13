"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";
import type { TransferBankAdviceListItem } from "@/modules/admin/transfers/bank-advice/actions";

type Props = {
  session: SessionUser;
  advices: TransferBankAdviceListItem[];
  total: number;
};

export function AdminBankAdviceTable({ session, advices, total }: Props) {
  const latest = advices[0];
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin finance"
      title="Bank advices — proof-of-payment documents uploaded alongside transfer runs."
      metrics={[
        { label: "Total advices", value: total, note: "Uploaded bank advice records" },
        { label: "Latest serial", value: latest?.serial_no ?? "—", note: latest ? `Uploaded ${formatDate(latest.created_at)}` : "No records found" },
        { label: "Purpose", value: "Proof of payment", note: "Linked to parent transfer run" },
        { label: "Next action", value: "View", note: "Open a record to download the file" },
      ]}
    >
      <DataTable
        title="Transfer Bank Advices"
        description="Uploaded PDF proof-of-payment documents attached to transfer batches."
        rows={advices.map((a) => ({ ...a, id: a.tba_uuid }))}
        rowHref={undefined}
        columns={[
          { key: "serial_no", label: "Serial #", render: (row) => <strong>{row.serial_no ?? "—"}</strong> },
          {
            key: "file_path",
            label: "File",
            render: (row) =>
              row.file_path ? (
                <span className="text-sm font-mono" style={{ color: "var(--sh-primary)" }}>
                  {row.file_path.split("/").pop()}
                </span>
              ) : (
                <span className="text-sm" style={{ color: "var(--muted)" }}>—</span>
              ),
          },
          { key: "created_by", label: "Created by", render: (row) => row.created_by ?? "—" },
          { key: "created_at", label: "Uploaded", render: (row) => formatDate(row.created_at) },
          { key: "updated_at", label: "Updated", render: (row) => formatDate(row.updated_at) },
        ]}
      />
    </WorkspaceShell>
  );
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-KW", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
