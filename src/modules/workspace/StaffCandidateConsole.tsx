import type { Route } from "next";
import Link from "next/link";
import { HubShortcuts, type HubCommand } from "@/modules/hub/HubShortcuts";
import type { StaffCandidateDirectoryRow, StaffCandidateFilter, getStaffCandidateConsole } from "./data";

type StaffCandidateConsoleData = Awaited<ReturnType<typeof getStaffCandidateConsole>>;

type FilterOption = {
  label: string;
  value: StaffCandidateFilter;
};

export function StaffCandidateConsole({
  data,
  query,
  filter,
  filters
}: {
  data: StaffCandidateConsoleData;
  query: string;
  filter: StaffCandidateFilter;
  filters: FilterOption[];
}) {
  const selected = data.selected?.candidate;
  const selectedFlags = selected
    ? [
        selected.approved === 0 ? "Needs review" : "Approved",
        selected.candidate_status === 10 ? "Active" : `Status ${selected.candidate_status}`,
        selected.is_incomplete_profile ? "Incomplete profile" : null,
        selected.candidate_civil_need_verification ? "Civil ID review" : null
      ].filter((flag): flag is string => Boolean(flag))
    : [];
  const commands = buildCandidateCommands(data, query, filter);

  return (
    <>
      <section className="studentOSWorkflowGrid" aria-label="StudentHub workflows">
        {data.staffOS.workflows.map((workflow) => (
          <article className="studentOSWorkflow" id={workflow.id} key={workflow.id}>
            <div className="studentOSWorkflowHeader">
              <div>
                <span>{workflow.subtitle}</span>
                <h2>{workflow.title}</h2>
              </div>
              <strong>{workflow.metric.toLocaleString("en-US")}</strong>
            </div>
            <div className="studentOSWorkflowRows">
              {workflow.rows.length ? (
                workflow.rows.slice(0, 3).map((row) => {
                  const rowHref = "href" in row ? row.href : undefined;
                  return rowHref ? (
                    <Link className="studentOSWorkflowRow" href={rowHref as Route} key={row.id}>
                      <strong>{row.title}</strong>
                      <span>{row.subtitle}</span>
                      <small>{row.meta}</small>
                    </Link>
                  ) : (
                    <div className="studentOSWorkflowRow" key={row.id}>
                      <strong>{row.title}</strong>
                      <span>{row.subtitle}</span>
                      <small>{row.meta}</small>
                    </div>
                  );
                })
              ) : (
                <div className="studentOSWorkflowEmpty">
                  <strong>No scoped rows</strong>
                  <span>This module is imported, but this staff login has no matching rows yet.</span>
                </div>
              )}
            </div>
            <Link className="studentOSWorkflowAction" href={workflow.href as Route}>
              Open workflow
            </Link>
          </article>
        ))}
      </section>

      <section className="opsStatBar" aria-label="Candidate metrics">
        {data.staffOS.quickStats.map((metric) => (
          <div className="opsStat" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{typeof metric.value === "number" ? metric.value.toLocaleString("en-US") : metric.value}</strong>
            <small>{metric.note}</small>
          </div>
        ))}
      </section>

      <section className="opsToolbar">
        <form className="opsSearch" id="candidate-search">
          <label>
            Candidate search
            <input
              data-command-search
              name="q"
              placeholder="Name, email, phone, candidate ID"
              defaultValue={query}
            />
          </label>
          <input type="hidden" name="filter" value={filter} />
          {data.selectedId ? <input type="hidden" name="candidate" value={data.selectedId} /> : null}
          <button type="submit">Search</button>
        </form>
        <HubShortcuts commands={commands} />
      </section>

      <nav className="filterRail opsFilters" aria-label="Candidate filters">
        {filters.map((item) => (
          <Link className={item.value === filter ? "active" : ""} href={filterHref(item.value, query)} key={item.value}>
            {item.label}
          </Link>
        ))}
      </nav>

      <section className="opsLanes" aria-label="Candidate operating queues">
        {data.lanes.map((lane) => (
          <article className="opsLane" key={lane.id}>
            <div className="opsLaneHeader">
              <div>
                <h2>{lane.title}</h2>
                <p>{lane.note}</p>
              </div>
              <span>{lane.rows.length}</span>
            </div>
            <div className="opsLaneCards">
              {lane.rows.length ? (
                lane.rows.map((row) => (
                  <CandidateQueueCard
                    filter={filter}
                    isSelected={row.id === data.selectedId}
                    key={`${lane.id}-${row.id}`}
                    query={query}
                    row={row}
                  />
                ))
              ) : (
                <div className="opsEmpty">
                  <strong>Clear</strong>
                  <span>No matching candidates in this queue.</span>
                </div>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="candidateOpsGrid">
        <article className="opsRecord">
          {selected && data.selected ? (
            <>
              <div className="opsRecordHeader">
                <div>
                  <span>{selected.candidate_uid ?? `#${selected.candidate_id}`}</span>
                  <h2>{selected.candidate_name}</h2>
                  <p>{selected.candidate_email}</p>
                </div>
                <div className="candidateActions">
                  <Link href={`/staff/candidates/${selected.candidate_id}` as Route}>Open record</Link>
                  {selected.candidate_email ? <a href={`mailto:${selected.candidate_email}`}>Email</a> : null}
                  {selected.candidate_phone ? <a href={`tel:${selected.candidate_phone}`}>Call</a> : null}
                </div>
              </div>

              <div className="statusPills opsStatusPills">
                {selectedFlags.map((flag) => (
                  <span key={flag}>{flag}</span>
                ))}
              </div>

              <div className="opsFactStrip">
                <Fact label="Country" value={selected.country?.country_name_en ?? "Not set"} />
                <Fact label="University" value={selected.university?.university_name_en ?? "Not set"} />
                <Fact label="Rate" value={data.selected.metrics[1]?.value ?? "0"} />
                <Fact label="Updated" value={selected.candidate_updated_at ? selected.candidate_updated_at.toLocaleDateString("en-US") : "Not set"} />
              </div>

              <section className="opsActionPanel">
                <div className="opsPanelHeader">
                  <h2>Next best actions</h2>
                  <span>{data.actionPlan.length}</span>
                </div>
                <div className="opsActionList">
                  {data.actionPlan.map((action) => (
                    <div className="opsAction" key={action.title}>
                      <span>{action.priority}</span>
                      <strong>{action.title}</strong>
                      <p>{action.subtitle}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="opsRecordSections">
                <RecordSection title="Invitations" rows={data.selected.invitations} />
                <RecordSection title="Work logs" rows={data.selected.workHours} />
                <RecordSection title="Assignments" rows={data.selected.histories} />
                <RecordSection title="Notes" rows={data.selected.notes} />
                <RecordSection title="Skills" rows={data.selected.skills} />
                <RecordSection title="Warnings" rows={data.selected.warnings} />
              </section>
            </>
          ) : (
            <div className="opsNoSelection">
              <strong>No candidate record selected</strong>
              <span>
                This staff login has no candidates in the current filter. Use the workflow cards above to keep working in requests,
                time, pay, invoices, or ID cards without landing on an empty page.
              </span>
              <div className="opsNoSelectionActions">
                <Link href="/staff/requests">Open requests</Link>
                <Link href="/hub">Open command hub</Link>
              </div>
            </div>
          )}
        </article>

        <aside className="opsSidePanel">
          <section className="opsActivityPanel">
            <div className="opsPanelHeader">
              <h2>Activity stream</h2>
              <span>{data.activity.length}</span>
            </div>
            <div className="opsActivityList">
              {data.activity.length ? (
                data.activity.map((item) => (
                  <Link className="opsActivityItem" href={item.href as Route} key={`${item.type}-${item.id}`}>
                    <span>{item.type}</span>
                    <strong>{item.title}</strong>
                    <small>{item.subtitle}</small>
                    <em>{item.meta}</em>
                  </Link>
                ))
              ) : (
                <div className="opsEmpty">
                  <strong>No recent activity</strong>
                  <span>No work logs, invitations, appeals, or warnings in this filtered slice.</span>
                </div>
              )}
            </div>
          </section>

          {data.selected ? (
            <section className="opsActivityPanel">
              <div className="opsPanelHeader">
                <h2>Profile surface</h2>
                <span>6</span>
              </div>
              <div className="opsCoverageGrid">
                <Fact label="Links" value={data.selected.links.length} />
                <Fact label="Tags" value={data.selected.tags.length} />
                <Fact label="ID cards" value={data.selected.idCards.length} />
                <Fact label="Warnings" value={data.selected.warnings.length} />
                <Fact label="Invites" value={data.selected.invitations.length} />
                <Fact label="Work logs" value={data.selected.workHours.length} />
              </div>
            </section>
          ) : (
            <section className="opsActivityPanel">
              <div className="opsPanelHeader">
                <h2>Access context</h2>
                <span>{data.rows.length}</span>
              </div>
              <div className="opsEmpty">
                <strong>Scoped staff login</strong>
                <span>
                  Candidate records are limited to this staff account. Requests, time logs, payout rows, invoices, and ID queues
                  remain visible as workflow entry points when candidate assignments are empty.
                </span>
              </div>
            </section>
          )}
        </aside>
      </section>
    </>
  );
}

function CandidateQueueCard({
  row,
  query,
  filter,
  isSelected
}: {
  row: StaffCandidateDirectoryRow;
  query: string;
  filter: StaffCandidateFilter;
  isSelected: boolean;
}) {
  return (
    <Link className={isSelected ? "opsCandidateCard active" : "opsCandidateCard"} href={candidateHref(row.id, query, filter)}>
      <span>{row.signal}</span>
      <strong>{row.name}</strong>
      <small>{row.uid}</small>
      <div className="opsCardMeta">
        <span>{row.company}</span>
        <span>{row.store}</span>
      </div>
      <div className="opsCardFooter">
        <em>{row.updated}</em>
        <strong>{row.status}</strong>
      </div>
      {row.flags.length ? (
        <div className="opsMiniPills">
          {row.flags.slice(0, 3).map((flag) => (
            <span key={flag}>{flag}</span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}

function RecordSection({
  title,
  rows
}: {
  title: string;
  rows: { id: string | number; title: string; subtitle: string; meta?: string; href?: string }[];
}) {
  return (
    <section className="opsRecordSection">
      <div className="opsPanelHeader">
        <h2>{title}</h2>
        <span>{rows.length}</span>
      </div>
      <div className="opsRecordRows">
        {rows.length ? (
          rows.slice(0, 5).map((row) => (
            <article className="opsRecordRow" key={row.id}>
              <div>
                {row.href ? (
                  <Link href={row.href as Route}>
                    <strong>{row.title}</strong>
                  </Link>
                ) : (
                  <strong>{row.title}</strong>
                )}
                <span>{row.subtitle}</span>
              </div>
              {row.meta ? <em>{row.meta}</em> : null}
            </article>
          ))
        ) : (
          <div className="opsEmpty slim">
            <strong>None</strong>
            <span>No imported rows.</span>
          </div>
        )}
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="opsFact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function buildCandidateCommands(data: StaffCandidateConsoleData, query: string, filter: StaffCandidateFilter): HubCommand[] {
  return [
    { id: "staff-overview", title: "Staff overview", subtitle: "Open staff home", section: "Navigation", href: "/staff", shortcut: "g o" },
    { id: "staff-requests", title: "My requests", subtitle: "Open assigned request pipeline", section: "Navigation", href: "/staff/requests", shortcut: "g r" },
    { id: "candidate-search", title: "Candidate search", subtitle: "Focus the candidate search field", section: "Page", href: "#candidate-search", shortcut: "/" },
    ...data.staffOS.workflows.map((workflow) => ({
      id: `workflow-${workflow.id}`,
      title: workflow.title,
      subtitle: workflow.subtitle,
      section: "Workflows",
      href: workflow.href
    })),
    ...data.lanes.map((lane) => ({
      id: `lane-${lane.id}`,
      title: lane.title,
      subtitle: `${lane.rows.length} candidates`,
      section: "Queues",
      href: filterHref(lane.id === "active" ? "active" : lane.id === "decision" ? "needs-review" : "all", query)
    })),
    ...data.rows.slice(0, 12).map((row) => ({
      id: `candidate-${row.id}`,
      title: row.name,
      subtitle: `${row.company} · ${row.signal}`,
      section: "Candidates",
      href: candidateHref(row.id, query, filter)
    }))
  ];
}

function candidateHref(id: number, query: string, filter: StaffCandidateFilter) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (filter !== "all") params.set("filter", filter);
  params.set("candidate", String(id));
  return `/staff/candidates?${params.toString()}` as Route;
}

function filterHref(filter: StaffCandidateFilter, query: string) {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("filter", filter);
  if (query.trim()) params.set("q", query.trim());
  const suffix = params.toString();
  return (suffix ? `/staff/candidates?${suffix}` : "/staff/candidates") as Route;
}
