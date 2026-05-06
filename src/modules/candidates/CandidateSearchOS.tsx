import type { Route } from "next";
import Link from "next/link";
import { HubShortcuts, type HubCommand } from "@/modules/hub/HubShortcuts";
import { CandidateProfile } from "./CandidateProfile";
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
  const commands = buildCandidateSearchCommands(data, basePath, params);

  return (
    <section className="candidateSearchOS">
      <section className="candidateSearchHero">
        <div>
          <span>Live candidate workspace</span>
          <h2>Search production candidates and open the complete profile without losing flow.</h2>
          <p>
            This is not sample content. The list, facets, readiness state, notes, invitations, history, documents, and
            work logs are pulled from the imported production database and scoped to this login.
          </p>
        </div>
        <div className="candidateSearchHeroRail">
          {data.metrics.slice(0, 3).map((metric) => (
            <article key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value.toLocaleString("en-US")}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="candidateSearchGrid">
        <aside className="candidateFacetPanel" aria-label="Candidate facets">
          <form className="candidateSearchForm" id="candidate-search">
            <label htmlFor="candidate-query">Find candidate</label>
            <input
              data-command-search
              id="candidate-query"
              name="q"
              placeholder="Name, email, phone, ID, skill, tag"
              defaultValue={data.query}
            />
            <input name="filter" type="hidden" value={data.filter} />
            <HiddenFacetInputs data={data} />
            <button type="submit">Search</button>
          </form>
          <div className="candidateSearchCommand">
            <HubShortcuts commands={commands} />
          </div>
          <nav className="candidateSearchFilters" aria-label="Candidate search filters">
            {candidateFilterLinks.map((item) => (
              <Link
                className={item.value === data.filter ? "active" : ""}
                href={candidateSearchHref(basePath, params, { filter: item.value, candidate: "" })}
                key={item.value}
              >
                {item.label}
              </Link>
            ))}
          </nav>
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
                <div className="candidateResultMain">
                  <span className="candidateResultAvatar">{candidateInitials(row.name)}</span>
                  <div>
                    <strong>{row.name}</strong>
                    <small>{row.email}</small>
                  </div>
                  <em>{row.status}</em>
                </div>
                <div className="candidateResultMeta">
                  <span>{row.signal}</span>
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
          {data.selected?.candidate ? (
            <CandidateProfile
              compact
              detail={data.selected}
              actions={[
                ...data.selectedActions.filter((action) => action.label !== "Open full record"),
                { label: "Open complete record", href: `${detailPath}/${data.selected.candidate.candidate_id}` }
              ]}
            />
          ) : (
            <CandidateProfile compact detail={data.selected} actions={[]} />
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

function candidateInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
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
