"use client";

import type { Route } from "next";
import Link from "next/link";
import type { SessionUser } from "@/modules/auth/types";
import { useWorkspaceOS } from "@/modules/workspace/WorkspaceOSContext";
import { HubShortcuts, type HubCommand } from "./HubShortcuts";

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
    <section className="min-w-0 grid grid-rows-[auto_minmax(0,1fr)] min-h-svh">
      <header className="sticky top-0 z-20 min-h-16 grid grid-cols-[220px_minmax(280px,1fr)_auto] items-center gap-2.5 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] backdrop-blur-[12px]">
        <div className="min-w-0 grid gap-0.5">
          <span className="text-[#667085]">{session.role}</span>
          <strong className="overflow-hidden text-ellipsis whitespace-nowrap">{session.name}</strong>
          <small className="overflow-hidden text-ellipsis whitespace-nowrap text-[#667085]">{session.email}</small>
        </div>
        <form className="grid grid-cols-[minmax(0,1fr)_auto] overflow-hidden border border-[var(--line)] rounded-lg bg-[var(--surface)] dark:border-[var(--line)] dark:bg-[var(--surface)] dark:text-[var(--ink)] focus-within:border-[#8bb4ea] focus-within:shadow-[0_0_0_3px_rgba(11,99,206,0.12)]">
          <input
            aria-label="Find records"
            data-command-search
            defaultValue={data.query}
            id="hub-search"
            name="q"
            placeholder="Search candidates, companies, requests, transfers, ID batches"
            className="min-w-0 h-[42px] border-0 bg-transparent text-[var(--ink)] px-[13px] font-[inherit] focus:outline-0"
          />
          <input type="hidden" name="scope" value={data.scope} />
          <button type="submit" className="border-0 border-l border-[var(--line)] bg-[var(--surface-soft)] text-[var(--ink)] px-3.5 font-black cursor-pointer dark:border-[var(--line)] dark:bg-[var(--surface-soft)] dark:text-[var(--ink)]">Search</button>
        </form>
        {embedded ? null : <HubShortcuts commands={commands} />}
      </header>

      <section className="w-[min(100%,1500px)] min-w-0 min-h-0 overflow-y-auto grid content-start gap-3 mx-auto p-3.5">
        {requiredRole && requiredRole !== session.role ? (
          <section className="flex items-center justify-between gap-3.5 border border-[#f3c2d3] rounded-lg bg-[#fff8fb] p-3.5 px-4 dark:border-[var(--line)] dark:bg-[var(--surface)] dark:text-[var(--ink)]" aria-label="Role access notice">
            <div className="grid gap-1">
              <span className="text-[var(--rose)] text-[11px] font-black uppercase">Access boundary</span>
              <strong className="text-[#101828] dark:text-[var(--ink)]">
                You are signed in as {session.role}, not {requiredRole}.
              </strong>
              <p className="text-[var(--muted)] m-0">
                Use the matching production credentials to enter that workspace. This keeps candidate, staff, company, and
                admin data separated.
              </p>
            </div>
            <Link href="/login" className="min-h-[38px] inline-flex items-center border border-[#e8a6bd] rounded-lg bg-white text-[var(--rose)] px-3 font-black no-underline dark:border-[var(--line)] dark:bg-[var(--surface)] dark:text-[var(--ink)]">Switch account</Link>
          </section>
        ) : null}

        <section className="grid grid-cols-[minmax(0,1fr)_minmax(250px,340px)] gap-3.5 border border-[var(--line)] rounded-lg bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface)_96%,var(--blue)),var(--surface))] p-4 dark:border-[var(--line)] dark:bg-[var(--surface)] dark:text-[var(--ink)]">
          <div>
            <span className="text-[#667085] text-[11px] font-black uppercase">Start here</span>
            <h1 className="max-w-[860px] text-[var(--ink)] text-[30px] leading-[1.06] my-1.5 mb-2.5">{guide.title}</h1>
            <p className="max-w-[780px] text-[var(--muted)] text-[15px] leading-[1.5] m-0">{guide.description}</p>
            <div className="flex flex-wrap gap-2.5 mt-[18px]">
              <Link
                className="min-h-10 inline-flex items-center justify-center border border-[var(--primary)] rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] px-[13px] font-black no-underline hover:border-[#0b63ce] hover:text-[#0b63ce] hover:bg-[#eef5ff]"
                href={guide.primary.href}
              >
                {guide.primary.label}
              </Link>
              <Link
                className="min-h-10 inline-flex items-center justify-center border border-[var(--line)] rounded-lg bg-[var(--surface-soft)] text-[var(--ink)] px-[13px] font-black no-underline hover:border-[#0b63ce] hover:text-[#0b63ce] hover:bg-[#eef5ff]"
                href={hubContext}
              >
                Open focused search
              </Link>
            </div>
          </div>
          <aside className="grid content-start gap-[7px] border border-[var(--line)] rounded-lg bg-[var(--surface-soft)] p-3.5 dark:border-[var(--line)] dark:bg-[var(--surface)] dark:text-[var(--ink)]">
            <span className="text-[#667085] text-[11px] font-black uppercase">Signed in as {session.role}</span>
            <strong className="text-[var(--ink)] text-lg">{session.name}</strong>
            <p className="text-[var(--muted)] text-[13px] leading-[1.45]">{guide.guardrail}</p>
          </aside>
        </section>

        <section className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-2.5" aria-label={`${session.role} workflows`}>
          {guide.journeys.map((journey) => (
            <article className="min-w-0 grid grid-rows-[auto_minmax(0,1fr)_auto] gap-2.5 border border-[var(--line)] rounded-lg bg-[var(--surface)] p-3 dark:border-[var(--line)] dark:bg-[var(--surface)] dark:text-[var(--ink)]" key={journey.title}>
              <div className="grid gap-[7px]">
                <span className="text-[#667085] text-[11px] font-black uppercase">{journey.kicker}</span>
                <strong className="text-[var(--ink)] text-[17px] leading-[1.15]">{journey.title}</strong>
                <p className="text-[var(--muted)] text-[13px] leading-[1.45] m-0">{journey.description}</p>
              </div>
              <ol className="grid gap-2 list-none m-0 p-0">
                {journey.steps.map((step, index) => (
                  <li className="min-w-0 grid grid-cols-[24px_minmax(0,1fr)] items-center gap-2" key={step}>
                    <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-[#eef2f7] text-[#344054] text-xs font-black">{index + 1}</span>
                    <strong className="min-w-0 text-[#344054] text-[13px] leading-[1.3]">{step}</strong>
                  </li>
                ))}
              </ol>
              <Link
                className="min-h-10 inline-flex items-center justify-center border border-[var(--primary)] rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] px-[13px] font-black no-underline hover:border-[#0b63ce] hover:text-[#0b63ce] hover:bg-[#eef5ff]"
                href={journey.href}
              >
                {journey.action}
              </Link>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-[minmax(260px,0.68fr)_minmax(380px,1.32fr)] gap-2.5" aria-label="Search and live queues">
          <div className="min-w-0 overflow-hidden border border-[var(--line)] rounded-lg bg-[var(--surface)] dark:border-[var(--line)] dark:bg-[var(--surface)] dark:text-[var(--ink)]">
            <div className="grid gap-1 border-b border-[var(--line)] px-3.5 py-3">
              <span className="text-[#667085] text-[11px] font-black uppercase">Live queues</span>
              <strong className="text-[var(--ink)] text-[17px] leading-[1.15]">What needs attention</strong>
            </div>
            <div className="grid grid-cols-2">
              {data.queues.map((queue) => {
                const content = (
                  <>
                    <span className="text-[#667085] text-[11px] font-black uppercase">{queue.label}</span>
                    <strong className="text-[var(--ink)] text-2xl leading-none">{queue.value.toLocaleString("en-US")}</strong>
                    <small className="text-[#667085] text-xs leading-[1.35]">{queue.note}</small>
                  </>
                );
                return queue.href ? (
                  <Link
                    className="min-w-0 min-h-[104px] grid content-center gap-[5px] border-r border-b border-[var(--line)] text-[var(--ink)] p-3 no-underline [&:nth-child(2n)]:border-r-0 hover:bg-[var(--surface-soft)] dark:border-[var(--line)] dark:bg-[var(--surface-soft)] dark:text-[var(--ink)]"
                    href={queue.href as Route}
                    key={queue.label}
                  >
                    {content}
                  </Link>
                ) : (
                  <article
                    className="min-w-0 min-h-[104px] grid content-center gap-[5px] border-r border-b border-[var(--line)] text-[var(--ink)] p-3 [&:nth-child(2n)]:border-r-0 dark:border-[var(--line)] dark:bg-[var(--surface-soft)] dark:text-[var(--ink)]"
                    key={queue.label}
                  >
                    {content}
                  </article>
                );
              })}
            </div>
          </div>

          <div className="min-w-0 overflow-hidden border border-[var(--line)] rounded-lg bg-[var(--surface)] dark:border-[var(--line)] dark:bg-[var(--surface)] dark:text-[var(--ink)]">
            <div className="grid gap-1 border-b border-[var(--line)] px-3.5 py-3">
              <span className="text-[#667085] text-[11px] font-black uppercase">{data.scope}</span>
              <strong className="text-[var(--ink)] text-[17px] leading-[1.15]">{data.query ? `Search results for ${data.query}` : "Find a record"}</strong>
            </div>
            <nav className="flex gap-2 overflow-x-auto border-b border-[var(--line)] px-3 py-2.5" aria-label="Search scopes">
              {data.scopes.map((item) => {
                const query = data.query ? `&q=${encodeURIComponent(data.query)}` : "";
                return (
                  <Link
                    className={`min-h-8 inline-flex items-center border border-[var(--line)] rounded-lg text-[var(--ink)] px-[11px] text-[13px] font-extrabold no-underline whitespace-nowrap dark:border-[var(--line)] dark:bg-[var(--surface-soft)] dark:text-[var(--ink)] hover:border-[#0b63ce] hover:bg-[#eef5ff] hover:text-[#0b63ce] ${item.value === data.scope ? "border-[#0b63ce] bg-[#eef5ff] text-[#0b63ce]" : ""}`}
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
                  className="min-w-0 grid grid-cols-[90px_minmax(0,1fr)_minmax(120px,230px)] items-center gap-3 rounded-lg text-[var(--ink)] p-2.5 no-underline hover:bg-[var(--surface-soft)]"
                  href={hubRecordHref(data.query, data.scope, result.id)}
                  key={result.id}
                >
                  <span className="text-[#667085] text-[11px] font-black uppercase">{result.type}</span>
                  <strong className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{result.title}</strong>
                  <small className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[#667085] text-xs">{result.meta}</small>
                </Link>
              ))}
              {data.results.length === 0 ? <p className="text-[#667085] text-xs m-0 p-2.5">No matching records for this login and scope.</p> : null}
            </div>
          </div>

          {data.preview ? <RecordPreview preview={data.preview} /> : null}
        </section>
      </section>
    </section>
  );

  return desk;
}

function RecordPreview({ preview }: { preview: HubPreview }) {
  return (
    <section className="min-w-0 overflow-hidden border border-[var(--line)] rounded-lg bg-[var(--surface)] dark:border-[var(--line)] dark:bg-[var(--surface)] dark:text-[var(--ink)]" aria-label="Selected record preview">
      <div className="grid gap-[7px] p-[18px] border-b border-[var(--line)]">
        <span className="text-[var(--blue)] text-[11px] font-black uppercase">{preview.type}</span>
        <h2 className="[overflow-wrap:anywhere] mb-0 text-[28px]">{preview.title}</h2>
        <p className="[overflow-wrap:anywhere] text-[var(--muted)]">{preview.subtitle}</p>
        <small className="[overflow-wrap:anywhere] text-[var(--muted)]">{preview.meta}</small>
      </div>

      {preview.flags.length ? (
        <div className="flex flex-wrap gap-2 px-[18px] py-3 border-b border-[var(--line)]">
          {preview.flags.map((flag) => (
            <span className="min-h-7 inline-flex items-center border border-[#b7cff0] bg-[#eef5ff] rounded-[7px] text-[var(--blue)] px-[9px] text-[13px] dark:border-[color-mix(in_srgb,var(--blue)_42%,var(--line))] dark:bg-[color-mix(in_srgb,var(--blue)_14%,var(--surface))]" key={flag}>{flag}</span>
          ))}
        </div>
      ) : null}

      {preview.actions.length ? (
        <div className="flex flex-wrap gap-2 px-[18px] py-3 border-b border-[var(--line)]">
          {preview.actions.map((action, i) => (
            <a
              className={`min-h-[38px] inline-flex items-center justify-center rounded-lg px-3 font-black no-underline hover:border-[#0b63ce] hover:text-[#0b63ce] hover:bg-[#eef5ff] ${
                i === 0
                  ? "border border-[var(--blue)] bg-[var(--blue)] text-white dark:bg-[var(--surface-soft)] dark:text-[var(--ink)]"
                  : "border border-[var(--line)] bg-[#fbfcfe] text-[var(--ink)] dark:bg-[var(--surface-soft)] dark:text-[var(--ink)]"
              }`}
              href={action.href}
              key={`${action.label}-${action.href}`}
            >
              {action.label}
            </a>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-2 border-b border-[var(--line)] max-md:grid-cols-1">
        {preview.facts.map((fact) => (
          <div className="min-w-0 grid gap-1.5 p-[13px] px-[18px] border-r border-b border-[var(--line)] [&:nth-child(2n)]:border-r-0 max-md:border-r-0" key={fact.label}>
            <span className="text-[var(--muted)] text-[11px] font-black uppercase">{fact.label}</span>
            <strong className="[overflow-wrap:anywhere] text-sm">{fact.value}</strong>
          </div>
        ))}
      </div>

      {preview.related.length ? (
        <div className="grid">
          {preview.related.map((section) => (
            <section className="border-b border-[var(--line)] last:border-b-0" key={section.title}>
              <div className="flex items-center justify-between gap-2.5 px-[18px] pt-[13px] pb-2">
                <span className="text-[var(--muted)] text-[11px] font-black uppercase">Related</span>
                <h3 className="m-0 text-[15px]">{section.title}</h3>
              </div>
              {section.rows.length ? (
                section.rows.map((row) =>
                  row.href ? (
                    <Link
                      className="grid gap-1 px-[18px] py-[11px] text-[var(--ink)] no-underline hover:bg-[#fbfcfe] dark:hover:bg-[var(--surface-soft)] dark:hover:text-[var(--ink)]"
                      href={row.href}
                      key={row.id}
                    >
                      <strong className="overflow-hidden text-ellipsis whitespace-nowrap">{row.title}</strong>
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--muted)]">{row.subtitle}</span>
                      <small className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--muted)]">{row.meta}</small>
                    </Link>
                  ) : (
                    <article className="grid gap-1 px-[18px] py-[11px] text-[var(--ink)]" key={row.id}>
                      <strong className="overflow-hidden text-ellipsis whitespace-nowrap">{row.title}</strong>
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--muted)]">{row.subtitle}</span>
                      <small className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--muted)]">{row.meta}</small>
                    </article>
                  )
                )
              ) : (
                <p className="text-[var(--muted)] m-0 px-[18px] pb-3.5">No related records visible to this login.</p>
              )}
            </section>
          ))}
        </div>
      ) : null}
    </section>
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
