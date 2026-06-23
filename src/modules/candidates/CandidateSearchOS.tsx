"use client";

import { useRouter } from "next/navigation";
import { useTransition, useCallback, useRef, useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { logoutAction } from "@/modules/auth/actions";
import type { SessionUser } from "@/modules/auth/types";
import { HubShortcuts, type HubCommand } from "@/modules/hub/HubShortcuts";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { CandidateProfile } from "./CandidateProfile";
import { ExportCVsForm } from "./ExportCVsForm";
import type {
  CandidateSearchFacet,
  CandidateSearchFilter,
  CandidateSearchParams,
  CandidateSearchFacetKey,
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

export const QUICK_FACET_KEYS: CandidateSearchFacetKey[] = ["country", "skill", "company", "university"];

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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(data.query ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commands = buildCandidateSearchCommands(data, basePath, params);
  const selectedIds = params.selectedIds ?? [];
  const selectedRows = data.rows.filter((row) => selectedIds.includes(row.id));
  const facetGroups = [...data.facets].sort((a, b) => Number(hasActiveFacet(b)) - Number(hasActiveFacet(a)));
  const activeFacetCount = data.facets.reduce((count, facet) => count + facet.options.filter((option) => option.active).length, 0);

  // Sync searchValue on initial data fetch (SSR navigation)
  useEffect(() => {
    setSearchValue(data.query ?? "");
  }, [data.query]);

  const navigate = useCallback(
    (overrides: Partial<Record<CandidateSearchParamKey, string>>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      startTransition(() => {
        router.replace(candidateSearchHref(basePath, params, overrides));
      });
    },
    [basePath, params, router, startTransition]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        navigate({ q: value || "" });
      }, 300);
    },
    [navigate]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <main className="flex flex-col gap-3 min-h-svh bg-background">
      {/* Topbar */}
      <header className="flex items-center gap-3 px-4 py-2 border-b bg-card sticky top-0 z-10">
        <Link className="flex items-center gap-1.5 font-semibold text-sm no-underline shrink-0" href={homePath}>
          <span className="text-primary">SH</span>
          <strong className="text-foreground">Candidates</strong>
        </Link>
        <div className="flex flex-1 items-center gap-2 max-w-xl" id="candidate-search">
          <div className="relative flex-1">
            <Input
              data-command-search
              id="candidate-query"
              name="q"
              placeholder="Search name, email, phone, ID, skill, tag"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1 pr-8"
            />
            {isPending && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs animate-pulse">
                ...
              </span>
            )}
          </div>
          {params.visibility === "assigned" ? <input name="view" type="hidden" value="assigned" /> : null}
          {data.openTabs.length ? <input name="tabs" type="hidden" value={data.openTabs.map((tab) => tab.id).join(",")} /> : null}
          {selectedIds.length ? <input name="selected" type="hidden" value={selectedIds.join(",")} /> : null}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <HubShortcuts commands={commands} />
          <ThemeToggle />
          <div className="flex items-center gap-1 text-xs text-muted-foreground" title={session.email}>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{session.role}</Badge>
            <strong className="text-foreground text-sm font-medium">{session.name}</strong>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm">Sign out</Button>
          </form>
        </div>
      </header>

      <ActiveSearchContext basePath={basePath} data={data} params={params} />
      <BulkCandidateBar basePath={basePath} params={params} selectedIds={selectedIds} selectedRows={selectedRows} />

      <section className="flex flex-1 gap-0 px-4 pb-4">
        <section className="flex flex-col flex-1 gap-3" aria-label="Open candidate tabs">
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
              onNavigate={navigate}
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
  selectedIds,
  onNavigate
}: {
  activeFacetCount: number;
  basePath: "/admin/candidates" | "/staff/candidates";
  data: CandidateSearchData;
  facetGroups: CandidateSearchFacet[];
  params: CandidateSearchParams;
  selectedIds: number[];
  onNavigate: (overrides: Partial<Record<CandidateSearchParamKey, string>>) => void;
}) {
  return (
    <section className="flex flex-col gap-2" aria-label="Candidate search and filters">
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="flex flex-row items-center justify-between px-0 pt-0 pb-2">
          <div>
            <span className="text-xs text-muted-foreground">Search tab</span>
            <strong className="block text-sm">{data.query ? `Results for ${data.query}` : "Candidate search"}</strong>
          </div>
          <small className="text-xs text-muted-foreground">
            {data.rows.length.toLocaleString("en-US")} of {data.matchingCount.toLocaleString("en-US")}
          </small>
        </CardHeader>
      </Card>

      {/* Quick facet chips */}
      <FacetChips basePath={basePath} data={data} params={params} onNavigate={onNavigate} />

      {/* Power filters */}
      <details className="border rounded-md px-3 py-2 text-sm bg-card">
        <summary className="cursor-pointer font-medium flex items-center gap-2">
          <span>Filters</span>
          <Badge variant={activeFacetCount > 0 ? "warning" : "secondary"} className="text-[10px]">
            {activeFacetCount ? `${activeFacetCount} active` : "Open power filters"}
          </Badge>
        </summary>
        <section className="flex flex-wrap gap-3 pt-3" aria-label="Candidate power filters">
          {facetGroups.map((facet) => (
            <FacetGroup basePath={basePath} facet={facet} key={facet.key} onNavigate={onNavigate} params={params} />
          ))}
        </section>
      </details>

      {/* Filter nav */}
      <nav className="flex gap-1 flex-wrap" aria-label="Candidate search filters">
        {candidateFilterLinks.map((item) => (
          <a
            className={cn(
              buttonVariants({ variant: item.value === data.filter ? "default" : "ghost", size: "sm" }),
              "text-xs no-underline cursor-pointer"
            )}
            href={candidateSearchHref(basePath, params, { filter: item.value, candidate: "" })}
            key={item.value}
            onClick={(e) => {
              e.preventDefault();
              onNavigate({ filter: item.value, candidate: "" });
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* Blocked notice */}
      {data.selectedBlocked ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col gap-1 p-3 text-sm">
            <strong className="text-destructive">Candidate unavailable</strong>
            <span className="text-muted-foreground text-xs">This record is missing, deleted, or outside the candidates visible to this login.</span>
          </CardContent>
        </Card>
      ) : null}

      {/* Results */}
      <div className="flex flex-col gap-2">
        {data.rows.map((row) => (
          <article
            className={cn(
              "flex border rounded-md overflow-hidden bg-card",
              row.id === data.selectedId && "ring-1 ring-primary"
            )}
            key={row.id}
          >
            <Link
              className="flex flex-col items-center justify-center w-8 shrink-0 border-r hover:bg-muted transition-colors no-underline"
              href={candidateSearchHref(basePath, params, { selected: toggleCandidateId(selectedIds, row.id).join(",") })}
            >
              <span aria-hidden="true" className="text-xs">{selectedIds.includes(row.id) ? "✓" : ""}</span>
              <small className="text-[10px] text-muted-foreground">{selectedIds.includes(row.id) ? "Selected" : "Select"}</small>
            </Link>
            <Link
              className="flex flex-col flex-1 p-2 hover:bg-muted/50 transition-colors no-underline gap-0.5"
              href={candidateSearchHref(basePath, params, { candidate: String(row.id) })}
            >
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                  {candidateInitials(row.name)}
                </span>
                <div className="flex flex-col leading-tight">
                  <strong className="text-sm text-foreground">{row.name}</strong>
                  <small className="text-xs text-muted-foreground">{row.email}</small>
                </div>
                <Badge variant="secondary" className="ml-auto text-[10px]">{row.status}</Badge>
              </div>
              <div className="flex gap-2 text-[11px] text-muted-foreground mt-1">
                <span>{row.signal}</span>
                <span>{row.country}</span>
                <span>{row.updated}</span>
              </div>
              <div className="flex gap-1 mt-1 flex-wrap">
                {[...row.flags, ...row.skills].slice(0, 3).map((flag) => (
                  <Badge key={flag} variant="outline" className="text-[10px]">{flag}</Badge>
                ))}
              </div>
            </Link>
          </article>
        ))}
        {data.rows.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-1 p-6 text-center">
              <strong className="text-sm text-muted-foreground">No candidates match this search.</strong>
              <span className="text-xs text-muted-foreground">Remove a facet or search a different name, email, phone, skill, or candidate ID.</span>
            </CardContent>
          </Card>
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
    <Card className="mx-4 border-primary/30">
      <CardContent className="flex items-center gap-3 p-2 text-sm">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-muted-foreground">Selection</span>
          <strong>{selectedIds.length.toLocaleString("en-US")} selected</strong>
        </div>
        <nav className="flex gap-1 flex-wrap" aria-label="Selected candidate actions">
          <Link className={buttonVariants({ variant: "link", size: "sm" })} href={candidateSearchHref(basePath, params, { tabs: selectedValue, candidate: String(selectedIds[0] ?? ""), selected: selectedValue })}>Open as tabs</Link>
          {selectedIds.length === 2 ? <Link className={buttonVariants({ variant: "link", size: "sm" })} href={candidateSearchHref(basePath, params, { selected: selectedValue })}>Merge review</Link> : null}
          {loadedEmailRecipients ? <a className={buttonVariants({ variant: "link", size: "sm" })} href={`mailto:${loadedEmailRecipients}`}>Email loaded</a> : null}
          <Link className={buttonVariants({ variant: "link", size: "sm" })} href={candidateSearchHref(basePath, params, { selected: selectedValue })}>Generate ID batch</Link>
          <ExportCVsForm candidateIds={selectedValue} />
          <Link className={buttonVariants({ variant: "link", size: "sm" })} href={candidateSearchHref(basePath, params, { selected: "" })}>Deselect</Link>
        </nav>
      </CardContent>
    </Card>
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
    <nav className="flex gap-1 border-b pb-1" aria-label="Open candidate tabs">
      <Link
        className={cn(
          buttonVariants({ variant: !data.selectedId ? "default" : "ghost", size: "sm" }),
          "text-xs"
        )}
        href={candidateSearchHref(basePath, params, { candidate: "" })}
      >
        Search
      </Link>
      {data.openTabs.map((tab) => {
        const remainingTabs = data.openTabs.filter((item) => item.id !== tab.id).map((item) => item.id);
        const nextCandidate = data.selectedId === tab.id ? remainingTabs.at(-1) : data.selectedId;
        return (
          <span className={cn("flex items-center gap-0.5", data.selectedId === tab.id && "border-b-2 border-primary")} key={tab.id}>
            <Link
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs")}
              href={candidateSearchHref(basePath, params, { candidate: String(tab.id), tabs: data.openTabs.map((item) => item.id).join(",") })}
            >
              <strong>{tab.title}</strong>
              <small className="ml-1 text-muted-foreground">{tab.status}</small>
            </Link>
            <Link
              aria-label={`Close ${tab.title}`}
              className={buttonVariants({ variant: "ghost", size: "sm" }) + " px-1 text-muted-foreground hover:text-foreground no-underline"}
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
  ].filter((item): item is { key: Exclude<CandidateSearchParamKey, "candidate" | "tabs" | "selected">; label: string } => Boolean(item));

  return (
    <Card className="mx-4 border-0 shadow-none bg-muted/30">
      <CardContent className="flex items-center gap-2 p-2 text-sm">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-muted-foreground">{activeItems.length ? "Filtered view" : "Default view"}</span>
          <strong className="text-xs font-medium">
            {data.matchingCount.toLocaleString("en-US")} matching candidates from{" "}
            {data.role === "staff" && data.visibility === "assigned" ? "your assigned production records" : "all production data"}
          </strong>
        </div>
        <nav className="flex gap-1 flex-wrap" aria-label="Active candidate filters">
          {data.role === "staff" ? (
            <>
              <Link className={cn(buttonVariants({ variant: data.visibility === "all" ? "default" : "ghost", size: "sm" }), "text-xs")} href={candidateSearchHref(basePath, params, { view: "", candidate: "" })}>
                All production
              </Link>
              <Link className={cn(buttonVariants({ variant: data.visibility === "assigned" ? "default" : "ghost", size: "sm" }), "text-xs")} href={candidateSearchHref(basePath, params, { view: "assigned", candidate: "" })}>
                Assigned to me
              </Link>
            </>
          ) : null}
          {activeItems.map((item) => (
            <Link className={buttonVariants({ variant: "outline", size: "sm" }) + " text-xs no-underline"} href={candidateSearchHref(basePath, params, { [item.key]: "", candidate: "" })} key={`${item.key}-${item.label}`}>
              <Badge variant="secondary" className="text-[10px] mr-1">{item.label}</Badge>
            </Link>
          ))}
          {activeItems.length ? (
            <Link className={buttonVariants({ variant: "link", size: "sm" }) + " text-xs"} href={basePath}>Clear all</Link>
          ) : (
            <Link className={buttonVariants({ variant: "link", size: "sm" }) + " text-xs"} href={candidateSearchHref(basePath, params, { filter: "needs-review", candidate: "" })}>Review queue</Link>
          )}
        </nav>
      </CardContent>
    </Card>
  );
}

const candidateFilterLinks: { label: string; value: CandidateSearchFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Needs review", value: "needs-review" },
  { label: "Incomplete", value: "incomplete" },
  { label: "Civil ID", value: "civil-id" }
];

export function FacetGroup({
  basePath,
  facet,
  params,
  onNavigate,
}: {
  basePath: "/admin/candidates" | "/staff/candidates";
  facet: CandidateSearchFacet;
  params: CandidateSearchParams;
  onNavigate?: (overrides: Partial<Record<CandidateSearchParamKey, string>>) => void;
}) {
  return (
    <Card className="min-w-[160px] flex-1">
      <CardHeader className="p-2 pb-0">
        <h3 className="text-xs font-semibold text-foreground">{facet.label}</h3>
      </CardHeader>
      <CardContent className="p-2 flex flex-col gap-0.5">
        {facet.options.map((option) => (
          <a
            className={cn(
              buttonVariants({ variant: option.active ? "default" : "ghost", size: "sm" }),
              "justify-between text-xs w-full no-underline cursor-pointer"
            )}
            href={candidateSearchHref(basePath, params, { [facet.key]: option.active ? "" : option.value, candidate: "" })}
            key={option.value}
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.({ [facet.key]: option.active ? "" : option.value, candidate: "" });
            }}
          >
            <span>{option.label}</span>
            <strong className="text-[10px] text-muted-foreground">{option.count}</strong>
          </a>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * FacetChips renders quick inline facet controls for country, university,
 * skills, and company — clickable chips that filter results via URL params.
 */
export function FacetChips({
  basePath,
  data,
  params,
  onNavigate,
}: {
  basePath: string;
  data: { facets: CandidateSearchFacet[] };
  params: CandidateSearchParams;
  onNavigate?: (overrides: Partial<Record<CandidateSearchParamKey, string>>) => void;
}) {
  // Find quick facet groups
  const quickFacets = data.facets.filter((f) =>
    QUICK_FACET_KEYS.includes(f.key),
  );

  // Filter out groups with zero options
  const populated = quickFacets.filter((f) => f.options.length > 0);

  if (populated.length === 0) return null;

  const MAX_VISIBLE = 6;
  const activeCount = data.facets.reduce(
    (sum, f) => sum + f.options.filter((o) => o.active).length,
    0,
  );

  return (
    <div className="flex flex-wrap gap-1">
      {populated.map((facet) => (
        <div key={facet.key} className="flex items-center gap-0.5">
          <span className="text-xs text-muted-foreground mr-1">{facet.label}:</span>
          {facet.options.slice(0, MAX_VISIBLE).map((opt) => {
            const isActive = opt.active;
            return (
              <a
                key={opt.value}
                href={`${basePath}?${facet.key}=${opt.value}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.({ [facet.key]: isActive ? "" : opt.value, candidate: "" });
                }}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors no-underline",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                )}
              >
                {opt.label}
                {opt.count > 0 && (
                  <span className="text-[10px] opacity-70">{opt.count}</span>
                )}
                {isActive && (
                  <span className="text-[10px] ml-0.5" aria-label="Remove filter">✕</span>
                )}
              </a>
            );
          })}
        </div>
      ))}
      {activeCount > 1 && (
        <a
          href={basePath}
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.({
              q: "",
              country: "",
              university: "",
              company: "",
              skill: "",
              gender: "",
              profile: "",
              assignment: "",
              document: "",
              candidate: "",
            });
          }}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 ml-1"
          role="link"
          aria-label="Clear all"
        >
          Clear all
        </a>
      )}
    </div>
  );
}

export function candidateSearchHref(
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

export function toggleCandidateId(ids: number[], id: number) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

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
