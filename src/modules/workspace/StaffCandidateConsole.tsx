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
    <section className="linearDesk">
      <section className="linearFocus">
        <div>
          <span>Candidate desk</span>
          <h2>Pick a queue, preview the person, take the next action.</h2>
          <p>
            Staff should not need to understand the database to move work forward. This desk keeps requests, matching,
            profile cleanup, CV/PDF prep, time, pay, invoices, and ID cards in one operating flow.
          </p>
        </div>
        <div className="linearFocusTools">
          <form className="linearSearch" id="candidate-search">
            <input data-command-search name="q" placeholder="Search candidates, email, phone, ID" defaultValue={query} />
            <input type="hidden" name="filter" value={filter} />
            {data.selectedId ? <input type="hidden" name="candidate" value={data.selectedId} /> : null}
            <button type="submit">Search</button>
          </form>
          <HubShortcuts commands={commands} />
        </div>
      </section>

      <nav className="linearWorkflowDock" aria-label="Staff workflows">
        {data.staffOS.workflows.map((workflow) => (
          <Link href={workflow.href as Route} key={workflow.id}>
            <span>{workflow.title}</span>
            <strong>{workflow.metric.toLocaleString("en-US")}</strong>
            <small>{workflow.subtitle}</small>
          </Link>
        ))}
      </nav>

      <nav className="linearFilters" aria-label="Candidate filters">
        {filters.map((item) => (
          <Link className={item.value === filter ? "active" : ""} href={filterHref(item.value, query)} key={item.value}>
            {item.label}
          </Link>
        ))}
      </nav>

      <section className="linearSplit">
        <section className="linearBoard" aria-label="Candidate queues">
          <div className="linearBoardHeader">
            <div>
              <span>Board</span>
              <h2>{query ? `Results for ${query}` : "Candidate queues"}</h2>
            </div>
            <small>{data.rows.length.toLocaleString("en-US")} visible to this staff login</small>
          </div>
          <div className="linearLanes">
            {data.lanes.map((lane) => (
              <article className="linearLane" key={lane.id}>
                <div className="linearLaneHeader">
                  <div>
                    <h3>{lane.title}</h3>
                    <p>{lane.note}</p>
                  </div>
                  <span>{lane.rows.length}</span>
                </div>
                <div className="linearLaneCards">
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
                    <div className="linearEmpty">
                      <strong>Clear</strong>
                      <span>No candidates in this queue.</span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="linearPeek" aria-label="Candidate preview">
          {selected && data.selected ? (
            <>
              <div className="linearPeekHeader">
                <span>{selected.candidate_uid ?? `#${selected.candidate_id}`}</span>
                <h2>{selected.candidate_name}</h2>
                <p>{selected.candidate_email}</p>
              </div>
              <div className="linearPeekActions">
                <Link href={`/staff/candidates/${selected.candidate_id}` as Route}>Open record</Link>
                {selected.candidate_email ? <a href={`mailto:${selected.candidate_email}`}>Email</a> : null}
                {selected.candidate_phone ? <a href={`tel:${selected.candidate_phone}`}>Call</a> : null}
              </div>
              <div className="linearPills">
                {selectedFlags.map((flag) => (
                  <span key={flag}>{flag}</span>
                ))}
              </div>
              <div className="linearPeekFacts">
                <Fact label="Country" value={selected.country?.country_name_en ?? "Not set"} />
                <Fact label="University" value={selected.university?.university_name_en ?? "Not set"} />
                <Fact label="Rate" value={data.selected.metrics[1]?.value ?? "0"} />
                <Fact label="Updated" value={selected.candidate_updated_at ? selected.candidate_updated_at.toLocaleDateString("en-US") : "Not set"} />
              </div>
              <section className="linearNext">
                <div className="linearPanelTitle">
                  <h3>Next actions</h3>
                  <span>{data.actionPlan.length}</span>
                </div>
                {data.actionPlan.map((action) => (
                  <article key={action.title}>
                    <span>{action.priority}</span>
                    <strong>{action.title}</strong>
                    <p>{action.subtitle}</p>
                  </article>
                ))}
              </section>
              <section className="linearRelated">
                <RecordSection title="Invitations" rows={data.selected.invitations} />
                <RecordSection title="Work logs" rows={data.selected.workHours} />
                <RecordSection title="Notes" rows={data.selected.notes} />
              </section>
            </>
          ) : (
            <div className="linearEmpty large">
              <strong>No candidate selected</strong>
              <span>Choose a card from a queue, search by name, or jump to requests.</span>
              <Link href="/staff/requests">Open requests</Link>
            </div>
          )}
        </aside>
      </section>

      <section className="linearActivityGrid" aria-label="Activity and production data">
        <section className="linearPanel">
          <div className="linearPanelTitle">
            <h3>Recent activity</h3>
            <span>{data.activity.length}</span>
          </div>
          <div className="linearActivityList">
            {data.activity.slice(0, 8).map((item) => (
              <Link href={item.href as Route} key={`${item.type}-${item.id}`}>
                <span>{item.type}</span>
                <strong>{item.title}</strong>
                <small>{item.subtitle}</small>
              </Link>
            ))}
          </div>
        </section>
        <section className="linearPanel">
          <div className="linearPanelTitle">
            <h3>Imported production estate</h3>
            <span>{data.staffOS.estate.length}</span>
          </div>
          <div className="linearEstate">
            {data.staffOS.estate.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value.toLocaleString("en-US")}</strong>
                <small>{item.note}</small>
              </div>
            ))}
          </div>
        </section>
      </section>
    </section>
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
    <Link className={isSelected ? "linearCandidateCard active" : "linearCandidateCard"} href={candidateHref(row.id, query, filter)}>
      <div className="linearCardTop">
        <span>{row.signal}</span>
        <em>{row.status}</em>
      </div>
      <strong>{row.name}</strong>
      <small>{row.email}</small>
      <div className="linearCardMeta">
        <span>{row.company}</span>
        <span>{row.store}</span>
      </div>
      <div className="linearCardFooter">
        <em>{row.updated}</em>
        <strong>{row.rate}</strong>
      </div>
      {row.flags.length ? (
        <div className="linearMiniPills">
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
    <section className="linearRecordSection">
      <div className="linearPanelTitle">
        <h2>{title}</h2>
        <span>{rows.length}</span>
      </div>
      <div className="linearRecordRows">
        {rows.length ? (
          rows.slice(0, 5).map((row) => (
            <article className="linearRecordRow" key={row.id}>
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
          <div className="linearEmpty slim">
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
    <div className="linearFact">
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
