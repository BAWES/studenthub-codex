"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { Route } from "next";
import Link from "next/link";
import type { SessionUser } from "@/modules/auth/types";

type Row = {
  id: number;
  company: string;
  period: string;
  status: string;
  total: string | null;
};

type Props = {
  session: SessionUser;
  rows: Row[];
  latest: Row | undefined;
  loading?: boolean;
};

const steps = [
  { step: "1", title: "Review run", note: "Check company, period, total, and status." },
  { step: "2", title: "Check payouts", note: "Inspect candidate rows before payment." },
  { step: "3", title: "Issue invoice", note: "Generate employer invoice PDF from the same source." },
  { step: "4", title: "Reconcile", note: "Mark what is paid, exported, or needs correction." },
] as const;

export function AdminTransfersTable({ session, rows, latest, loading }: Props) {
  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin finance"
      title="Pay candidates and invoice companies from transfer runs."
      metrics={[
        { label: "Runs shown", value: rows.length, note: "Latest imported transfer batches" },
        { label: "Latest run", value: latest ? `#${latest.id}` : "None", note: latest?.company ?? "No transfer rows found" },
        { label: "Invoice source", value: "Transfers", note: "Candidate payouts and employer totals live here" },
        { label: "Next action", value: "Review", note: "Open a run before exporting PDFs or reconciling pay" },
      ]}
    >
      <section
        className="grid grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] gap-3"
        aria-label="Finance workflow"
      >
        <div className="rounded-lg border border-border bg-card p-[18px] grid content-start gap-2.5">
          <span className="text-primary text-[11px] font-black uppercase tracking-wider">Finance path</span>
          <h2 className="max-w-[620px] text-[26px] leading-[1.08] m-0 text-foreground">
            Start with a transfer run. Everything else should hang off that.
          </h2>
          <p className="max-w-[640px] text-muted-foreground leading-relaxed m-0">
            A run is the place to inspect candidate payouts, employer charges, period dates, status, invoice context,
            and PDF exports. The table below is only the index.
          </p>
          {latest ? (
            <Button variant="default" size="sm" className="w-fit" asChild>
              <Link href={`/admin/transfers/${latest.id}` as Route}>
                Open latest run #{latest.id}
                <ArrowRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="rounded-lg border border-border bg-card grid grid-cols-2 overflow-hidden">
          {steps.map(({ step, title, note }, i) => (
            <article
              key={step}
              className={`grid content-center gap-1.5 p-3.5 min-h-[118px] ${
                i % 2 === 0 ? "border-r border-border" : ""
              } ${i < 2 ? "border-b border-border" : ""}`}
            >
              <span className="text-primary text-[11px] font-black uppercase tracking-wider">{step}</span>
              <strong className="text-foreground text-[17px] font-bold">{title}</strong>
              <small className="text-muted-foreground leading-relaxed">{note}</small>
            </article>
          ))}
        </div>
      </section>

      <DataTable
        title="Transfer Runs"
        description="Open a run to review candidate payouts, employer totals, invoices, and supporting PDF actions."
        rows={rows}
        rowHref={(row) => `/admin/transfers/${row.id}` as Route}
        loading={loading}
        columns={[
          { key: "id", label: "Transfer", render: (row) => <strong>#{row.id}</strong> },
          { key: "company", label: "Company", render: (row) => row.company },
          { key: "period", label: "Period", render: (row) => row.period },
          { key: "status", label: "Status", render: (row) => row.status },
          { key: "total", label: "Total", render: (row) => row.total ?? "—" },
        ]}
      />
    </WorkspaceShell>
  );
}
