import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCandidateTransferRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function CandidatePaymentsPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const rows = await getCandidateTransferRows(Number(session.id));

  return (
    <WorkspaceShell session={session} eyebrow="Candidate" title="Payment History" metrics={[]}>
      <DataTable
        title="Transfer & Payment History"
        description="Payout rows linked to your candidate account. Paid status, amounts, and payment dates are from the imported production data."
        rowHref={(row) => `/candidate/payments/${row.id}` as unknown as Route}
        rows={rows}
        columns={[
          { key: "company", label: "Company / Store", render: (row) => <strong>{row.company}</strong> },
          { key: "period", label: "Period", render: (row) => row.period },
          { key: "hours", label: "Hours", render: (row) => row.hours },
          { key: "candidateTotal", label: "Your Total", render: (row) => row.candidateTotal },
          { key: "companyTotal", label: "Company Total", render: (row) => row.companyTotal },
          { key: "cost", label: "Transfer Cost", render: (row) => row.cost },
          { key: "paid", label: "Paid", render: (row) => row.paid },
          { key: "paymentDate", label: "Payment Date", render: (row) => row.paymentDate },
          { key: "updated", label: "Updated", render: (row) => row.updated },
        ]}
      />
    </WorkspaceShell>
  );
}
