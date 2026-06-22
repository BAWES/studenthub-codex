"use client";

import type { Route } from "next";
import Link from "next/link";
import type { SessionUser } from "@/modules/auth/types";
import { useWorkspaceOS } from "@/modules/workspace/WorkspaceOSContext";
import { HubShortcuts, type HubCommand } from "./HubShortcuts";
<<<<<<< HEAD
=======
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
>>>>>>> origin/develop
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
<<<<<<< HEAD
    <section className="min-w-0 grid grid-rows-[auto_1fr] min-h-svh">
      <header className="sticky top-0 z-20 min-h-16 grid grid-cols-[220px_minmax(280px,1fr)_auto] items-center gap-2.5 border-b border-border bg-card px-3.5 py-2.5">
        <div className="min-w-0 grid gap-0.5">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-muted-foreground">{session.role}</span>
          <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-foreground">{session.name}</strong>
          <small className="overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground">{session.email}</small>
        </div>
        <form className="grid grid-cols-[1fr_auto] overflow-hidden rounded-lg border border-input bg-background has-[input:focus]:border-primary has-[input:focus]:shadow-[0_0_0_2px_hsl(var(--primary)/0.15)]" action={undefined}>
=======
    <section className="flex flex-1 flex-col min-w-0">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="uppercase text-xs tracking-wider">
            {session.role}
          </Badge>
          <div className="flex flex-col">
            <strong className="text-sm text-foreground">{session.name}</strong>
            <small className="text-xs text-muted-foreground">{session.email}</small>
          </div>
        </div>
        <form className="flex items-center gap-2" action={undefined}>
>>>>>>> origin/develop
          <Input
            aria-label="Find records"
            data-command-search
            defaultValue={data.query}
            id="hub-search"
            name="q"
            placeholder="Search candidates, companies, requests, transfers, ID batches"
<<<<<<< HEAD
            className="h-[42px] border-0 bg-transparent px-3.5 text-foreground shadow-none focus-visible:ring-0"
          />
          <input type="hidden" name="scope" value={data.scope} />
          <Button type="submit" variant="ghost" size="sm" className="border-l border-input rounded-none h-[42px] font-bold text-xs text-muted-foreground hover:text-primary">
=======
            className="w-80"
          />
          <input type="hidden" name="scope" value={data.scope} />
          <Button type="submit" variant="ghost" size="sm">
>>>>>>> origin/develop
            Search
          </Button>
        </form>
        {embedded ? null : <HubShortcuts commands={commands} />}
      </header>

<<<<<<< HEAD
      <section className="w-full max-w-[1500px] min-w-0 min-h-0 overflow-y-auto grid content-start gap-3 mx-auto p-3.5">
        {requiredRole && requiredRole !== session.role ? (
          <section className="flex items-center justify-between gap-3.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5" aria-label="Role access notice">
            <div className="grid gap-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-destructive">Access boundary</span>
              <strong className="text-foreground">
                You are signed in as {session.role}, not {requiredRole}.
              </strong>
              <p className="text-muted-foreground m-0">
                Use the matching production credentials to enter that workspace. This keeps candidate, staff, company, and
                admin data separated.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Switch account</Link>
            </Button>
          </section>
        ) : null}

        <section className="grid grid-cols-[1fr_minmax(250px,340px)] gap-3.5 rounded-xl border border-border bg-card p-5">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-muted-foreground">Start here</span>
            <h1 className="max-w-[860px] text-foreground text-[30px] leading-[1.06] mt-1.5 mb-2.5">{guide.title}</h1>
            <p className="max-w-[780px] text-muted-foreground text-[15px] leading-relaxed m-0">{guide.description}</p>
            <div className="flex flex-wrap gap-2.5 mt-[18px]">
              <Button variant="default" asChild>
                <Link href={guide.primary.href}>{guide.primary.label}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={hubContext}>Open focused search</Link>
=======
      {/* Journey Home */}
      <section className="flex-1 overflow-y-auto p-6">
        {requiredRole && requiredRole !== session.role ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Access boundary</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>
                You are signed in as <strong>{session.role}</strong>, not <strong>{requiredRole}</strong>. Use the
                matching production credentials to enter that workspace. This keeps candidate, staff, company, and admin
                data separated.
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Switch account</Link>
>>>>>>> origin/develop
              </Button>
            </div>
          </div>
          <aside className="grid content-start gap-1.5 rounded-xl border border-border bg-card p-3.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-muted-foreground">Signed in as {session.role}</span>
            <strong className="text-foreground text-lg">{session.name}</strong>
            <p className="text-muted-foreground text-[13px] leading-relaxed">{guide.guardrail}</p>
          </aside>
        </section>

        <section className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-2.5" aria-label={`${session.role} workflows`}>
          {guide.journeys.map((journey) => (
<<<<<<< HEAD
            <Card key={journey.title} className="grid grid-rows-[auto_1fr_auto] gap-2.5 p-4">
              <div className="grid gap-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-muted-foreground">{journey.kicker}</span>
                <strong className="text-foreground text-[17px] leading-[1.15]">{journey.title}</strong>
                <p className="text-muted-foreground text-[13px] leading-relaxed m-0">{journey.description}</p>
              </div>
              <ol className="grid gap-2 list-none m-0 p-0">
                {journey.steps.map((step, index) => (
                  <li key={step} className="min-w-0 grid grid-cols-[24px_1fr] items-center gap-2">
                    <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-extrabold">{index + 1}</span>
                    <strong className="min-w-0 text-foreground text-[13px] leading-[1.3]">{step}</strong>
                  </li>
                ))}
              </ol>
              <Button variant="default" className="w-full" asChild>
                <Link href={journey.href}>{journey.action}</Link>
              </Button>
=======
            <Card key={journey.title}>
              <CardHeader>
                <span className="text-xs font-medium text-[#eb6651]">{journey.kicker}</span>
                <h3 className="font-semibold text-foreground">{journey.title}</h3>
                <p className="text-sm text-muted-foreground">{journey.description}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="space-y-2">
                  {journey.steps.map((step, index) => (
                    <li key={step} className="flex items-start gap-2 text-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <strong className="text-foreground">{step}</strong>
                    </li>
                  ))}
                </ol>
                <Button variant="ghost" className="px-0 text-[#eb6651] hover:text-[#d45441]" asChild>
                  <Link href={journey.href}>{journey.action} →</Link>
                </Button>
              </CardContent>
>>>>>>> origin/develop
            </Card>
          ))}
        </section>

<<<<<<< HEAD
        <section className="grid grid-cols-[minmax(260px,0.68fr)_minmax(380px,1.32fr)] gap-2.5" aria-label="Search and live queues">
          <Card className="overflow-hidden">
            <div className="grid gap-1 border-b border-border px-3.5 py-3">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-muted-foreground">Live queues</span>
              <strong className="text-foreground text-[17px] leading-[1.15]">What needs attention</strong>
            </div>
            <div className="grid grid-cols-2">
              {data.queues.map((queue) => {
                const content = (
                  <>
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-muted-foreground">{queue.label}</span>
                    <strong className="text-foreground text-2xl leading-none">{queue.value.toLocaleString("en-US")}</strong>
                    <small className="text-muted-foreground text-xs leading-[1.35]">{queue.note}</small>
                  </>
                );
                return queue.href ? (
                  <Link
                    className="min-w-0 min-h-[104px] grid content-center gap-[5px] border-r border-b border-border p-3 text-foreground no-underline transition-colors hover:bg-muted/50 [&:nth-child(2n)]:border-r-0"
                    href={queue.href as Route}
                    key={queue.label}
                  >
                    {content}
                  </Link>
                ) : (
                  <article
                    className="min-w-0 min-h-[104px] grid content-center gap-[5px] border-r border-b border-border p-3 text-foreground [&:nth-child(2n)]:border-r-0"
                    key={queue.label}
                  >
                    {content}
                  </article>
                );
              })}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="grid gap-1 border-b border-border px-3.5 py-3">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-muted-foreground">{data.scope}</span>
              <strong className="text-foreground text-[17px] leading-[1.15]">
                {data.query ? `Search results for ${data.query}` : "Find a record"}
              </strong>
            </div>
            <nav className="flex gap-2 overflow-x-auto border-b border-border px-3 py-2.5" aria-label="Search scopes">
              {data.scopes.map((item) => {
                const query = data.query ? `&q=${encodeURIComponent(data.query)}` : "";
                return (
                  <Button
                    key={item.value}
                    variant={item.value === data.scope ? "default" : "outline"}
                    size="sm"
                    className="shrink-0"
                    asChild
                  >
                    <Link href={`/app?scope=${item.value}${query}` as Route}>{item.label}</Link>
                  </Button>
                );
              })}
            </nav>
            <div className="grid p-2">
              {data.results.slice(0, 6).map((result) => (
                <Link
                  href={hubRecordHref(data.query, data.scope, result.id)}
                  key={result.id}
                  className="min-w-0 grid grid-cols-[90px_1fr_minmax(120px,230px)] items-center gap-3 rounded-md text-foreground p-2.5 no-underline transition-colors hover:bg-muted/50"
                >
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-muted-foreground">{result.type}</span>
                  <strong className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{result.title}</strong>
                  <small className="text-muted-foreground text-xs overflow-hidden text-ellipsis whitespace-nowrap">{result.meta}</small>
                </Link>
              ))}
              {data.results.length === 0 ? <p className="text-muted-foreground text-sm p-2">No matching records for this login and scope.</p> : null}
            </div>
          </Card>

=======
        {/* Workbench */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Search and live queues">
          {/* Live Queues */}
          <Card>
            <CardHeader>
              <span className="text-xs font-medium text-muted-foreground">Live queues</span>
              <h3 className="font-semibold text-foreground">What needs attention</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {data.queues.map((queue) => {
                  const content = (
                    <div className="rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50">
                      <span className="text-xs text-muted-foreground">{queue.label}</span>
                      <p className="text-2xl font-bold text-foreground">
                        {queue.value.toLocaleString("en-US")}
                      </p>
                      <small className="text-xs text-muted-foreground">{queue.note}</small>
                    </div>
                  );
                  return queue.href ? (
                    <Link className="block" href={queue.href as Route} key={queue.label}>
                      {content}
                    </Link>
                  ) : (
                    <div key={queue.label}>{content}</div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          <Card>
            <CardHeader>
              <div>
                <span className="text-xs font-medium text-muted-foreground">{data.scope}</span>
                <h3 className="font-semibold text-foreground">
                  {data.query ? `Search results for ${data.query}` : "Find a record"}
                </h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <nav className="flex flex-wrap gap-1" aria-label="Search scopes">
                {data.scopes.map((item) => {
                  const query = data.query ? `&q=${encodeURIComponent(data.query)}` : "";
                  return (
                    <Button
                      key={item.value}
                      variant={item.value === data.scope ? "default" : "outline"}
                      size="sm"
                      asChild
                    >
                      <Link href={`/app?scope=${item.value}${query}` as Route}>{item.label}</Link>
                    </Button>
                  );
                })}
              </nav>
              <div className="space-y-2">
                {data.results.slice(0, 6).map((result) => (
                  <Link
                    href={hubRecordHref(data.query, data.scope, result.id)}
                    key={result.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                  >
                    <Badge variant="secondary" className="shrink-0">
                      {result.type}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-sm text-foreground">{result.title}</strong>
                      <small className="text-xs text-muted-foreground">{result.meta}</small>
                    </div>
                  </Link>
                ))}
                {data.results.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No matching records for this login and scope.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Record Preview */}
>>>>>>> origin/develop
          {data.preview ? <RecordPreview preview={data.preview} /> : null}
        </section>
      </section>
    </section>
  );

  return desk;
}

function RecordPreview({ preview }: { preview: HubPreview }) {
  return (
<<<<<<< HEAD
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="grid gap-1.5 p-4 border-b border-border">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-muted-foreground">{preview.type}</span>
          <h2 className="text-foreground text-[22px] break-words m-0">{preview.title}</h2>
          <p className="text-muted-foreground break-words m-0">{preview.subtitle}</p>
          <small className="text-muted-foreground break-words">{preview.meta}</small>
        </div>

        {preview.flags.length ? (
          <div className="flex flex-wrap gap-2 p-4 border-b border-border">
            {preview.flags.map((flag) => (
              <Badge key={flag} variant="secondary">{flag}</Badge>
            ))}
          </div>
        ) : null}

        {preview.actions.length ? (
          <div className="flex flex-wrap gap-2 p-4 border-b border-border">
            {preview.actions.map((action) => (
              <Button key={`${action.label}-${action.href}`} variant="outline" size="sm" asChild>
                <a href={action.href}>{action.label}</a>
              </Button>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-2 border-b border-border">
          {preview.facts.map((fact) => (
            <div key={fact.label} className="min-w-0 min-h-[72px] grid content-center gap-[5px] p-2.5 px-3 border-r border-b border-border [&:nth-child(2n)]:border-r-0">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-muted-foreground">{fact.label}</span>
              <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-foreground text-sm">{fact.value}</strong>
            </div>
          ))}
        </div>

        {preview.related.length ? (
          <div className="grid">
            {preview.related.map((section) => (
              <section key={section.title} className="border-b border-border last:border-b-0">
                <div className="min-h-[42px] flex items-center justify-between gap-3 px-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-muted-foreground">Related</span>
                  <h3 className="text-sm m-0 text-foreground">{section.title}</h3>
                </div>
                {section.rows.length ? (
                  section.rows.map((row) =>
                    row.href ? (
                      <Link className="min-h-[58px] grid gap-1 text-foreground p-[9px_12px] no-underline hover:bg-muted/50" href={row.href} key={row.id}>
                        <strong className="overflow-hidden text-ellipsis whitespace-nowrap">{row.title}</strong>
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground text-xs">{row.subtitle}</span>
                        <small className="overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground text-xs">{row.meta}</small>
                      </Link>
                    ) : (
                      <article className="min-h-[58px] grid gap-1 p-[9px_12px]" key={row.id}>
                        <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-foreground">{row.title}</strong>
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground text-xs">{row.subtitle}</span>
                        <small className="overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground text-xs">{row.meta}</small>
                      </article>
                    )
                  )
                ) : (
                  <p className="text-muted-foreground text-xs grid gap-1.5 p-3.5">No related records visible to this login.</p>
                )}
              </section>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
=======
    <section className="lg:col-span-2" aria-label="Selected record preview">
      <Card>
        <CardHeader>
          <div>
            <Badge variant="secondary" className="mb-2">
              {preview.type}
            </Badge>
            <h2 className="text-lg font-semibold text-foreground">{preview.title}</h2>
            <p className="text-sm text-muted-foreground">{preview.subtitle}</p>
            <small className="text-xs text-muted-foreground">{preview.meta}</small>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {preview.flags.length ? (
            <div className="flex flex-wrap gap-1">
              {preview.flags.map((flag) => (
                <Badge key={flag} variant="secondary">
                  {flag}
                </Badge>
              ))}
            </div>
          ) : null}

          {preview.actions.length ? (
            <div className="flex flex-wrap gap-2">
              {preview.actions.map((action) => (
                <Button key={`${action.label}-${action.href}`} variant="outline" size="sm" asChild>
                  <a href={action.href}>{action.label}</a>
                </Button>
              ))}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {preview.facts.map((fact) => (
              <div key={fact.label} className="rounded-lg bg-muted p-2">
                <span className="text-xs text-muted-foreground">{fact.label}</span>
                <p className="font-semibold text-foreground">{fact.value}</p>
              </div>
            ))}
          </div>

          {preview.related.length ? (
            <div className="space-y-4 border-t border-border pt-4">
              {preview.related.map((section) => (
                <section key={section.title}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Related</span>
                    <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                  </div>
                  {section.rows.length ? (
                    <div className="space-y-1">
                      {section.rows.map((row) =>
                        row.href ? (
                          <Link
                            className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                            href={row.href}
                            key={row.id}
                          >
                            <strong className="text-foreground">{row.title}</strong>
                            <span className="text-xs text-muted-foreground">{row.subtitle}</span>
                            <small className="text-xs text-muted-foreground">{row.meta}</small>
                          </Link>
                        ) : (
                          <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm" key={row.id}>
                            <strong className="text-foreground">{row.title}</strong>
                            <span className="text-xs text-muted-foreground">{row.subtitle}</span>
                            <small className="text-xs text-muted-foreground">{row.meta}</small>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No related records visible to this login.</p>
                  )}
                </section>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
>>>>>>> origin/develop
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
