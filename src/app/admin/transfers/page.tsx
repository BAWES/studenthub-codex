import type { Route } from "next";
import Link from "next/link";
import { requireRole } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getAdminTransferRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function AdminTransfersPage() {
  const session = await requireRole("admin");
  const rows = await getAdminTransferRows();
  const latest = rows[0];

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin finance"
      title="Pay candidates and invoice companies from transfer runs."
      metrics={[
        { label: "Runs shown", value: rows.length, note: "Latest imported transfer batches" },
        { label: "Latest run", value: latest ? `#${latest.id}` : "None", note: latest?.company ?? "No transfer rows found" },
        { label: "Invoice source", value: "Transfers", note: "Candidate payouts and employer totals live here" },
        { label: "Next action", value: "Review", note: "Open a run before exporting PDFs or reconciling pay" }
      ]}
    >
      <section className="financeStart" aria-label="Finance workflow">
        <div className="financePrimary">
          <span>Finance path</span>
          <h2>Start with a transfer run. Everything else should hang off that.</h2>
          <p>
            A run is the place to inspect candidate payouts, employer charges, period dates, status, invoice context,
            and PDF exports. The table below is only the index.
          </p>
          {latest ? <Link href={`/admin/transfers/${latest.id}` as Route}>Open latest run #{latest.id}</Link> : null}
        </div>
        <div className="financeSteps">
          {[
            ["1", "Review run", "Check company, period, total, and status."],
            ["2", "Check payouts", "Inspect candidate rows before payment."],
            ["3", "Issue invoice", "Generate employer invoice PDF from the same source."],
            ["4", "Reconcile", "Mark what is paid, exported, or needs correction."]
          ].map(([step, title, note]) => (
            <article key={step}>
              <span>{step}</span>
              <strong>{title}</strong>
              <small>{note}</small>
            </article>
          ))}
        </div>
      </section>
      <DataTable
        title="Transfer Runs"
        description="Open a run to review candidate payouts, employer totals, invoices, and supporting PDF actions."
        rows={rows}
        rowHref={(row) => `/admin/transfers/${row.id}` as Route}
        columns={[
          { key: "id", label: "Transfer", render: (row) => <strong>#{row.id}</strong> },
          { key: "company", label: "Company", render: (row) => row.company },
          { key: "period", label: "Period", render: (row) => row.period },
          { key: "status", label: "Status", render: (row) => row.status },
          { key: "total", label: "Total", render: (row) => row.total }
        ]}
      />
    </WorkspaceShell>
  );
}
