import type { Route } from "next";
import Link from "next/link";
import { logoutAction } from "@/modules/auth/actions";
import type { SessionUser } from "@/modules/auth/types";
import { HubShortcuts, type HubCommand } from "@/modules/hub/HubShortcuts";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { CandidateProfile } from "./CandidateProfile";
import { ExportCVsForm } from "./ExportCVsForm";
import { SearchFormWrapper } from "./SearchFormWrapper";
import type {
  CandidateSearchFacet,
  CandidateSearchFilter,
  CandidateSearchParams,
  getCandidateSearchWorkspace
} from "./search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <main className="flex flex-col h-screen bg-background">
      {/* Topbar */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card shrink-0">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 px-2">
          <Link href={homePath}>
            <span className="font-bold text-foreground">SH</span>
            <span className="text-muted-foreground text-sm font-medium">Candidates</span>
          </Link>
        </Button>
        <SearchFormWrapper>
          <div className="flex items-center gap-2 flex-1">
            <Input
              data-command-search
              id="candidate-query"
              name="q"
              placeholder="Search name, email, phone, ID, skill, tag"
              defaultValue={data.query}
              className="flex-1 max-w-md h-9"
            />
            <input name="filter" type="hidden" value={data.filter} />
            {params.visibility === "assigned" ? <input name="view" type="hidden" value="assigned" /> : null}
            {data.openTabs.length ? <input name="tabs" type="hidden" value={data.openTabs.map((tab) => tab.id).join(",")} /> : null}
            {selectedIds.length ? <input name="selected" type="hidden" value={selectedIds.join(",")} /> : null}
            <HiddenFacetInputs data={data} />
            <Button type="submit" size="sm">Search</Button>
          </div>
        </SearchFormWrapper>
        <div className="flex items-center gap-1 ml-auto shrink-0">
          <HubShortcuts commands={commands} />
          <ThemeToggle />
          <div className="flex items-center gap-2 pl-3 border-l border-border text-sm" title={session.email}>
            <span className="text-muted-foreground text-xs uppercase tracking-wider">{session.role}</span>
            <strong className="text-foreground font-medium">{session.name}</strong>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground">
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <ActiveSearchContext basePath={basePath} data={data} params={params} />
      <BulkCandidateBar basePath={basePath} params={params} selectedIds={selectedIds} selectedRows={selectedRows} />

      {/* Body */}
      <section className="flex-1 flex overflow-hidden">
        <section className="flex-1 flex flex-col overflow-hidden" aria-label="Open candidate tabs">
          <CandidateTabs basePath={basePath} data={data} params={params} />
          {data.selected?.candidate ? (
            <div className="flex-1 overflow-auto">
              <CandidateProfile
                detail={data.selected}
                actions={data.selectedActions.filter((action) => action.label !== "Open full record")}
                viewerRole={session.role}
              />
            </div>
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
    <section className="flex-1 flex flex-col overflow-hidden" aria-label="Candidate search and filters">
      {/* Search tab header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Search tab</span>
          <strong className="block text-foreground text-sm font-medium">
            {data.query ? `Results for ${data.query}` : "Candidate search"}
          </strong>
        </div>
        <small className="text-xs text-muted-foreground">
          {data.rows.length.toLocaleString("en-US")} of {data.matchingCount.toLocaleString("en-US")}
        </small>
      </div>

      {/* Power filters — collapsible */}
      <details className="border-b border-border">
        <summary className="flex items-center gap-2 px-4 py-2 cursor-pointer text-sm hover:bg-muted/50 list-none select-none [&::-webkit-details-marker]:hidden">
          <span className="text-foreground font-medium">Filters</span>
          <strong className="text-muted-foreground font-normal">
            {activeFacetCount ? `${activeFacetCount} active` : "Open power filters"}
          </strong>
        </summary>
        <Separator />
        <ScrollArea className="max-h-64 overflow-auto">
          <div className="px-4 py-2 space-y-1 bg-muted/20">
            {facetGroups.map((facet) => (
              <FacetGroup basePath={basePath} facet={facet} key={facet.key} params={params} />
            ))}
          </div>
        </ScrollArea>
      </details>

      {/* Filter pills */}
      <nav className="flex items-center gap-1.5 px-4 py-2 border-b border-border shrink-0 overflow-x-auto" aria-label="Candidate search filters">
        {candidateFilterLinks.map((item) => (
          <Link
            key={item.value}
            href={candidateSearchHref(basePath, params, { filter: item.value, candidate: "" })}
          >
            <Badge
              variant={item.value === data.filter ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10 transition-colors"
            >
              {item.label}
            </Badge>
          </Link>
        ))}
      </nav>

      {/* Blocked candidate notice */}
      {data.selectedBlocked ? (
        <div className="mx-4 mt-2 p-3 rounded-md border border-destructive/30 bg-destructive/5 text-sm">
          <strong className="text-destructive block">Candidate unavailable</strong>
          <span className="text-muted-foreground">
            This record is missing, deleted, or outside the candidates visible to this login.
          </span>
        </div>
      ) : null}

      {/* Result list */}
      <div className="flex-1 overflow-auto p-4">
        {data.rows.length === 0 ? (
          <CandidateEmptyState basePath={basePath} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {data.rows.map((row) => (
              <CandidateResultCard
                basePath={basePath}
                key={row.id}
                params={params}
                row={row}
                selectedIds={selectedIds}
                selectedCandidateId={data.selectedId}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CandidateResultCard({
  basePath,
  params,
  row,
  selectedIds,
  selectedCandidateId
}: {
  basePath: "/admin/candidates" | "/staff/candidates";
  params: CandidateSearchParams;
  row: CandidateSearchData["rows"][number];
  selectedIds: number[];
  selectedCandidateId: number | null;
}) {
  const isSelected = selectedCandidateId === row.id;
  const isChecked = selectedIds.includes(row.id);

  return (
    <Card className={`overflow-hidden transition-shadow hover:shadow-sm ${isSelected ? "ring-2 ring-primary/30" : ""}`}>
      <div className="flex items-start gap-2 p-3">
        {/* Select checkbox */}
        <Link
          href={candidateSearchHref(basePath, params, { selected: toggleCandidateId(selectedIds, row.id).join(",") })}
          className="shrink-0 mt-1"
        >
          <div className={`w-5 h-5 rounded border flex items-center justify-center text-xs transition-colors ${isChecked ? "bg-primary border-primary text-primary-foreground" : "border-border hover:border-foreground/40"}`}>
            {isChecked ? "✓" : ""}
          </div>
        </Link>

        {/* Main card content */}
        <Link href={candidateSearchHref(basePath, params, { candidate: String(row.id) })} className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0">
              {candidateInitials(row.name)}
            </span>
            <div className="min-w-0">
              <strong className="block text-sm text-foreground truncate">{row.name}</strong>
              <small className="text-xs text-muted-foreground truncate block">{row.email}</small>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
            <Badge variant="secondary" className="text-[11px] px-1.5 py-0">{row.status}</Badge>
            <span>{row.signal}</span>
            <span>{row.country}</span>
          </div>

          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {[...row.flags, ...row.skills].slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[11px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="text-[11px] text-muted-foreground mt-1.5">
            Updated: {row.updated}
          </div>
        </Link>
      </div>
    </Card>
  );
}

function CandidateEmptyState({ basePath }: { basePath: string }) {
  return (
    <Card className="p-8 text-center">
      <CardContent className="flex flex-col items-center gap-3 pt-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
        <strong className="text-foreground text-sm">No candidates match this search.</strong>
        <span className="text-muted-foreground text-xs max-w-sm">
          Remove a facet or search a different name, email, phone, skill, or candidate ID.
        </span>
        <Button variant="outline" size="sm" asChild>
          <Link href={basePath}>Clear filters</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function CandidateSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-2.5 bg-muted rounded animate-pulse w-1/2" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <div className="h-5 bg-muted rounded animate-pulse w-16" />
            <div className="h-5 bg-muted rounded animate-pulse w-12" />
          </div>
        </Card>
      ))}
    </div>
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
    <section className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30 shrink-0" aria-label="Selected candidate actions">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Selection</span>
        <strong className="text-foreground">{selectedIds.length.toLocaleString("en-US")} selected</strong>
      </div>
      <nav className="flex items-center gap-1">
        <Button variant="ghost" size="sm" asChild>
          <Link href={candidateSearchHref(basePath, params, { tabs: selectedValue, candidate: String(selectedIds[0] ?? ""), selected: selectedValue })}>
            Open as tabs
          </Link>
        </Button>
        {selectedIds.length === 2 ? (
          <Button variant="ghost" size="sm" asChild>
            <Link href={candidateSearchHref(basePath, params, { selected: selectedValue })}>
              Merge review
            </Link>
          </Button>
        ) : null}
        {loadedEmailRecipients ? (
          <Button variant="ghost" size="sm" asChild>
            <a href={`mailto:${loadedEmailRecipients}`}>Email loaded</a>
          </Button>
        ) : null}
        <Button variant="ghost" size="sm" asChild>
          <Link href={candidateSearchHref(basePath, params, { selected: selectedValue })}>
            Generate ID batch
          </Link>
        </Button>
        <ExportCVsForm candidateIds={selectedValue} />
        <Button variant="ghost" size="sm" asChild>
          <Link href={candidateSearchHref(basePath, params, { selected: "" })}>
            Deselect
          </Link>
        </Button>
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
    <nav className="flex items-center border-b border-border bg-card shrink-0 overflow-x-auto" aria-label="Open candidate tabs">
      <Link
        className={`px-3 py-2 text-sm border-r border-border transition-colors hover:bg-muted/40 ${!data.selectedId ? "bg-muted/30 font-medium text-foreground" : "text-muted-foreground"}`}
        href={candidateSearchHref(basePath, params, { candidate: "" })}
      >
        Search
      </Link>
      {data.openTabs.map((tab) => {
        const remainingTabs = data.openTabs.filter((item) => item.id !== tab.id).map((item) => item.id);
        const nextCandidate = data.selectedId === tab.id ? remainingTabs.at(-1) : data.selectedId;
        const isActive = data.selectedId === tab.id;
        return (
          <span
            key={tab.id}
            className={`flex items-center border-r border-border ${isActive ? "bg-background" : "bg-card hover:bg-muted/30"}`}
          >
            <Link
              href={candidateSearchHref(basePath, params, { candidate: String(tab.id), tabs: data.openTabs.map((item) => item.id).join(",") })}
              className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}
            >
              <strong className="text-sm truncate max-w-[120px]">{tab.title}</strong>
              <small className="text-xs text-muted-foreground shrink-0">{tab.status}</small>
            </Link>
            <Link
              aria-label={`Close ${tab.title}`}
              href={candidateSearchHref(basePath, params, { candidate: nextCandidate ? String(nextCandidate) : "", tabs: remainingTabs.join(",") })}
              className="px-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
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
  ].filter((item): item is { key: Exclude<CandidateSearchParamKey, "candidate" | "tabs" | "selected">; label: string } => Boolean(item));

  return (
    <section className="flex items-center justify-between px-4 py-1.5 border-b border-border bg-muted/20 shrink-0" aria-label="Candidate search context">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{activeItems.length ? "Filtered view" : "Default view"}</span>
        <strong className="text-foreground font-medium">
          {data.matchingCount.toLocaleString("en-US")} matching candidates from{" "}
          {data.role === "staff" && data.visibility === "assigned" ? "your assigned production records" : "all production data"}
        </strong>
      </div>
      <nav className="flex items-center gap-1 text-xs" aria-label="Active candidate filters">
        {data.role === "staff" ? (
          <>
            <Button
              variant={data.visibility === "all" ? "default" : "outline"}
              size="sm"
              className="h-6 text-[11px] px-2"
              asChild
            >
              <Link href={candidateSearchHref(basePath, params, { view: "", candidate: "" })}>
                All production
              </Link>
            </Button>
            <Button
              variant={data.visibility === "assigned" ? "default" : "outline"}
              size="sm"
              className="h-6 text-[11px] px-2"
              asChild
            >
              <Link href={candidateSearchHref(basePath, params, { view: "assigned", candidate: "" })}>
                Assigned to me
              </Link>
            </Button>
          </>
        ) : null}
        {activeItems.map((item) => (
          <Button key={`${item.key}-${item.label}`} variant="secondary" size="sm" className="h-6 text-[11px] px-2 gap-1" asChild>
            <Link href={candidateSearchHref(basePath, params, { [item.key]: "", candidate: "" })}>
              {item.label}
              <span className="ml-1 text-muted-foreground">×</span>
            </Link>
          </Button>
        ))}
        {activeItems.length ? (
          <Button variant="ghost" size="sm" className="text-[11px] h-6 px-2" asChild>
            <Link href={basePath}>Clear all</Link>
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="text-[11px] h-6 px-2" asChild>
            <Link href={candidateSearchHref(basePath, params, { filter: "needs-review", candidate: "" })}>
              Review queue
            </Link>
          </Button>
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
    <section className="py-1">
      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1 px-1">{facet.label}</h3>
      <div className="space-y-0.5">
        {facet.options.map((option) => (
          <Link
            className={`flex items-center justify-between px-2 py-1 rounded text-xs transition-colors ${option.active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
            href={candidateSearchHref(basePath, params, { [facet.key]: option.active ? "" : option.value, candidate: "" })}
            key={option.value}
          >
            <span>{option.label}</span>
            <strong className="ml-2 text-muted-foreground">{option.count}</strong>
          </Link>
        ))}
      </div>
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

// =============================================================================
// Quick facet chips (exported for testing)
// =============================================================================

export const QUICK_FACET_KEYS = ["country", "skill", "company", "university"];

export function FacetChips({
  basePath,
  data,
  params
}: {
  basePath: "/admin/candidates" | "/staff/candidates";
  data: CandidateSearchData;
  params: CandidateSearchParams;
}) {
  const quickFacets = data.facets.filter((facet) =>
    QUICK_FACET_KEYS.includes(facet.key)
  );
  const activeCount = data.facets.reduce(
    (count, facet) => count + facet.options.filter((o) => o.active).length,
    0
  );

  if (quickFacets.length === 0) return null;
  if (quickFacets.every((f) => f.options.length === 0)) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-4 py-1.5">
      {quickFacets.map((facet) => {
        const options = facet.options.slice(0, 6);
        return (
          <div key={facet.key} className="flex items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground mr-1">{facet.label}</span>
            {options.filter((o) => o.count > 0).map((option) => (
              <Link
                key={option.value}
                className={`chip px-2 py-0.5 rounded text-xs border transition-colors inline-flex items-center gap-1 ${
                  option.active
                    ? "chip active bg-primary/10 border-primary/30 text-primary font-medium"
                    : "bg-card border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
                href={candidateSearchHref(basePath, params, { [facet.key]: option.active ? "" : option.value, candidate: "" })}
              >
                <span>{option.label}</span>
                {option.count > 0 && <strong className="text-[10px] opacity-70">{option.count}</strong>}
                {option.active ? <span className="text-[10px] ml-0.5">×</span> : null}
              </Link>
            ))}
          </div>
        );
      })}
      {activeCount > 1 ? (
        <Link href={basePath} className="text-xs text-muted-foreground hover:text-foreground ml-2 underline underline-offset-2">
          Clear all
        </Link>
      ) : null}
    </div>
  );
}
