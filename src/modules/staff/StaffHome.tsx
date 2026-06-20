"use client";

import type { Route } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Clock3,
  FileText,
  Search,
} from "lucide-react";
import { EmptyState } from "@/modules/workspace/EmptyState";
import type { getStaffWorkspace } from "@/app/staff/actions";
import { Button } from "@/components/ui/button";

type StaffWorkspaceData = Awaited<ReturnType<typeof getStaffWorkspace>>;

export function StaffHome({ data }: { data: StaffWorkspaceData }) {
  const productionCandidates =
    data.metrics.find((metric) => metric.label === "Candidates")?.value ?? 0;
  const assignedRequests =
    data.metrics.find((metric) => metric.label === "Assigned Requests")
      ?.value ?? 0;

  const workflows = [
    {
      title: "Find candidates",
      subtitle:
        "Search all imported production candidates, then narrow to assigned records when needed.",
      href: "/staff/candidates",
      icon: Search,
      metric: Number(productionCandidates).toLocaleString("en-US"),
      accent: "text-[#0b63ce]",
    },
    {
      title: "Work requests",
      subtitle:
        "Open assigned employer demand, review matches, suggestions, interviews, and shortlists.",
      href: "/staff/requests",
      icon: BriefcaseBusiness,
      metric: Number(assignedRequests).toLocaleString("en-US"),
      accent: "text-[#24835b]",
    },
    {
      title: "Time and pay",
      subtitle:
        "Use candidate profiles to inspect work logs, appeals, transfer rows, and unpaid context.",
      href: "/staff/candidates#time",
      icon: Clock3,
      metric: "Live",
      accent: "text-[#a66212]",
    },
    {
      title: "Documents",
      subtitle:
        "Candidate CVs, profile links, civil ID records, certificates, and PDF/export work belong here.",
      href: "/staff/candidates#documents",
      icon: FileText,
      metric: "Next",
      accent: "text-[#0b63ce]",
    },
  ] as const;

  return (
    <section className="grid gap-3">
      {/* ── Hero: Welcome + Data Overview ────────────────────── */}
      <div
        className="rounded-lg border border-border bg-card shadow-sm grid grid-cols-[minmax(0,1fr)_minmax(200px,280px)] gap-5 p-5 max-md:grid-cols-1 max-md:gap-4"
        style={{ animation: "shPageHeaderIn 360ms cubic-bezier(0.16, 1, 0.3, 1) both" }}
      >
        <div className="grid content-center gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#0b63ce]">
            Staff operating home
          </span>
          <h2 className="m-0 text-[20px] font-semibold leading-[1.2] tracking-[-0.01em] text-foreground">
            Start with the work, not the database.
          </h2>
          <p className="m-0 text-[13px] leading-relaxed max-w-[520px] text-muted-foreground">
            Search production candidates, open a profile, move into request
            fulfillment, and keep time/pay/document context attached to the same
            person.
          </p>
          <div className="flex flex-wrap items-center gap-2.5 mt-1">
            <Button asChild size="sm">
              <Link href="/staff/candidates">
                <Search size={14} aria-hidden="true" />
                Search candidates
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/staff/requests">
                <BriefcaseBusiness size={14} aria-hidden="true" />
                Open requests
              </Link>
            </Button>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card grid content-center gap-1.5 p-4 text-center max-md:flex max-md:items-center max-md:gap-3 max-md:text-left">
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
            Production data loaded
          </span>
          <strong className="block text-[32px] leading-[1] font-bold tracking-[-0.02em] text-foreground">
            {Number(productionCandidates).toLocaleString("en-US")}
          </strong>
          <small className="text-[11px] leading-relaxed text-muted-foreground">
            Candidates available to search from the imported database.
          </small>
        </div>
      </div>

      {/* ── Workflow cards ───────────────────────────────────── */}
      <section
        className="grid grid-cols-2 gap-2.5 max-sm:grid-cols-1"
        aria-label="Staff workflows"
      >
        {workflows.map((workflow, i) => {
          const Icon = workflow.icon;
          return (
            <Link
              href={workflow.href as Route}
              key={workflow.title}
              className="group no-underline"
              style={{ animation: `shPageHeaderIn 360ms cubic-bezier(0.16, 1, 0.3, 1) both`, animationDelay: `${Math.min((i + 1) * 80, 480)}ms` }}
            >
              <div className="rounded-lg border border-border bg-card h-full transition-all duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:shadow-[0_16px_45px_rgba(16,24,40,0.1)] cursor-pointer">
                <div className="grid gap-2.5 p-4">
                  {/* Icon + metric row */}
                  <div className="flex items-center justify-between">
                    <div className="size-9 rounded-[10px] inline-flex items-center justify-center text-[#0b63ce] bg-card border border-border">
                      <Icon size={16} aria-hidden="true" />
                    </div>
                    <span className={`text-[13px] font-semibold ${workflow.accent}`}>
                      {workflow.metric}
                    </span>
                  </div>
                  {/* Title + subtitle */}
                  <div className="grid gap-1">
                    <strong className="text-[14px] font-semibold leading-[1.2] text-foreground">
                      {workflow.title}
                    </strong>
                    <p className="m-0 text-[12px] leading-relaxed text-muted-foreground">
                      {workflow.subtitle}
                    </p>
                  </div>
                  {/* CTA */}
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#0b63ce]">
                    Open
                    <ArrowRight
                      size={13}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      {/* ── Data rows ────────────────────────────────────────── */}
      <div
        className="grid grid-cols-2 gap-2.5 max-md:grid-cols-1 max-sm:grid-cols-1"
        style={{ animation: "shPageHeaderIn 360ms cubic-bezier(0.16, 1, 0.3, 1) both", animationDelay: "400ms" }}
      >
        <StaffPanel
          title="Recent requests"
          rows={data.requests}
          empty="No assigned requests for this staff login yet."
        />
        <StaffPanel
          title="Recent stories"
          rows={data.stories}
          empty="No stories connected to this staff login yet."
        />
      </div>
    </section>
  );
}

// ── Staff data panel ────────────────────────────────────────

function StaffPanel({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: {
    id: string | number;
    title: string;
    subtitle: string;
    meta?: string;
    href?: string;
  }[];
  empty: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2 border-b border-border">
        <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#0b63ce]">
          {title}
        </span>
        <span className="bg-[var(--sh-info-bg)] text-[#0b63ce] text-[12px] font-semibold px-2 py-0.5 rounded-full">
          {rows.length}
        </span>
      </div>

      {/* Rows */}
      <div className="grid divide-y divide-border">
        {rows.length ? (
          rows.map((row) =>
            row.href ? (
              <Link
                href={row.href as Route}
                key={row.id}
                className="grid grid-cols-[1fr_auto] gap-3 px-3.5 py-3 bg-card no-underline transition-all duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-muted hover:translate-x-1 border-0"
              >
                <div>
                  <strong className="text-[13px] font-medium text-foreground">
                    {row.title}
                  </strong>
                  <p className="m-0 text-[12px] text-muted-foreground mt-0.5">
                    {row.subtitle}
                  </p>
                </div>
                {row.meta ? (
                  <span className="text-[11px] text-muted-foreground/70 text-right">
                    {row.meta}
                  </span>
                ) : null}
              </Link>
            ) : (
              <article
                key={row.id}
                className="grid grid-cols-[1fr_auto] gap-3 px-3.5 py-3 bg-card border-0"
              >
                <div>
                  <strong className="text-[13px] font-medium text-foreground">
                    {row.title}
                  </strong>
                  <p className="m-0 text-[12px] text-muted-foreground mt-0.5">
                    {row.subtitle}
                  </p>
                </div>
                {row.meta ? (
                  <span className="text-[11px] text-muted-foreground/70 text-right">
                    {row.meta}
                  </span>
                ) : null}
              </article>
            ),
          )
        ) : (
          <div className="p-4">
            <EmptyState variant="empty" message={empty} />
          </div>
        )}
      </div>
    </div>
  );
}
