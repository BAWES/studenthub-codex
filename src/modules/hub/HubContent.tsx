"use client";

import type { Route } from "next";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import type { SessionUser } from "@/modules/auth/types";
import { useWorkspaceOS } from "@/modules/workspace/WorkspaceOSContext";
import { HubShortcuts, type HubCommand } from "./HubShortcuts";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

type HubSystemItem = {
  label: string;
  value: number;
  note: string;
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

export type HubContentData = {
  query: string;
  scope: string;
  scopes: HubScopeItem[];
  navigation: HubNavigationItem[];
  queues: HubQueue[];
  system: HubSystemItem[];
  results: HubResult[];
  preview: HubPreview | null;
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
    <section className="min-w-0 overflow-x-hidden">
      {/* ── Topbar ──────────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card px-4 py-2.5 min-h-[64px]">
        <div className="min-w-0 grid gap-0.5">
          <span className="text-xs font-black uppercase tracking-wide text-blue-zendesk">
            {session.role}
          </span>
          <strong className="text-sm text-foreground truncate">{session.name}</strong>
          <small className="text-xs text-muted-foreground truncate">{session.email}</small>
        </div>

        <form className="flex items-center flex-1 max-w-lg">
          <div className="relative w-full">
            <Search
              aria-hidden="true"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              aria-label="Find records"
              data-command-search
              defaultValue={data.query}
              id="hub-search"
              name="q"
              placeholder="Search candidates, companies, requests, transfers, ID batches"
              className="h-10 pl-9 pr-3"
            />
          </div>
          <input type="hidden" name="scope" value={data.scope} />
          <Button type="submit" variant="ghost" size="sm" className="ml-2 shrink-0">
            Search
          </Button>
        </form>

        {embedded ? null : <HubShortcuts commands={commands} />}
      </header>

      <section className="grid content-start gap-4 p-4">
        {/* ── Role Access Boundary ────────────────────────── */}
        {requiredRole && requiredRole !== session.role ? (
          <section className="border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 rounded-lg p-4 grid gap-2" aria-label="Role access notice">
            <div className="grid gap-1">
              <span className="text-xs font-black uppercase tracking-wide text-amber-600 dark:text-amber-400">
                Access boundary
              </span>
              <strong className="text-sm text-foreground">
                You are signed in as {session.role}, not {requiredRole}.
              </strong>
              <p className="text-sm text-muted-foreground m-0">
                Use the matching production credentials to enter that workspace. This keeps candidate, staff, company, and admin data separated.
              </p>
            </div>
            <Link
              href="/login"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Switch account
            </Link>
          </section>
        ) : null}

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="grid md:grid-cols-[1fr_260px] gap-4 items-stretch">
          <Card className="p-5 grid content-center gap-3">
            <span className="text-xs font-black uppercase tracking-wide text-blue-zendesk">
              Start here
            </span>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight m-0 text-foreground">
              {guide.title}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-[640px] m-0">
              {guide.description}
            </p>
            <div className="flex flex-wrap gap-3 mt-1">
              <Link
                href={guide.primary.href}
                className={buttonVariants({ variant: "default", size: "default" })}
              >
                {guide.primary.label}
              </Link>
              <Link
                href={hubContext}
                className={buttonVariants({ variant: "outline", size: "default" })}
              >
                Open focused search
              </Link>
            </div>
          </Card>

          <aside className="border border-border rounded-lg bg-card p-4 grid content-start gap-2">
            <span className="text-xs font-black uppercase tracking-wide text-blue-zendesk">
              Signed in as {session.role}
            </span>
            <strong className="text-lg font-bold text-foreground">{session.name}</strong>
            <p className="text-sm text-muted-foreground m-0 leading-relaxed">{guide.guardrail}</p>
          </aside>
        </section>

        {/* ── Journey Grid ──────────────────────────────────── */}
        <section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
          aria-label={`${session.role} workflows`}
        >
          {guide.journeys.map((journey) => (
            <Card key={journey.title} className="grid content-start gap-0 overflow-hidden">
              <CardContent className="grid gap-2 p-4">
                <span className="text-xs font-black uppercase tracking-wide text-blue-zendesk">
                  {journey.kicker}
                </span>
                <strong className="text-base font-bold text-foreground">{journey.title}</strong>
                <p className="text-sm text-muted-foreground leading-relaxed m-0">
                  {journey.description}
                </p>
              </CardContent>
              <ol className="grid gap-px px-4 pb-2 m-0 list-none">
                {journey.steps.map((step, index) => (
                  <li key={step} className="flex items-start gap-2 text-sm text-muted-foreground py-1">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[11px] font-bold text-muted-foreground shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <div className="px-4 pb-4">
                <Link
                  href={journey.href}
                  className="text-blue-zendesk text-sm font-semibold gap-1 hover:underline inline-flex items-center no-underline"
                >
                  {journey.action}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </Card>
          ))}
        </section>

        {/* ── Workbench ─────────────────────────────────────── */}
        <section className="grid lg:grid-cols-2 gap-3" aria-label="Search and live queues">
          {/* Live queues */}
          <Card>
            <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
              <div className="grid gap-0.5">
                <span className="text-xs font-black uppercase tracking-wide text-blue-zendesk">
                  Live queues
                </span>
                <strong className="text-sm font-semibold text-foreground">What needs attention</strong>
              </div>
            </div>
            <CardContent className="grid grid-cols-2 gap-3 p-4">
              {data.queues.map((queue) => {
                const content = (
                  <div className="grid gap-1 p-3 rounded-lg border border-border bg-card">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      {queue.label}
                    </span>
                    <strong className="text-2xl font-bold text-foreground">
                      {queue.value.toLocaleString("en-US")}
                    </strong>
                    <small className="text-xs text-muted-foreground">{queue.note}</small>
                  </div>
                );
                return queue.href ? (
                  <Link href={queue.href as Route} key={queue.label} className="no-underline">
                    {content}
                  </Link>
                ) : (
                  <article key={queue.label}>{content}</article>
                );
              })}
            </CardContent>
          </Card>

          {/* Search results */}
          <Card>
            <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
              <div className="grid gap-0.5">
                <span className="text-xs font-black uppercase tracking-wide text-blue-zendesk">
                  {data.scope}
                </span>
                <strong className="text-sm font-semibold text-foreground">
                  {data.query ? `Search results for ${data.query}` : "Find a record"}
                </strong>
              </div>
            </div>

            <div className="px-4 py-3 border-b border-border">
              <nav className="flex flex-wrap gap-2" aria-label="Search scopes">
                {data.scopes.map((item) => {
                  const query = data.query ? `&q=${encodeURIComponent(data.query)}` : "";
                  return (
                    <Link
                      className={cn(
                        buttonVariants({ variant: item.value === data.scope ? "secondary" : "ghost" }),
                        "text-xs h-7 px-3"
                      )}
                      href={`/app?scope=${item.value}${query}` as Route}
                      key={item.value}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="grid divide-y divide-border">
              {data.results.slice(0, 6).map((result) => (
                <Link
                  href={hubRecordHref(data.query, data.scope, result.id)}
                  key={result.id}
                  className="grid gap-0.5 px-4 py-3 hover:bg-muted/50 transition-colors no-underline"
                >
                  <span className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                    {result.type}
                  </span>
                  <strong className="text-sm font-medium text-foreground">{result.title}</strong>
                  <small className="text-xs text-muted-foreground">{result.meta}</small>
                </Link>
              ))}
              {data.results.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground text-center m-0">
                  No matching records for this login and scope.
                </p>
              ) : null}
            </div>
          </Card>

          {data.preview ? <RecordPreview preview={data.preview} /> : null}
        </section>
      </section>
    </section>
  );

  return desk;
}

function RecordPreview({ preview }: { preview: HubPreview }) {
  return (
    <Card className="lg:col-span-2" aria-label="Selected record preview">
      <div className="grid gap-2 px-4 py-3 border-b border-border">
        <span className="text-xs font-black uppercase tracking-wide text-blue-zendesk">
          {preview.type}
        </span>
        <h2 className="text-lg font-bold m-0 text-foreground">{preview.title}</h2>
        <p className="text-sm text-muted-foreground m-0">{preview.subtitle}</p>
        <small className="text-xs text-muted-foreground">{preview.meta}</small>
      </div>

      {preview.flags.length ? (
        <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-border">
          {preview.flags.map((flag) => (
            <Badge key={flag} variant="secondary">
              {flag}
            </Badge>
          ))}
        </div>
      ) : null}

      {preview.actions.length ? (
        <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-border">
          {preview.actions.map((action) => (
            <Button key={`${action.label}-${action.href}`} variant="outline" size="sm" asChild>
              <a href={action.href}>{action.label}</a>
            </Button>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-4 py-3 border-b border-border">
        {preview.facts.map((fact) => (
          <div key={fact.label} className="grid gap-0.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase">{fact.label}</span>
            <strong className="text-sm font-medium text-foreground">{fact.value}</strong>
          </div>
        ))}
      </div>

      {preview.related.length ? (
        <div className="grid gap-0">
          {preview.related.map((section) => (
            <div key={section.title} className="border-b border-border last:border-b-0">
              <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                <span className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                  Related
                </span>
                <h3 className="text-sm font-semibold text-foreground m-0">{section.title}</h3>
              </div>
              <div className="grid divide-y divide-border">
                {section.rows.length ? (
                  section.rows.map((row) =>
                    row.href ? (
                      <Link className="grid gap-0.5 px-4 py-2.5 hover:bg-muted/50 transition-colors no-underline" href={row.href} key={row.id}>
                        <strong className="text-sm font-medium text-foreground">{row.title}</strong>
                        <span className="text-xs text-muted-foreground">{row.subtitle}</span>
                        <small className="text-xs text-muted-foreground/70">{row.meta}</small>
                      </Link>
                    ) : (
                      <article key={row.id} className="grid gap-0.5 px-4 py-2.5">
                        <strong className="text-sm font-medium text-foreground">{row.title}</strong>
                        <span className="text-xs text-muted-foreground">{row.subtitle}</span>
                        <small className="text-xs text-muted-foreground/70">{row.meta}</small>
                      </article>
                    )
                  )
                ) : (
                  <p className="px-4 py-3 text-sm text-muted-foreground m-0">
                    No related records visible to this login.
                  </p>
                )}
              </div>
            </div>
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
