import type { Route } from "next";
import Link from "next/link";
import { logoutAction } from "@/modules/auth/actions";
import type { SessionUser } from "@/modules/auth/types";
import { HubShortcuts, type HubCommand } from "@/modules/hub/HubShortcuts";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { CandidateProfile } from "./CandidateProfile";
import { ExportCVsForm } from "./ExportCVsForm";
import { SearchStatusPill } from "./SearchStatusPill";
import { SearchFormWrapper } from "./SearchFormWrapper";
import MatchScoreBadge from "@/components/matching/MatchScoreBadge";
import { EmptyState } from "@/components/ui/empty-state";
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
  | "page"
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
    <main className="min-h-svh grid grid-rows-[auto_auto_auto_1fr] gap-2 bg-[length:44px_44px] bg-[linear-gradient(90deg,var(--grid-line)_1px,transparent_1px),linear-gradient(180deg,var(--grid-line)_1px,transparent_1px)] bg-[var(--paper)] text-[var(--ink)] p-2">
      <header className="min-w-0 grid grid-cols-[auto_minmax(320px,1fr)_auto] gap-2 items-center border border-[var(--line)] rounded-lg bg-[var(--surface)]/95 p-2">
        <Link className="flex items-center gap-[9px] min-h-[40px] text-[var(--ink)] no-underline px-2" href={homePath}>
          <span className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-[var(--ink)] text-[var(--surface)] font-bold">SH</span>
          <strong className="text-sm">Candidates</strong>
        </Link>
        <SearchFormWrapper>
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
        </SearchFormWrapper>
        <div className="flex items-center gap-[6px] justify-end">
          <HubShortcuts commands={commands} />
          <ThemeToggle />
          <div className="min-w-[140px] max-w-[220px] min-h-[42px] grid content-center border border-[var(--line)] rounded-lg bg-[var(--surface-soft)] px-[11px]" title={session.email}>
            <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--blue)] text-[10px] font-bold uppercase">{session.role}</span>
            <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--ink)] text-xs">{session.name}</strong>
          </div>
          <form action={logoutAction}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </header>

      <ActiveSearchContext basePath={basePath} data={data} params={params} />
      <BulkCandidateBar basePath={basePath} params={params} selectedIds={selectedIds} selectedRows={selectedRows} />

      <section className="min-w-0 min-h-0 grid grid-cols-[minmax(0,1fr)] gap-2">
        <section className="min-w-0 min-h-0 overflow-hidden border border-[var(--line)] rounded-lg bg-[var(--surface)]/96 grid grid-rows-[auto_minmax(0,1fr)]" aria-label="Open candidate tabs">
          <CandidateTabs basePath={basePath} data={data} params={params} />
          {data.selected?.candidate ? (
            <CandidateProfile
              detail={data.selected}
              actions={data.selectedActions.filter((action) => action.label !== "Open full record")}
              viewerRole={session.role}
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
    <section className="min-w-0 min-h-0 overflow-hidden border border-[var(--line)] rounded-lg bg-[var(--surface)]/96 grid grid-rows-[auto_auto_auto_minmax(0,1fr)]" aria-label="Candidate search and filters">
      <header className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-[14px] py-3">
        <div className="min-w-0 grid gap-[3px]">
          <span className="text-[var(--blue)] text-[11px] font-bold uppercase">Search tab</span>
          <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[22px]">{data.query ? `Results for ${data.query}` : "Candidate search"}</strong>
        </div>
        <SearchStatusPill resultsCount={data.rows.length} query={data.query} />
        <small className="text-[var(--muted)] text-[13px] font-bold whitespace-nowrap">
          {data.matchingCount.toLocaleString("en-US")} total
        </small>
        {data.source?.current ? (
          <span className="sourceBadge" title={data.source.note}>
            {data.source.current}
          </span>
        ) : null}
      </header>
      <details className="border-b border-[var(--line)]">
        <summary className="min-h-[42px] grid grid-cols-[minmax(0,1fr)_auto] gap-2 items-center cursor-pointer list-none px-3 [&::-webkit-details-marker]:hidden">
          <span className="text-[var(--blue)] text-[11px] font-bold uppercase">Filters</span>
          <strong className="border border-[var(--line)] rounded-full bg-[var(--surface-soft)] text-[var(--ink)] px-2 py-1 text-[11px] font-semibold">{activeFacetCount ? `${activeFacetCount} active` : "Open power filters"}</strong>
        </summary>
        <section className="grid grid-cols-2 gap-[6px] max-h-[280px] overflow-y-auto p-2 border-b border-[var(--line)]" aria-label="Candidate power filters">
          {facetGroups.map((facet) => (
            <FacetGroup basePath={basePath} facet={facet} key={facet.key} params={params} />
          ))}
        </section>
      </details>
      <nav className="flex gap-[6px] overflow-x-auto border-b border-[var(--line)] p-2 scrollbar-none" aria-label="Candidate search filters">
        {candidateFilterLinks.map((item) => (
          <Link
            className={`
              flex-[0_0_auto] min-h-[32px] inline-flex items-center border border-[var(--line)] rounded-lg px-[10px] text-[13px] font-semibold whitespace-nowrap no-underline
              ${item.value === data.filter
                ? "border-[var(--blue)] bg-[color-mix(in_srgb,var(--blue)_10%,var(--surface))] text-[var(--blue)]"
                : "text-[var(--muted)]"}
            `}
            href={candidateSearchHref(basePath, params, { filter: item.value, candidate: "" })}
            key={item.value}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <FacetChips basePath={basePath} data={data} params={params} />
      {data.selectedBlocked ? (
        <div className="grid gap-[5px] border border-[var(--line)] rounded-lg bg-[color-mix(in_srgb,var(--rose)_8%,var(--surface))] mx-[10px] p-3">
          <strong>Candidate unavailable</strong>
          <span className="text-[var(--muted)] leading-[1.45]">This record is missing, deleted, or outside the candidates visible to this login.</span>
        </div>
      ) : null}
      <div className="overflow-y-auto align-content-start grid gap-2 p-[10px] min-h-0 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
        {data.rows.map((row) => (
          <article
            className={`
              relative grid gap-[7px] border border-[var(--line)] rounded-lg bg-[var(--surface)] text-[var(--ink)] px-[10px] py-[9px] no-underline transition-[border-color,transform,box-shadow] duration-[140ms] ease
              ${row.id === data.selectedId ? "border-[var(--blue)] bg-[color-mix(in_srgb,var(--blue)_7%,var(--surface))] shadow-[0_10px_30px_rgba(16,24,40,0.08)]" : ""}
              hover:border-[var(--blue)] hover:bg-[color-mix(in_srgb,var(--blue)_7%,var(--surface))] hover:shadow-[0_10px_30px_rgba(16,24,40,0.08)]
            `}
            key={row.id}
          >
            <Link
              className="absolute top-[10px] right-[10px] z-[2] w-[26px] h-[26px] inline-flex items-center justify-center border border-[var(--line)] rounded-lg bg-[var(--surface-soft)] text-[var(--blue)] no-underline hover:border-[var(--blue)] hover:bg-[color-mix(in_srgb,var(--blue)_10%,var(--surface))]"
              href={candidateSearchHref(basePath, params, { selected: toggleCandidateId(selectedIds, row.id).join(",") })}
            >
              <span className="w-[14px] h-[14px] inline-flex items-center justify-center border border-[var(--line)] rounded text-[10px] font-bold" aria-hidden="true">{selectedIds.includes(row.id) ? "✓" : ""}</span>
              <small className="absolute w-px h-px overflow-hidden [clip:rect(0_0_0_0)]">{selectedIds.includes(row.id) ? "Selected" : "Select"}</small>
            </Link>
            <Link className="grid gap-[7px] text-inherit no-underline" href={candidateSearchHref(basePath, params, { candidate: String(row.id) })}>
              <div className="min-w-0 grid grid-cols-[36px_minmax(0,1fr)_auto] gap-[9px] items-center pr-[30px]">
                <span className="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-[var(--ink)] text-[var(--surface)] font-bold text-[13px]">{candidateInitials(row.name)}</span>
                <div>
                  <strong className="block overflow-hidden text-ellipsis whitespace-nowrap">{row.name}</strong>
                  <small className="block overflow-hidden text-ellipsis whitespace-nowrap">{row.email}</small>
                </div>
                <em className="border border-[color-mix(in_srgb,var(--green)_38%,var(--line))] rounded-full text-[var(--green)] px-[7px] py-[3px] text-[11px] not-italic font-semibold whitespace-nowrap">{row.status}</em>
                <MatchScoreBadge score={row.score} label="Score" showBar={false} />
              </div>
              <div className="flex flex-wrap gap-[5px] items-center">
                <span className="text-xs text-[var(--muted)]">{row.signal}</span>
                <span className="text-xs text-[var(--muted)]">{row.country}</span>
                <span className="text-xs text-[var(--muted)]">{row.updated}</span>
              </div>
              <div className="flex flex-wrap gap-[5px] items-center">
                {[...row.flags, ...row.skills].slice(0, 3).map((flag) => (
                  <span key={flag} className="min-h-[23px] inline-flex items-center border border-[var(--line)] rounded-full bg-[var(--surface)] text-[var(--muted)] px-[7px] text-[11px] font-bold">{flag}</span>
                ))}
              </div>
            </Link>
          </article>
        ))}
        {data.rows.length === 0 ? (
          <EmptyState
            variant="search"
            title="No candidates match this search."
            description="Remove a facet or search a different name, email, phone, skill, or candidate ID."
          />
        ) : data.totalPages && data.totalPages > 1 ? (
          <CandidatePagination basePath={basePath} params={params} page={data.page ?? 1} totalPages={data.totalPages} />
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
    <section className="grid grid-cols-[auto_minmax(0,1fr)] gap-[10px] items-center border border-[var(--blue)] rounded-lg bg-[color-mix(in_srgb,var(--blue)_9%,var(--surface))] px-[10px] py-2" aria-label="Selected candidate actions">
      <div className="grid gap-[2px]">
        <span className="text-[var(--blue)] text-[10px] font-bold uppercase">Selection</span>
        <strong className="text-[var(--ink)] text-sm">{selectedIds.length.toLocaleString("en-US")} selected</strong>
      </div>
      <nav className="min-w-0 flex flex-wrap justify-end gap-[6px]">
        <Link className="min-h-[32px] inline-flex items-center border border-[var(--line)] rounded-lg bg-[var(--surface)] text-[var(--ink)] px-[10px] text-xs font-semibold no-underline" href={candidateSearchHref(basePath, params, { tabs: selectedValue, candidate: String(selectedIds[0] ?? ""), selected: selectedValue })}>Open as tabs</Link>
        {selectedIds.length === 2 ? <Link className="min-h-[32px] inline-flex items-center border border-[var(--line)] rounded-lg bg-[var(--surface)] text-[var(--ink)] px-[10px] text-xs font-semibold no-underline" href={candidateSearchHref(basePath, params, { selected: selectedValue })}>Merge review</Link> : null}
        {loadedEmailRecipients ? <a className="min-h-[32px] inline-flex items-center border border-[var(--line)] rounded-lg bg-[var(--surface)] text-[var(--ink)] px-[10px] text-xs font-semibold no-underline" href={`mailto:${loadedEmailRecipients}`}>Email loaded</a> : null}
        <Link className="min-h-[32px] inline-flex items-center border border-[var(--line)] rounded-lg bg-[var(--surface)] text-[var(--ink)] px-[10px] text-xs font-semibold no-underline" href={candidateSearchHref(basePath, params, { selected: selectedValue })}>Generate ID batch</Link>
        <ExportCVsForm candidateIds={selectedValue} />
        <Link className="min-h-[32px] inline-flex items-center border border-[var(--line)] rounded-lg bg-[var(--surface)] text-[var(--ink)] px-[10px] text-xs font-semibold no-underline" href={candidateSearchHref(basePath, params, { selected: "" })}>Deselect</Link>
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
    <nav className="min-w-0 flex gap-1 overflow-x-auto border-b border-[var(--line)] bg-[var(--surface)] p-[6px] scrollbar-none" aria-label="Open candidate tabs">
      <Link className={`
        min-h-[40px] inline-flex items-center border border-[var(--line)] rounded-lg bg-[var(--surface-soft)] text-[var(--ink)] no-underline px-3 text-[13px] font-semibold
        ${!data.selectedId ? "border-[var(--blue)] bg-[color-mix(in_srgb,var(--blue)_8%,var(--surface))]" : ""}
      `} href={candidateSearchHref(basePath, params, { candidate: "" })}>
        Search
      </Link>
      {data.openTabs.map((tab) => {
        const remainingTabs = data.openTabs.filter((item) => item.id !== tab.id).map((item) => item.id);
        const nextCandidate = data.selectedId === tab.id ? remainingTabs.at(-1) : data.selectedId;
        return (
          <span className={`
            overflow-hidden flex-[0_0_auto] max-w-[260px] min-h-[40px] inline-flex items-center border border-[var(--line)] rounded-lg bg-[var(--surface-soft)] text-[var(--ink)] no-underline
            ${data.selectedId === tab.id ? "border-[var(--blue)] bg-[color-mix(in_srgb,var(--blue)_8%,var(--surface))]" : ""}
          `} key={tab.id}>
            <Link className="min-w-0 grid gap-[1px] text-inherit no-underline px-[10px] py-[5px]" href={candidateSearchHref(basePath, params, { candidate: String(tab.id), tabs: data.openTabs.map((item) => item.id).join(",") })}>
              <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px]">{tab.title}</strong>
              <small className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-[var(--muted)]">{tab.status}</small>
            </Link>
            <Link
              aria-label={`Close ${tab.title}`}
              className="min-w-[34px] self-stretch inline-flex items-center justify-center border-l border-[var(--line)] text-[var(--muted)] text-xs font-semibold no-underline hover:bg-[color-mix(in_srgb,var(--rose)_10%,var(--surface))] hover:text-[var(--rose)]"
              href={candidateSearchHref(basePath, params, { candidate: nextCandidate ? String(nextCandidate) : "", tabs: remainingTabs.join(",") })}
            >
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
  ].filter((item): item is { key: Exclude<CandidateSearchParamKey, "candidate" | "tabs" | "selected" | "page">; label: string } => Boolean(item));

  return (
    <section className="grid grid-cols-[minmax(0,1fr)_auto] gap-[10px] items-center border border-[var(--line)] rounded-lg bg-[var(--surface)] px-3 py-[10px]" aria-label="Candidate search context">
      <div className="min-w-0 grid gap-[3px]">
        <span className="text-[var(--blue)] text-[11px] font-semibold uppercase">{activeItems.length ? "Filtered view" : "Default view"}</span>
        <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--ink)]">
          {data.matchingCount.toLocaleString("en-US")} matching candidates from{" "}
          {data.role === "staff" && data.visibility === "assigned" ? "your assigned production records" : "all production data"}
        </strong>
      </div>
      <nav className="flex flex-wrap justify-end gap-[6px]" aria-label="Active candidate filters">
        {data.role === "staff" ? (
          <>
            <Link
              className={`min-h-[30px] inline-flex items-center border border-[var(--line)] rounded-lg bg-[var(--surface-soft)] text-[var(--ink)] px-[9px] text-xs font-semibold no-underline hover:border-[var(--blue)] hover:text-[var(--blue)] ${data.visibility === "all" ? "border-[var(--blue)] bg-[var(--blue)] text-white" : ""}`}
              href={candidateSearchHref(basePath, params, { view: "", candidate: "" })}
            >
              All production
            </Link>
            <Link
              className={`min-h-[30px] inline-flex items-center border border-[var(--line)] rounded-lg bg-[var(--surface-soft)] text-[var(--ink)] px-[9px] text-xs font-semibold no-underline hover:border-[var(--blue)] hover:text-[var(--blue)] ${data.visibility === "assigned" ? "border-[var(--blue)] bg-[var(--blue)] text-white" : ""}`}
              href={candidateSearchHref(basePath, params, { view: "assigned", candidate: "" })}
            >
              Assigned to me
            </Link>
          </>
        ) : null}
        {activeItems.map((item) => (
          <Link
            className="min-h-[30px] inline-flex items-center border border-[var(--line)] rounded-lg bg-[var(--surface-soft)] text-[var(--ink)] px-[9px] text-xs font-semibold no-underline hover:border-[var(--blue)] hover:text-[var(--blue)]"
            href={candidateSearchHref(basePath, params, { [item.key]: "", candidate: "" })}
            key={`${item.key}-${item.label}`}
          >
            {item.label}
          </Link>
        ))}
        {activeItems.length ? (
          <Link className="min-h-[30px] inline-flex items-center border border-[var(--line)] rounded-lg bg-[var(--surface-soft)] text-[var(--ink)] px-[9px] text-xs font-semibold no-underline hover:border-[var(--blue)] hover:text-[var(--blue)]" href={basePath}>Clear all</Link>
        ) : (
          <Link className="min-h-[30px] inline-flex items-center border border-[var(--line)] rounded-lg bg-[var(--surface-soft)] text-[var(--ink)] px-[9px] text-xs font-semibold no-underline hover:border-[var(--blue)] hover:text-[var(--blue)]" href={candidateSearchHref(basePath, params, { filter: "needs-review", candidate: "" })}>Review queue</Link>
        )}
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
    <section className="border border-[var(--line)] rounded-lg bg-[var(--surface)] p-[7px]">
      <h3 className="m-0 mb-[4px] text-[11px] text-[var(--blue)] text-[11px] font-bold uppercase">{facet.label}</h3>
      {facet.options.map((option) => (
        <Link
          className={`
            min-w-0 min-h-[34px] grid grid-cols-[minmax(0,1fr)_auto] gap-[10px] items-center border border-transparent rounded-lg text-[var(--muted)] px-2 no-underline
            ${option.active ? "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--blue)]" : ""}
            hover:border-[var(--line)] hover:bg-[var(--surface-soft)] hover:text-[var(--blue)]
          `}
          href={candidateSearchHref(basePath, params, { [facet.key]: option.active ? "" : option.value, candidate: "" })}
          key={option.value}
        >
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">{option.label}</span>
          <strong className="text-xs">{option.count}</strong>
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
    page: params.page && params.page > 1 ? String(params.page) : "",
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

// Exported for testing
export { FacetChips, QUICK_FACET_KEYS };

export function candidateInitials(name: string) {
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

// ---------------------------------------------------------------------------
// FacetChips — inline clickable facet chips surfaced above search results
// ---------------------------------------------------------------------------
// Shows the most commonly-used facet groups (country, skills, company, university)
// as clickable chips so users can filter without opening the power filters panel.
// Each chip toggles the corresponding facet on click.
// ---------------------------------------------------------------------------

const QUICK_FACET_KEYS = ["country", "skill", "company", "university"];

function FacetChips({
  basePath,
  data,
  params,
}: {
  basePath: "/admin/candidates" | "/staff/candidates";
  data: CandidateSearchData;
  params: CandidateSearchParams;
}) {
  // Show facets that match the quick filter keys and have options
  const quickFacets = data.facets.filter((f) => QUICK_FACET_KEYS.includes(f.key) && f.options.length > 0);
  if (quickFacets.length === 0) return null;

  const activeCount = quickFacets.reduce(
    (count, facet) => count + facet.options.filter((o) => o.active).length,
    0,
  );

  return (
    <section className="flex flex-wrap gap-2 px-[14px] py-[10px] border-b border-[var(--line)]" aria-label="Quick facet filters">
      {quickFacets.map((facet) => (
        <div className="flex flex-wrap items-center gap-[6px]" key={facet.key}>
          <span className="text-[var(--blue)] text-[11px] font-bold uppercase">{facet.label}</span>
          <div className="flex flex-wrap gap-[6px]">
            {facet.options.slice(0, 6).map((option) => (
              <Link
                className={`inline-flex items-center gap-1 min-h-[26px] border border-[var(--line)] rounded-full bg-[var(--surface)] px-[10px] text-xs font-medium text-[var(--ink)] no-underline whitespace-nowrap transition-all duration-[120ms] ease hover:border-[var(--blue)] hover:bg-[color-mix(in_srgb,var(--blue)_8%,var(--surface))] hover:text-[var(--blue)] ${option.active ? "border-[var(--blue)] bg-[var(--blue)] text-[var(--surface)] hover:text-[var(--surface)]" : ""}`}
                href={candidateSearchHref(basePath, params, {
                  [facet.key]: option.active ? "" : option.value,
                  candidate: "",
                })}
                key={option.value}
              >
                <span>{option.label}</span>
                {option.count > 0 ? <strong>{option.count}</strong> : null}
                {option.active ? <span className="inline-flex items-center justify-center w-4 h-4 ml-1 text-[10px] leading-none cursor-pointer" aria-label={`Remove ${option.label} filter`}>✕</span> : null}
              </Link>
            ))}
          </div>
        </div>
      ))}
      {activeCount > 1 ? (
        <Link className="text-xs font-semibold text-[var(--blue)] no-underline hover:underline" href={basePath}>
          Clear all
        </Link>
      ) : null}
    </section>
  );
}

// ---------------------------------------------------------------------------
// CandidatePagination — prev/next page controls for search results
// ---------------------------------------------------------------------------

function CandidatePagination({
  basePath,
  params,
  page,
  totalPages,
}: {
  basePath: "/admin/candidates" | "/staff/candidates";
  params: CandidateSearchParams;
  page: number;
  totalPages: number;
}) {
  return (
    <nav className="flex items-center justify-between gap-3 col-span-full border-t border-[var(--line)] px-[14px] py-3" aria-label="Candidate search pagination">
      <div className="flex items-center gap-1">
        <span className="text-[var(--muted)] text-xs">Page</span>
        <strong className="text-[var(--ink)] text-sm">{page.toLocaleString("en-US")}</strong>
        <span className="text-[var(--muted)] text-xs">of {totalPages.toLocaleString("en-US")}</span>
      </div>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link className="min-h-[34px] inline-flex items-center border border-[var(--line)] rounded-lg bg-[var(--surface-soft)] text-[var(--ink)] px-3 text-xs font-semibold no-underline hover:border-[var(--blue)] hover:text-[var(--blue)]" href={candidateSearchHref(basePath, params, { page: String(page - 1) })}>
            ← Previous
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link className="min-h-[34px] inline-flex items-center border border-[var(--line)] rounded-lg bg-[var(--surface-soft)] text-[var(--ink)] px-3 text-xs font-semibold no-underline hover:border-[var(--blue)] hover:text-[var(--blue)]" href={candidateSearchHref(basePath, params, { page: String(page + 1) })}>
            Next →
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
