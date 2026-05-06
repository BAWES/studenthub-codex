import type { Route } from "next";
import Link from "next/link";
import { HubShortcuts, type HubCommand } from "@/modules/hub/HubShortcuts";
import type {
  CandidateSearchFacet,
  CandidateSearchFilter,
  CandidateSearchParams,
  getCandidateSearchWorkspace
} from "./search";

type CandidateSearchData = Awaited<ReturnType<typeof getCandidateSearchWorkspace>>;

export function CandidateSearchOS({
  data,
  basePath,
  detailPath,
  params
}: {
  data: CandidateSearchData;
  basePath: "/admin/candidates" | "/staff/candidates";
  detailPath: "/admin/candidates" | "/staff/candidates";
  params: CandidateSearchParams;
}) {
  const selected = data.selected?.candidate;
  const commands = buildCandidateSearchCommands(data, basePath, params);

  return (
    <section className="candidateSearchOS">
      <section className="candidateSearchHero">
        <div>
          <span>Candidate intelligence</span>
          <h2>Find the right person, understand the context, act from one place.</h2>
          <p>
            This is the production candidate corpus through a role-scoped search surface. Today it reads from MySQL; the
            interface is already shaped for a dedicated search index.
          </p>
        </div>
        <div className="candidateSearchSource">
          <span>{data.source.current}</span>
          <strong>{data.source.target}</strong>
          <small>{data.source.note}</small>
        </div>
      </section>

      <section className="candidateSearchMetrics" aria-label="Candidate search metrics">
        {data.metrics.map((metric) => (
          <article key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value.toLocaleString("en-US")}</strong>
            <small>{metric.note}</small>
          </article>
        ))}
      </section>

      <section className="candidateSearchToolbar">
        <form className="candidateSearchForm" id="candidate-search">
          <input data-command-search name="q" placeholder="Search name, email, phone, ID, UID, skill, tag" defaultValue={data.query} />
          <input name="filter" type="hidden" value={data.filter} />
          <HiddenFacetInputs data={data} />
          <button type="submit">Search</button>
        </form>
        <HubShortcuts commands={commands} />
      </section>

      <nav className="candidateSearchFilters" aria-label="Candidate search filters">
        {candidateFilterLinks.map((item) => (
          <Link className={item.value === data.filter ? "active" : ""} href={candidateSearchHref(basePath, params, { filter: item.value, candidate: "" })} key={item.value}>
            {item.label}
          </Link>
        ))}
      </nav>

      <section className="candidateSearchGrid">
        <aside className="candidateFacetPanel" aria-label="Candidate facets">
          <div className="candidateFacetHeader">
            <span>Filters</span>
            <Link href={basePath}>Clear all</Link>
          </div>
          {data.facets.map((facet) => (
            <FacetGroup basePath={basePath} facet={facet} key={facet.key} params={params} />
          ))}
        </aside>

        <section className="candidateResultsPanel" aria-label="Candidate search results">
          <div className="candidateResultsHeader">
            <div>
              <span>{data.role} scope</span>
              <strong>{data.query ? `Results for ${data.query}` : "Production candidates"}</strong>
            </div>
            <small>{data.rows.length.toLocaleString("en-US")} shown</small>
          </div>
          {data.selectedBlocked ? (
            <div className="candidateAccessNotice">
              <strong>Candidate unavailable</strong>
              <span>This record is missing, deleted, or outside the candidates visible to this login.</span>
            </div>
          ) : null}
          <div className="candidateResultList">
            {data.rows.map((row) => (
              <Link
                className={row.id === data.selectedId ? "candidateResultCard active" : "candidateResultCard"}
                href={candidateSearchHref(basePath, params, { candidate: String(row.id) })}
                key={row.id}
              >
                <div className="candidateResultTop">
                  <span>{row.signal}</span>
                  <em>{row.status}</em>
                </div>
                <strong>{row.name}</strong>
                <small>{row.email}</small>
                <div className="candidateResultMeta">
                  <span>{row.country}</span>
                  <span>{row.company}</span>
                  <span>{row.updated}</span>
                </div>
                <div className="candidateResultTags">
                  {[...row.flags, ...row.skills].slice(0, 5).map((flag) => (
                    <span key={flag}>{flag}</span>
                  ))}
                </div>
              </Link>
            ))}
            {data.rows.length === 0 ? (
              <div className="candidateEmptyState">
                <strong>No candidates match this search.</strong>
                <span>Remove a facet or search a different name, email, phone, skill, or candidate ID.</span>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="candidatePreviewPanel" aria-label="Candidate preview">
          {selected && data.selected ? (
            <>
              <div className="candidatePreviewHeader">
                <span>{selected.candidate_uid ?? `#${selected.candidate_id}`}</span>
                <h2>{selected.candidate_name}</h2>
                <p>{selected.candidate_email}</p>
              </div>
              <div className="candidatePreviewActions">
                {data.selectedActions.map((action) =>
                  action.href.startsWith("/") ? (
                    <Link href={action.href as Route} key={action.label}>
                      {action.label}
                    </Link>
                  ) : (
                    <a href={action.href} key={action.label}>
                      {action.label}
                    </a>
                  )
                )}
              </div>
              <div className="candidatePreviewFacts">
                <Fact label="Status" value={selected.approved === 0 ? "Needs review" : `Status ${selected.candidate_status}`} />
                <Fact label="Country" value={selected.country?.country_name_en ?? "Not set"} />
                <Fact label="University" value={selected.university?.university_name_en ?? "Not set"} />
                <Fact label="Rate" value={data.selected.metrics[1]?.value ?? "0"} />
              </div>
              <section className="candidatePreviewSection">
                <div className="candidatePreviewSectionHeader">
                  <span>Skills and tags</span>
                  <strong>{data.selected.skills.length + data.selected.tags.length}</strong>
                </div>
                <div className="candidatePreviewPills">
                  {[...data.selected.skills, ...data.selected.tags].slice(0, 14).map((item) => (
                    <span key={`${item.title}-${item.id}`}>{item.title}</span>
                  ))}
                  {!data.selected.skills.length && !data.selected.tags.length ? <small>No skills or tags imported.</small> : null}
                </div>
              </section>
              <RelatedSection rows={data.selected.invitations} title="Invitations" />
              <RelatedSection rows={data.selected.histories} title="Work history" />
              <RelatedSection rows={data.selected.workHours} title="Time logs" />
              <RelatedSection rows={data.selected.notes} title="Notes" />
              <Link className="candidatePreviewFullRecord" href={`${detailPath}/${selected.candidate_id}` as Route}>
                Open complete candidate record
              </Link>
            </>
          ) : (
            <div className="candidateEmptyState large">
              <strong>No candidate selected</strong>
              <span>Choose a candidate from the result list to preview profile, work history, notes, time, and document context.</span>
            </div>
          )}
        </aside>
      </section>
    </section>
  );
}

const candidateFilterLinks: { label: string; value: CandidateSearchFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Needs review", value: "needs-review" },
  { label: "Incomplete", value: "incomplete" },
  { label: "Civil ID", value: "civil-id" }
];

function HiddenFacetInputs({ data }: { data: CandidateSearchData }) {
  return (
    <>
      {data.params.country ? <input name="country" type="hidden" value={data.params.country} /> : null}
      {data.params.university ? <input name="university" type="hidden" value={data.params.university} /> : null}
      {data.params.company ? <input name="company" type="hidden" value={data.params.company} /> : null}
      {data.params.skill ? <input name="skill" type="hidden" value={data.params.skill} /> : null}
    </>
  );
}

function FacetGroup({ basePath, facet, params }: { basePath: "/admin/candidates" | "/staff/candidates"; facet: CandidateSearchFacet; params: CandidateSearchParams }) {
  return (
    <section className="candidateFacetGroup">
      <h3>{facet.label}</h3>
      {facet.options.map((option) => (
        <Link
          className={option.active ? "active" : ""}
          href={candidateSearchHref(basePath, params, { [facet.key]: option.active ? "" : option.value, candidate: "" })}
          key={option.value}
        >
          <span>{option.label}</span>
          <strong>{option.count}</strong>
        </Link>
      ))}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RelatedSection({
  title,
  rows
}: {
  title: string;
  rows: { id: string | number; title: string; subtitle: string; meta?: string; href?: string }[];
}) {
  return (
    <section className="candidatePreviewSection">
      <div className="candidatePreviewSectionHeader">
        <span>{title}</span>
        <strong>{rows.length}</strong>
      </div>
      <div className="candidatePreviewRows">
        {rows.slice(0, 5).map((row) =>
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
        {rows.length === 0 ? <small>No visible imported rows.</small> : null}
      </div>
    </section>
  );
}

function candidateSearchHref(
  basePath: "/admin/candidates" | "/staff/candidates",
  params: CandidateSearchParams,
  overrides: Partial<Record<"q" | "filter" | "candidate" | "country" | "university" | "company" | "skill", string>>
) {
  const next = new URLSearchParams();
  const values = {
    q: params.query ?? "",
    filter: params.filter && params.filter !== "all" ? params.filter : "",
    candidate: params.candidateId ? String(params.candidateId) : "",
    country: params.country ?? "",
    university: params.university ?? "",
    company: params.company ?? "",
    skill: params.skill ?? "",
    ...overrides
  };
  for (const [key, value] of Object.entries(values)) {
    if (value) next.set(key, value);
  }
  const suffix = next.toString();
  return (suffix ? `${basePath}?${suffix}` : basePath) as Route;
}

function buildCandidateSearchCommands(
  data: CandidateSearchData,
  basePath: "/admin/candidates" | "/staff/candidates",
  params: CandidateSearchParams
): HubCommand[] {
  return [
    { id: "candidate-search-focus", title: "Focus candidate search", subtitle: "Search production candidates", section: "Search", href: "#candidate-search", shortcut: "/" },
    { id: "candidate-clear", title: "Clear candidate filters", subtitle: "Return to the default search view", section: "Search", href: basePath },
    ...candidateFilterLinks.map((filter) => ({
      id: `filter-${filter.value}`,
      title: filter.label,
      subtitle: "Filter candidate search",
      section: "Filters",
      href: candidateSearchHref(basePath, params, { filter: filter.value, candidate: "" })
    })),
    ...data.rows.slice(0, 12).map((row) => ({
      id: `candidate-${row.id}`,
      title: row.name,
      subtitle: `${row.status} · ${row.company}`,
      section: "Candidates",
      href: candidateSearchHref(basePath, params, { candidate: String(row.id) })
    })),
    ...data.selectedActions.map((action) => ({
      id: `selected-${action.label}`,
      title: action.label,
      subtitle: data.selected?.candidate?.candidate_name ?? "Selected candidate",
      section: "Selected candidate",
      href: action.href
    }))
  ];
}
