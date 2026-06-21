"use client";

import type { Route } from "next";
import Link from "next/link";
import type { SessionUser } from "@/modules/auth/types";
import { useWorkspaceOS } from "@/modules/workspace/WorkspaceOSContext";
import { HubShortcuts, type HubCommand } from "./HubShortcuts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type HubNavigationItem = {
  label: string;
  description: string;
  href: Route;
};

type HubScopeItem = {
  value: string;
  label: string;
};

type HubQueue = {
  label: string;
  value: number;
  note: string;
  href?: Route;
  tone: string;
};

type HubResult = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  meta: string;
  href?: Route;
};

export type HubContentData = {
  query: string;
  scope: string;
  scopes: HubScopeItem[];
  navigation: HubNavigationItem[];
  queues: HubQueue[];
  system: { label: string; value: number; note: string }[];
  results: HubResult[];
  preview: HubPreview | null;
};

type HubPreviewAction = { label: string; href: string };
type HubPreviewFact = { label: string; value: string | number };
type HubPreviewRelatedRow = {
  id: string | number;
  title: string;
  subtitle: string;
  meta: string;
  href?: Route;
};
type HubPreviewRelated = {
  title: string;
  rows: HubPreviewRelatedRow[];
};

type HubPreview = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  meta: string;
  href?: Route;
  actions: HubPreviewAction[];
  flags: string[];
  facts: HubPreviewFact[];
  related: HubPreviewRelated[];
};

type RoleJourney = {
  kicker: string;
  title: string;
  description: string;
  steps: string[];
  href: Route;
  action: string;
};

type RoleGuide = {
  title: string;
  description: string;
  guardrail: string;
  primary: { label: string; href: Route };
  journeys: RoleJourney[];
};

export function HubContent({
  data,
  guide,
  commands,
  session,
  requiredRole,
}: {
  data: HubContentData;
  guide: RoleGuide;
  commands: HubCommand[];
  session: SessionUser;
  requiredRole?: string | null;
}) {
  const { embedded } = useWorkspaceOS();
  const hubContext = hubContextHref(data.query, data.scope);

  const desk = (
    <div className="min-w-0 grid grid-rows-[auto_1fr] min-h-svh">
      {/* ── Topbar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 min-h-16 flex items-center gap-2.5 border-b border-border bg-card/92 px-3.5 py-2.5">
        <div className="min-w-0 grid gap-0.5">
          <span className="text-[#1f73b7] text-[11px] font-extrabold uppercase tracking-wide">
            {session.role}
          </span>
          <strong className="truncate text-sm">{session.name}</strong>
          <small className="truncate text-muted-foreground text-xs">{session.email}</small>
        </div>
        <form className="flex-1 flex max-w-xl min-w-0 ml-auto">
          <div className="flex items-center flex-1 min-w-0 border border-border rounded-lg bg-card focus-within:border-ring focus-within:shadow-sm transition-colors">
            <input
              aria-label="Find records"
              data-command-search
              defaultValue={data.query}
              id="hub-search"
              name="q"
              placeholder="Search candidates, companies, requests, transfers, ID batches"
              className="flex-1 min-w-0 h-[42px] bg-transparent border-0 px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <input type="hidden" name="scope" value={data.scope} />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="h-[42px] rounded-l-none border-l border-border text-muted-foreground hover:text-[#1f73b7]"
            >
              Search
            </Button>
          </div>
        </form>
        {embedded ? null : <HubShortcuts commands={commands} />}
      </header>

      {/* ── Main content ───────────────────────────────────── */}
      <div className="w-full min-w-0 min-h-0 overflow-y-auto mx-auto" style={{ maxWidth: "1500px" }}>
        <div className="grid content-start gap-3 p-3.5">
          {requiredRole && requiredRole !== session.role ? (
            <div className="flex items-center justify-between gap-3.5 border border-[#b42318]/30 rounded-xl bg-[#b42318]/8 p-3.5">
              <div className="grid gap-1">
                <span className="text-[#b42318] text-[11px] font-extrabold uppercase">
                  Access boundary
                </span>
                <strong className="text-foreground">
                  You are signed in as {session.role}, not {requiredRole}.
                </strong>
                <p className="text-muted-foreground text-sm m-0">
                  Use the matching production credentials to enter that workspace. This keeps
                  candidate, staff, company, and admin data separated.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild className="shrink-0">
                <Link href="/login">Switch account</Link>
              </Button>
            </div>
          ) : null}

          {/* ── Hero section ─────────────────────────────────── */}
          <section className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-3.5 border border-border rounded-xl bg-card p-5">
            <div>
              <span className="text-[#1f73b7] text-[11px] font-extrabold uppercase tracking-wide">
                Start here
              </span>
              <h1 className="text-[clamp(22px,2.5vw,30px)] leading-[1.06] font-bold text-foreground mt-1.5 mb-2.5 max-w-[860px]">
                {guide.title}
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-[780px] mb-0">
                {guide.description}
              </p>
              <div className="flex flex-wrap gap-2.5 mt-[18px]">
                <Button asChild>
                  <Link href={guide.primary.href}>{guide.primary.label}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={hubContext}>Open focused search</Link>
                </Button>
              </div>
            </div>
            <Card className="self-start">
              <CardContent className="p-3.5">
                <span className="text-[#1f73b7] text-[11px] font-extrabold uppercase tracking-wide">
                  Signed in as {session.role}
                </span>
                <strong className="block text-lg text-foreground mt-1">{session.name}</strong>
                <p className="text-muted-foreground text-xs leading-relaxed mt-1 mb-0">
                  {guide.guardrail}
                </p>
              </CardContent>
            </Card>
          </section>

          {/* ── Role journeys ────────────────────────────────── */}
          <section
            className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-2.5"
            aria-label={`${session.role} workflows`}
          >
            {guide.journeys.map((journey) => (
              <Card key={journey.title} className="grid grid-rows-[auto_1fr_auto] gap-2.5 p-4">
                <CardHeader className="p-0 gap-1.5">
                  <Badge variant="secondary" className="self-start text-[11px] font-extrabold uppercase tracking-wide">
                    {journey.kicker}
                  </Badge>
                  <CardTitle className="text-[17px] leading-snug">{journey.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {journey.description}
                  </CardDescription>
                </CardHeader>
                <ol className="grid gap-2 list-none m-0 p-0">
                  {journey.steps.map((step, index) => (
                    <li key={step} className="grid grid-cols-[24px_1fr] items-center gap-2">
                      <span className="size-6 inline-flex items-center justify-center rounded-full bg-[#1f73b7]/10 text-[#1f73b7] text-xs font-extrabold">
                        {index + 1}
                      </span>
                      <strong className="text-foreground text-[13px] leading-tight">{step}</strong>
                    </li>
                  ))}
                </ol>
                <Button variant="default" asChild className="w-full">
                  <Link href={journey.href}>{journey.action}</Link>
                </Button>
              </Card>
            ))}
          </section>

          {/* ── Workbench ────────────────────────────────────── */}
          <section
            className="grid grid-cols-1 md:grid-cols-[minmax(260px,0.68fr)_minmax(380px,1.32fr)] gap-2.5"
            aria-label="Search and live queues"
          >
            {/* Live queues */}
            <Card>
              <CardHeader className="pb-2">
                <span className="text-[#1f73b7] text-[11px] font-extrabold uppercase tracking-wide">
                  Live queues
                </span>
                <CardTitle className="text-[17px]">What needs attention</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-2">
                  {data.queues.map((queue) => {
                    const content = (
                      <div className="min-h-[104px] grid content-center gap-1.5 border-r border-b border-border p-3 last:border-r-0 [&:nth-child(2n)]:border-r-0">
                        <span className="text-[#1f73b7] text-[11px] font-extrabold uppercase tracking-wide">
                          {queue.label}
                        </span>
                        <strong className="text-foreground text-2xl leading-none">
                          {queue.value.toLocaleString("en-US")}
                        </strong>
                        <small className="text-muted-foreground text-xs leading-snug">
                          {queue.note}
                        </small>
                      </div>
                    );
                    return queue.href ? (
                      <Link
                        className="block no-underline hover:bg-muted/30 transition-colors [&>div]:border-r-0"
                        href={queue.href as Route}
                        key={queue.label}
                      >
                        {content}
                      </Link>
                    ) : (
                      <div key={queue.label}>{content}</div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Search results */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <div>
                  <span className="text-[#1f73b7] text-[11px] font-extrabold uppercase tracking-wide">
                    {data.scope}
                  </span>
                  <CardTitle className="text-[17px]">
                    {data.query
                      ? `Search results for ${data.query}`
                      : "Find a record"}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <nav
                  className="flex gap-2 overflow-x-auto border-b border-border px-3 py-2.5"
                  aria-label="Search scopes"
                >
                  {data.scopes.map((item) => {
                    const query = data.query
                      ? `&q=${encodeURIComponent(data.query)}`
                      : "";
                    return (
                      <Link
                        className={cn(
                          "inline-flex items-center min-h-8 px-2.5 rounded-lg text-sm font-bold no-underline whitespace-nowrap transition-colors border border-border",
                          item.value === data.scope
                            ? "border-[#1f73b7] bg-[#1f73b7]/10 text-[#1f73b7]"
                            : "text-foreground hover:border-[#1f73b7] hover:text-[#1f73b7]"
                        )}
                        href={`/app?scope=${item.value}${query}` as Route}
                        key={item.value}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="grid p-2">
                  {data.results.slice(0, 6).map((result) => (
                    <Link
                      className="grid grid-cols-[90px_1fr_120px] items-center gap-3 rounded-lg px-2.5 py-2.5 no-underline text-foreground hover:bg-muted/50 transition-colors"
                      href={hubRecordHref(data.query, data.scope, result.id)}
                      key={result.id}
                    >
                      <span className="text-[#1f73b7] text-[11px] font-extrabold uppercase tracking-wide truncate">
                        {result.type}
                      </span>
                      <strong className="truncate text-sm">{result.title}</strong>
                      <small className="text-muted-foreground text-xs truncate">
                        {result.meta}
                      </small>
                    </Link>
                  ))}
                  {data.results.length === 0 ? (
                    <p className="text-muted-foreground text-xs p-2.5 m-0">
                      No matching records for this login and scope.
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            {/* ── Preview ──────────────────────────────────────── */}
            {data.preview ? <RecordPreview preview={data.preview} /> : null}
          </section>
        </div>
      </div>
    </div>
  );

  return desk;
}

function RecordPreview({ preview }: { preview: HubPreview }) {
  return (
    <Card className="col-span-full overflow-hidden">
      <CardHeader className="gap-1 pb-2">
        <span className="text-[#1f73b7] text-[11px] font-extrabold uppercase tracking-wide">
          {preview.type}
        </span>
        <CardTitle className="text-xl">{preview.title}</CardTitle>
        <p className="text-muted-foreground text-sm mb-0">{preview.subtitle}</p>
        <small className="text-muted-foreground text-xs">{preview.meta}</small>
      </CardHeader>

      {preview.flags.length ? (
        <CardContent className="flex flex-wrap gap-2 border-t border-border pt-3 pb-3">
          {preview.flags.map((flag) => (
            <Badge key={flag} variant="secondary">
              {flag}
            </Badge>
          ))}
        </CardContent>
      ) : null}

      {preview.actions.length ? (
        <CardContent className="flex flex-wrap gap-2 border-t border-border pt-3 pb-3">
          {preview.actions.map((action) => (
            <Button key={`${action.label}-${action.href}`} variant="outline" size="sm" asChild>
              <a href={action.href}>{action.label}</a>
            </Button>
          ))}
        </CardContent>
      ) : null}

      <CardContent className="grid grid-cols-2 border-t border-border">
        {preview.facts.map((fact) => (
          <div
            key={fact.label}
            className="min-h-[64px] grid content-center gap-1.5 border-r border-b border-border p-3 last:border-r-0 [&:nth-child(2n)]:border-r-0"
          >
            <span className="text-[#1f73b7] text-[11px] font-extrabold uppercase tracking-wide">
              {fact.label}
            </span>
            <strong className="text-foreground text-sm truncate">{fact.value}</strong>
          </div>
        ))}
      </CardContent>

      {preview.related.length ? (
        <div className="border-t border-border">
          {preview.related.map((section) => (
            <section key={section.title}>
              <div className="flex items-center justify-between gap-3 min-h-[42px] px-3 border-b border-border">
                <span className="text-[#1f73b7] text-[11px] font-extrabold uppercase tracking-wide">
                  Related
                </span>
                <h3 className="text-sm font-semibold m-0">{section.title}</h3>
              </div>
              {section.rows.length ? (
                <div className="grid">
                  {section.rows.map((row) =>
                    row.href ? (
                      <Link
                        className="grid gap-1 min-h-[58px] px-3 py-2.5 no-underline text-foreground hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
                        href={row.href}
                        key={row.id}
                      >
                        <strong className="truncate text-sm">{row.title}</strong>
                        <span className="truncate text-muted-foreground text-xs">
                          {row.subtitle}
                        </span>
                        <small className="truncate text-muted-foreground text-[11px]">
                          {row.meta}
                        </small>
                      </Link>
                    ) : (
                      <div
                        className="grid gap-1 min-h-[58px] px-3 py-2.5 border-b border-border last:border-b-0"
                        key={row.id}
                      >
                        <strong className="truncate text-sm">{row.title}</strong>
                        <span className="truncate text-muted-foreground text-xs">
                          {row.subtitle}
                        </span>
                        <small className="truncate text-muted-foreground text-[11px]">
                          {row.meta}
                        </small>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs p-3 m-0">
                  No related records visible to this login.
                </p>
              )}
            </section>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

function hubContextHref(query: string, scope: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  params.set("scope", scope);
  return `/app?${params.toString()}` as Route;
}

function hubRecordHref(query: string, scope: string, record: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  params.set("scope", scope);
  params.set("record", record);
  return `/app?${params.toString()}` as Route;
}
