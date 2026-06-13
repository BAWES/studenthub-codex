"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { InitiateTransferForm } from "@/modules/balances/InitiateTransferForm";
import type { SessionUser } from "@/modules/auth/types";

type Row = {
  id: string | number;
  company: string;
  period: string;
  hours: string | number;
  candidateTotal: string;
  companyTotal: string;
  cost: string;
  paid: string;
  paymentDate: string;
  updated: string;
};

type Props = {
  session: SessionUser;
  rows: Row[];
};

export function CandidatePaymentsTable({ session, rows }: Props) {
  return (
    <WorkspaceShell session={session} eyebrow="Candidate" title="Payment History" metrics={[]}>
      <DataTable
        title="Transfer & Payment History"
        description="Payout rows linked to your candidate account. Paid status, amounts, and payment dates are from the imported production data."
        rowHref="/candidate/payments/"
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
      <InitiateTransferForm />
    </WorkspaceShell>
  );
}
