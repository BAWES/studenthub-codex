import type { Route } from "next";
import Link from "next/link";
import { logoutAction } from "@/modules/auth/actions";
import type { SessionUser } from "@/modules/auth/types";
import { HubShortcuts, type HubCommand } from "@/modules/hub/HubShortcuts";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { CandidateProfile } from "./CandidateProfile";
import type {
  CandidateSearchFacet,
  CandidateSearchFilter,
  CandidateSearchParams,
  getCandidateSearchWorkspace
} from "./search";

type CandidateSearchData = Awaited<ReturnType<typeof getCandidateSearchWorkspace>>;
type CandidateSearchParamKey =
  | "q"
  | "filter"
  | "view"
  | "candidate"
  | "tabs"
  | "selected"
  | "country"
  | "university"
  | "company"
  | "skill"
  | "gender"
  | "profile"
  | "assignment"
  | "document";

export function CandidateSearchOS({
  data,
  basePath,
  homePath,
  session,
  params
}: {
  data: CandidateSearchData;
  basePath: "/admin/candidates" | "/staff/candidates";
  homePath: Route;
  session: SessionUser;
  params: CandidateSearchParams;
}) {
  const commands = buildCandidateSearchCommands(data, basePath, params);
  const selectedIds = params.selectedIds ?? [];
  const selectedRows = data.rows.filter((row) => selectedIds.includes(row.id));
  const facetGroups = [...data.facets].sort((a, b) => Number(hasActiveFacet(b)) - Number(hasActiveFacet(a)));
  const activeFacetCount = data.facets.reduce((count, facet) => count + facet.options.filter((option) => option.active).length, 0);

  return (
    <main className="candidateDesk">
      <header className="candidateDeskTopbar">
        <Link className="candidateDeskBrand" href={homePath}>
          <span>SH</span>
          <strong>Candidates</strong>
        </Link>
        <form className="candidateDeskSearch" id="candidate-search">
          <input
            data-command-search
            id="candidate-query"
            name="q"
            placeholder="Search name, email, phone, ID, skill, tag"
            defaultValue={data.query}
          />
          <input name="filter" type="hidden" value={data.filter} />
          {params.visibility === "assigned" ? <input name="view" type="hidden" value="assigned" /> : null}
          {data.openTabs.length ? <input name="tabs" type="hidden" value={data.openTabs.map((tab) => tab.id).join(",")} /> : null}
          {selectedIds.length ? <input name="selected" type="hidden" value={selectedIds.join(",")} /> : null}
          <HiddenFacetInputs data={data} />
          <button type="submit">Search</button>
        </form>
        <div className="candidateDeskTools">
          <HubShortcuts commands={commands} />
          <ThemeToggle />
          <div className="candidateDeskAccount" title={session.email}>
            <span>{session.role}</span>
            <strong>{session.name}</strong>
          </div>
          <form action={logoutAction}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </header>

      <ActiveSearchContext basePath={basePath} data={data} params={params} />
      <BulkCandidateBar basePath={basePath} params={params} selectedIds={selectedIds} selectedRows={selectedRows} />

      <section className="candidateDeskBody">
        <section className="candidateTabWorkspace" aria-label="Open candidate tabs">
          <CandidateTabs basePath={basePath} data={data} params={params} />
          {data.selected?.candidate ? (
            <CandidateProfile
              detail={data.selected}
              actions={data.selectedActions.filter((action) => action.label !== "Open full record")}
            />
          ) : (
            <CandidateSearchTab
              activeFacetCount={activeFacetCount}
              basePath={basePath}
              data={data}
              facetGroups={facetGroups}
              params={params}
              selectedIds={selectedIds}
            />
          )}
        </section>
      </section>
    </main>
  );
}

function CandidateSearchTab({
  activeFacetCount,
  basePath,
  data,
  facetGroups,
  params,
  selectedIds
}: {
  activeFacetCount: number;
  basePath: "/admin/candidates" | "/staff/candidates";
  data: CandidateSearchData;
  facetGroups: CandidateSearchFacet[];
  params: CandidateSearchParams;
  selectedIds: number[];
}) {
  return (
    <section className="candidateSearchPanel" aria-label="Candidate search and filters">
      <header className="candidateSearchTabHeader">
        <div>
          <span>Search tab</span>
          <strong>{data.query ? `Results for ${data.query}` : "Candidate search"}</strong>
        </div>
        <small>
          {data.rows.length.toLocaleString("en-US")} of {data.matchingCount.toLocaleString("en-US")}
        </small>
      </header>
      <details className="candidatePowerFilters">
        <summary>
          <span>Filters</span>
          <strong>{activeFacetCount ? `${activeFacetCount} active` : "Open power filters"}</strong>
        </summary>
        <section className="candidateFacetRail" aria-label="Candidate power filters">
          {facetGroups.map((facet) => (
            <FacetGroup basePath={basePath} facet={facet} key={facet.key} params={params} />
          ))}
        </section>
      </details>
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
      {data.selectedBlocked ? (
        <div className="candidateAccessNotice">
          <strong>Candidate unavailable</strong>
          <span>This record is missing, deleted, or outside the candidates visible to this login.</span>
        </div>
      ) : null}
      <div className="candidateResultList">
        {data.rows.map((row) => (
          <article
            className={row.id === data.selectedId ? "candidateResultCard active" : "candidateResultCard"}
            key={row.id}
          >
            <Link className="candidateResultSelect" href={candidateSearchHref(basePath, params, { selected: toggleCandidateId(selectedIds, row.id).join(",") })}>
              <span aria-hidden="true">{selectedIds.includes(row.id) ? "✓" : ""}</span>
              <small>{selectedIds.includes(row.id) ? "Selected" : "Select"}</small>
            </Link>
            <Link className="candidateResultOpen" href={candidateSearchHref(basePath, params, { candidate: String(row.id) })}>
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
                <span>{row.updated}</span>
              </div>
              <div className="candidateResultTags">
                {[...row.flags, ...row.skills].slice(0, 3).map((flag) => (
                  <span key={flag}>{flag}</span>
                ))}
              </div>
            </Link>
          </article>
        ))}
        {data.rows.length === 0 ? (
          <div className="candidateEmptyState">
            <strong>No candidates match this search.</strong>
            <span>Remove a facet or search a different name, email, phone, skill, or candidate ID.</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function hasActiveFacet(facet: CandidateSearchFacet) {
  return facet.options.some((option) => option.active);
}

function BulkCandidateBar({
  basePath,
  params,
  selectedIds,
  selectedRows
}: {
  basePath: "/admin/candidates" | "/staff/candidates";
  params: CandidateSearchParams;
  selectedIds: number[];
  selectedRows: CandidateSearchData["rows"];
}) {
  if (!selectedIds.length) return null;
  const selectedValue = selectedIds.join(",");
  const loadedEmailRecipients = selectedRows.map((row) => row.email).filter(Boolean).join(",");

  return (
    <section className="candidateBulkBar" aria-label="Selected candidate actions">
      <div>
        <span>Selection</span>
        <strong>{selectedIds.length.toLocaleString("en-US")} selected</strong>
      </div>
      <nav>
        <Link href={candidateSearchHref(basePath, params, { tabs: selectedValue, candidate: String(selectedIds[0] ?? ""), selected: selectedValue })}>Open as tabs</Link>
        {selectedIds.length === 2 ? <Link href={candidateSearchHref(basePath, params, { selected: selectedValue })}>Merge review</Link> : null}
        {loadedEmailRecipients ? <a href={`mailto:${loadedEmailRecipients}`}>Email loaded</a> : null}
        <Link href={candidateSearchHref(basePath, params, { selected: selectedValue })}>Generate ID batch</Link>
        <Link href={candidateSearchHref(basePath, params, { selected: selectedValue })}>Export CVs</Link>
        <Link href={candidateSearchHref(basePath, params, { selected: "" })}>Deselect</Link>
      </nav>
    </section>
  );
}

function CandidateTabs({
  basePath,
  data,
  params
}: {
  basePath: "/admin/candidates" | "/staff/candidates";
  data: CandidateSearchData;
  params: CandidateSearchParams;
}) {
  return (
    <nav className="candidateTabs" aria-label="Open candidate tabs">
      <Link className={!data.selectedId ? "active" : ""} href={candidateSearchHref(basePath, params, { candidate: "" })}>
        Search
      </Link>
      {data.openTabs.map((tab) => {
        const remainingTabs = data.openTabs.filter((item) => item.id !== tab.id).map((item) => item.id);
        const nextCandidate = data.selectedId === tab.id ? remainingTabs.at(-1) : data.selectedId;
        return (
          <span className={data.selectedId === tab.id ? "active" : ""} key={tab.id}>
            <Link href={candidateSearchHref(basePath, params, { candidate: String(tab.id), tabs: data.openTabs.map((item) => item.id).join(",") })}>
              <strong>{tab.title}</strong>
              <small>{tab.status}</small>
            </Link>
            <Link aria-label={`Close ${tab.title}`} href={candidateSearchHref(basePath, params, { candidate: nextCandidate ? String(nextCandidate) : "", tabs: remainingTabs.join(",") })}>
              x
            </Link>
          </span>
        );
      })}
    </nav>
  );
}

function ActiveSearchContext({
  basePath,
  data,
  params
}: {
  basePath: "/admin/candidates" | "/staff/candidates";
  data: CandidateSearchData;
  params: CandidateSearchParams;
}) {
  const activeFacets = data.facets.flatMap((facet) =>
    facet.options.filter((option) => option.active).map((option) => ({ key: facet.key, label: `${facet.label}: ${option.label}` }))
  );
  const activeItems = [
    data.query ? { key: "q" as const, label: `Search: ${data.query}` } : null,
    data.filter !== "all" ? { key: "filter" as const, label: candidateFilterLinks.find((item) => item.value === data.filter)?.label ?? data.filter } : null,
    data.role === "staff" && data.visibility === "assigned" ? { key: "view" as const, label: `Assigned: ${data.assignedCount ?? 0}` } : null,
    ...activeFacets
  ].filter((item): item is { key: Exclude<CandidateSearchParamKey, "candidate" | "tabs" | "selected">; label: string } => Boolean(item));

  return (
    <section className="candidateSearchContext" aria-label="Candidate search context">
      <div>
        <span>{activeItems.length ? "Filtered view" : "Default view"}</span>
        <strong>
          {data.matchingCount.toLocaleString("en-US")} matching candidates from{" "}
          {data.role === "staff" && data.visibility === "assigned" ? "your assigned production records" : "all production data"}
        </strong>
      </div>
      <nav aria-label="Active candidate filters">
        {data.role === "staff" ? (
          <>
            <Link className={data.visibility === "all" ? "active" : ""} href={candidateSearchHref(basePath, params, { view: "", candidate: "" })}>
              All production
            </Link>
            <Link className={data.visibility === "assigned" ? "active" : ""} href={candidateSearchHref(basePath, params, { view: "assigned", candidate: "" })}>
              Assigned to me
            </Link>
          </>
        ) : null}
        {activeItems.map((item) => (
          <Link href={candidateSearchHref(basePath, params, { [item.key]: "", candidate: "" })} key={`${item.key}-${item.label}`}>
            {item.label}
          </Link>
        ))}
        {activeItems.length ? <Link href={basePath}>Clear all</Link> : <Link href={candidateSearchHref(basePath, params, { filter: "needs-review", candidate: "" })}>Review queue</Link>}
      </nav>
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
      {data.params.gender ? <input name="gender" type="hidden" value={data.params.gender} /> : null}
      {data.params.profile ? <input name="profile" type="hidden" value={data.params.profile} /> : null}
      {data.params.assignment ? <input name="assignment" type="hidden" value={data.params.assignment} /> : null}
      {data.params.document ? <input name="document" type="hidden" value={data.params.document} /> : null}
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
  overrides: Partial<Record<CandidateSearchParamKey, string>>
) {
  const next = new URLSearchParams();
  const existingTabs = (params.tabIds ?? []).join(",");
  const values = {
    q: params.query ?? "",
    filter: params.filter && params.filter !== "all" ? params.filter : "",
    view: params.visibility === "assigned" ? "assigned" : "",
    candidate: params.candidateId ? String(params.candidateId) : "",
    tabs: existingTabs,
    selected: (params.selectedIds ?? []).join(","),
    country: params.country ?? "",
    university: params.university ?? "",
    company: params.company ?? "",
    skill: params.skill ?? "",
    gender: params.gender ?? "",
    profile: params.profile ?? "",
    assignment: params.assignment ?? "",
    document: params.document ?? "",
    ...overrides
  };
  if (values.candidate && overrides.tabs === undefined) {
    values.tabs = [...new Set([...(values.tabs ? values.tabs.split(",") : []), values.candidate])].filter(Boolean).join(",");
  }
  for (const [key, value] of Object.entries(values)) {
    if (value) next.set(key, value);
  }
  const suffix = next.toString();
  return (suffix ? `${basePath}?${suffix}` : basePath) as Route;
}

function toggleCandidateId(ids: number[], id: number) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
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
