import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Clock3, FileText, Search, Users } from "lucide-react";
import type { getStaffWorkspace } from "@/modules/workspace/data";

type StaffWorkspaceData = Awaited<ReturnType<typeof getStaffWorkspace>>;

export function StaffHome({ data }: { data: StaffWorkspaceData }) {
  const productionCandidates = data.metrics.find((metric) => metric.label === "Candidates")?.value ?? 0;
  const assignedRequests = data.metrics.find((metric) => metric.label === "Assigned Requests")?.value ?? 0;

  const workflows = [
    {
      title: "Find candidates",
      subtitle: "Search all imported production candidates, then narrow to assigned records when needed.",
      href: "/staff/candidates",
      icon: Search,
      metric: productionCandidates
    },
    {
      title: "Work requests",
      subtitle: "Open assigned employer demand, review matches, suggestions, interviews, and shortlists.",
      href: "/staff/requests",
      icon: BriefcaseBusiness,
      metric: assignedRequests
    },
    {
      title: "Time and pay",
      subtitle: "Use candidate profiles to inspect work logs, appeals, transfer rows, and unpaid context.",
      href: "/staff/candidates#time",
      icon: Clock3,
      metric: "Live"
    },
    {
      title: "Documents",
      subtitle: "Candidate CVs, profile links, civil ID records, certificates, and PDF/export work belong here.",
      href: "/staff/candidates#documents",
      icon: FileText,
      metric: "Next"
    }
  ];

  return (
    <section className="staffHome">
      <section className="staffHomeHero">
        <div>
          <span>Staff operating home</span>
          <h2>Start with the work, not the database.</h2>
          <p>
            Search production candidates, open a profile, move into request fulfillment, and keep time/pay/document context
            attached to the same person.
          </p>
          <div className="staffHomeActions">
            <Link className="primary" href="/staff/candidates">
              <Users aria-hidden="true" size={16} />
              Search candidates
            </Link>
            <Link href="/staff/requests">
              <BriefcaseBusiness aria-hidden="true" size={16} />
              Open requests
            </Link>
          </div>
        </div>
        <aside>
          <span>Production data loaded</span>
          <strong>{Number(productionCandidates).toLocaleString("en-US")}</strong>
          <small>Candidates available to search from the imported database.</small>
        </aside>
      </section>

      <section className="staffHomeGrid" aria-label="Staff workflows">
        {workflows.map((workflow) => {
          const Icon = workflow.icon;
          return (
            <Link href={workflow.href as Route} key={workflow.title}>
              <div>
                <Icon aria-hidden="true" size={18} />
                <span>{workflow.metric.toLocaleString("en-US")}</span>
              </div>
              <strong>{workflow.title}</strong>
              <small>{workflow.subtitle}</small>
              <em>
                Open <ArrowRight aria-hidden="true" size={14} />
              </em>
            </Link>
          );
        })}
      </section>

      <section className="staffHomeRows">
        <StaffRows title="Recent requests" rows={data.requests} empty="No assigned requests for this staff login yet." />
        <StaffRows title="Recent stories" rows={data.stories} empty="No stories connected to this staff login yet." />
      </section>
    </section>
  );
}

function StaffRows({
  title,
  rows,
  empty
}: {
  title: string;
  rows: { id: string | number; title: string; subtitle: string; meta?: string; href?: string }[];
  empty: string;
}) {
  return (
    <section className="staffHomePanel">
      <div>
        <span>{title}</span>
        <strong>{rows.length}</strong>
      </div>
      {rows.map((row) =>
        row.href ? (
          <Link href={row.href as Route} key={row.id}>
            <strong>{row.title}</strong>
            <span>{row.subtitle}</span>
            {row.meta ? <small>{row.meta}</small> : null}
          </Link>
        ) : (
          <article key={row.id}>
            <strong>{row.title}</strong>
            <span>{row.subtitle}</span>
            {row.meta ? <small>{row.meta}</small> : null}
          </article>
        )
      )}
      {!rows.length ? <p>{empty}</p> : null}
    </section>
  );
}
