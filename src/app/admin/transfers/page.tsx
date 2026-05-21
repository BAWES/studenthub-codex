import type { Route } from "next";
import Link from "next/link";
import { requireRoleCapability } from "@/modules/auth/session";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getAdminTransferRows } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

export default async function AdminTransfersPage() {
  const session = await requireRoleCapability("admin", "finance.read");
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
      <section className="grid grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] gap-3 max-[1040px]:grid-cols-1" aria-label="Finance workflow">
        <div className="grid content-start gap-2.5 p-[18px] border border-[#dfe4ed] rounded-lg bg-white dark:border-[var(--line)] dark:bg-[var(--surface)] dark:text-[var(--ink)]">
          <span className="text-[var(--blue)] text-[11px] font-black uppercase">Finance path</span>
          <h2 className="max-w-[620px] text-[26px] leading-[1.08] mb-0">Start with a transfer run. Everything else should hang off that.</h2>
          <p className="max-w-[640px] text-[var(--muted)] leading-[1.5] mb-0">
            A run is the place to inspect candidate payouts, employer charges, period dates, status, invoice context,
            and PDF exports. The table below is only the index.
          </p>
          {latest ? <Link className="w-fit min-h-10 inline-flex items-center rounded-lg bg-[#111827] text-white px-[13px] font-black no-underline dark:bg-[#e7ecf5] dark:text-[#090d14]" href={`/admin/transfers/${latest.id}` as Route}>Open latest run #{latest.id}</Link> : null}
        </div>
        <div className="grid grid-cols-2 overflow-hidden border border-[#dfe4ed] rounded-lg bg-white dark:border-[var(--line)] dark:bg-[var(--surface)] dark:text-[var(--ink)]">
          {[
            ["1", "Review run", "Check company, period, total, and status."],
            ["2", "Check payouts", "Inspect candidate rows before payment."],
            ["3", "Issue invoice", "Generate employer invoice PDF from the same source."],
            ["4", "Reconcile", "Mark what is paid, exported, or needs correction."]
          ].map(([step, title, note]) => (
            <article key={step} className="min-w-0 min-h-[118px] grid content-center gap-1.5 border-r border-b border-[#e2e6ee] p-3.5 [&:nth-child(2n)]:border-r-0 [&:nth-last-child(-n+2)]:border-b-0">
              <span className="text-[var(--blue)] text-[11px] font-black uppercase">{step}</span>
              <strong className="text-[#101828] text-[17px] dark:text-[var(--ink)]">{title}</strong>
              <small className="text-[var(--muted)] leading-[1.4]">{note}</small>
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
