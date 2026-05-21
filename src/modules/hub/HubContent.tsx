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
    <section className="commandDesk">
      <header className="commandTopbar">
        <div className="commandIdentity">
          <span>{session.role}</span>
          <strong>{session.name}</strong>
          <small>{session.email}</small>
        </div>
        <form className="commandSearch">
          <input
            aria-label="Find records"
            data-command-search
            defaultValue={data.query}
            id="hub-search"
            name="q"
            placeholder="Search candidates, companies, requests, transfers, ID batches"
          />
          <input type="hidden" name="scope" value={data.scope} />
          <button type="submit">Search</button>
        </form>
        {embedded ? null : <HubShortcuts commands={commands} />}
      </header>

      <section className="journeyHome">
        {requiredRole && requiredRole !== session.role ? (
          <section className="roleBoundaryNotice" aria-label="Role access notice">
            <div>
              <span>Access boundary</span>
              <strong>
                You are signed in as {session.role}, not {requiredRole}.
              </strong>
              <p>
                Use the matching production credentials to enter that workspace. This keeps candidate, staff, company, and
                admin data separated.
              </p>
            </div>
            <Link href="/login">Switch account</Link>
          </section>
        ) : null}

        <section className="journeyHero">
          <div>
            <span className="journeyEyebrow">Start here</span>
            <h1>{guide.title}</h1>
            <p>{guide.description}</p>
            <div className="journeyHeroActions">
              <Link className="primary" href={guide.primary.href}>
                {guide.primary.label}
              </Link>
              <Link href={hubContext}>Open focused search</Link>
            </div>
          </div>
          <aside className="journeyGuardrail">
            <span>Signed in as {session.role}</span>
            <strong>{session.name}</strong>
            <p>{guide.guardrail}</p>
          </aside>
        </section>

        <section className="journeyGrid" aria-label={`${session.role} workflows`}>
          {guide.journeys.map((journey) => (
            <article className="journeyCard" key={journey.title}>
              <div className="journeyCardHeader">
                <span>{journey.kicker}</span>
                <strong>{journey.title}</strong>
                <p>{journey.description}</p>
              </div>
              <ol className="journeySteps">
                {journey.steps.map((step, index) => (
                  <li key={step}>
                    <span>{index + 1}</span>
                    <strong>{step}</strong>
                  </li>
                ))}
              </ol>
              <Link href={journey.href}>{journey.action}</Link>
            </article>
          ))}
        </section>

        <section className="journeyWorkbench" aria-label="Search and live queues">
          <div className="journeyPanel">
            <div className="journeyPanelHeader">
              <span>Live queues</span>
              <strong>What needs attention</strong>
            </div>
            <div className="journeyQueueGrid">
              {data.queues.map((queue) => {
                const content = (
                  <>
                    <span>{queue.label}</span>
                    <strong>{queue.value.toLocaleString("en-US")}</strong>
                    <small>{queue.note}</small>
                  </>
                );
                return queue.href ? (
                  <Link className="journeyQueue" href={queue.href as Route} key={queue.label}>
                    {content}
                  </Link>
                ) : (
                  <article className="journeyQueue" key={queue.label}>
                    {content}
                  </article>
                );
              })}
            </div>
          </div>

          <div className="journeyPanel">
            <div className="journeyPanelHeader">
              <span>{data.scope}</span>
              <strong>{data.query ? `Search results for ${data.query}` : "Find a record"}</strong>
            </div>
            <nav className="journeyScopePills" aria-label="Search scopes">
              {data.scopes.map((item) => {
                const query = data.query ? `&q=${encodeURIComponent(data.query)}` : "";
                return (
                  <Link
                    className={item.value === data.scope ? "active" : ""}
                    href={`/app?scope=${item.value}${query}` as Route}
                    key={item.value}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="journeyResults">
              {data.results.slice(0, 6).map((result) => (
                <Link href={hubRecordHref(data.query, data.scope, result.id)} key={result.id}>
                  <span>{result.type}</span>
                  <strong>{result.title}</strong>
                  <small>{result.meta}</small>
                </Link>
              ))}
              {data.results.length === 0 ? <p>No matching records for this login and scope.</p> : null}
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
    <section className="journeyPanel previewPanel" aria-label="Selected record preview">
      <div className="previewHeader">
        <span>{preview.type}</span>
        <h2>{preview.title}</h2>
        <p>{preview.subtitle}</p>
        <small>{preview.meta}</small>
      </div>

      {preview.flags.length ? (
        <div className="previewFlags">
          {preview.flags.map((flag) => (
            <span key={flag}>{flag}</span>
          ))}
        </div>
      ) : null}

      {preview.actions.length ? (
        <div className="previewActions">
          {preview.actions.map((action) => (
            <a href={action.href} key={`${action.label}-${action.href}`}>
              {action.label}
            </a>
          ))}
        </div>
      ) : null}

      <div className="previewFacts">
        {preview.facts.map((fact) => (
          <div key={fact.label}>
            <span>{fact.label}</span>
            <strong>{fact.value}</strong>
          </div>
        ))}
      </div>

      {preview.related.length ? (
        <div className="previewRelated">
          {preview.related.map((section) => (
            <section key={section.title}>
              <div className="previewRelatedHeader">
                <span>Related</span>
                <h3>{section.title}</h3>
              </div>
              {section.rows.length ? (
                section.rows.map((row) =>
                  row.href ? (
                    <Link className="previewRow" href={row.href} key={row.id}>
                      <strong>{row.title}</strong>
                      <span>{row.subtitle}</span>
                      <small>{row.meta}</small>
                    </Link>
                  ) : (
                    <article className="previewRow" key={row.id}>
                      <strong>{row.title}</strong>
                      <span>{row.subtitle}</span>
                      <small>{row.meta}</small>
                    </article>
                  )
                )
              ) : (
                <p className="previewEmpty">No related records visible to this login.</p>
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
