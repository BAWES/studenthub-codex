import type { Route } from "next";
import Link from "next/link";
import { logoutAction } from "@/modules/auth/actions";
import { requireSession } from "@/modules/auth/session";
import { getUnifiedHub, parseHubScope } from "@/modules/hub/data";
import { HubShortcuts, type HubCommand } from "@/modules/hub/HubShortcuts";

export const dynamic = "force-dynamic";

export default async function HubPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; scope?: string; record?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const scope = parseHubScope(params.scope);
  const data = await getUnifiedHub(session, { query: params.q, scope, record: params.record });
  const hubContext = hubContextHref(data.query, data.scope);
  const commands = buildCommands(data);

  return (
    <main className="hubShell">
      <aside className="hubSidebar">
        <Link className="hubBrand" href="/hub">
          <span>SH</span>
          <strong>StudentHub</strong>
        </Link>

        <div className="hubProfile">
          <span>{session.role}</span>
          <strong>{session.name}</strong>
          <small>{session.email}</small>
        </div>

        <nav className="hubRoleNav" aria-label="Workspace navigation">
          {data.navigation.map((item) => (
            <Link className={item.href === hubContext || item.href === "/hub" ? "active" : ""} href={item.href} key={item.href}>
              <span>{item.description}</span>
              <strong>{item.label}</strong>
            </Link>
          ))}
        </nav>

        <form className="hubSignout" action={logoutAction}>
          <button type="submit">Sign out</button>
        </form>
      </aside>

      <section className="hubMain">
        <header className="hubHeader">
          <div>
            <p className="eyebrow">Unified Workspace</p>
            <h1>{data.hero.title}</h1>
            <p>{data.hero.subtitle}</p>
          </div>
          <div className="hubHeaderActions">
            <HubShortcuts commands={commands} />
            <div className="hubMode">
              <span>Signed in as</span>
              <strong>{session.role}</strong>
            </div>
          </div>
        </header>

        <section className="hubCommand" aria-label="Command search">
          <form>
            <label htmlFor="hub-search">Find anything</label>
            <div className="hubSearchRow">
              <input
                id="hub-search"
                name="q"
                placeholder="Candidate, company, request, transfer, ID batch..."
                defaultValue={data.query}
                data-command-search
              />
              <input type="hidden" name="scope" value={data.scope} />
              <button type="submit">Search</button>
            </div>
          </form>
          <div className="hubScopes" aria-label="Search scopes">
            {data.scopes.map((item) => {
              const query = data.query ? `&q=${encodeURIComponent(data.query)}` : "";
              return (
                <Link className={item.value === scope ? "active" : ""} href={`/hub?scope=${item.value}${query}` as Route} key={item.value}>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="hubQueues" aria-label="Priority queues">
          {data.queues.map((queue) => {
            const content = (
              <>
                <span>{queue.label}</span>
                <strong>{queue.value.toLocaleString("en-US")}</strong>
                <small>{queue.note}</small>
              </>
            );
            return queue.href ? (
              <Link className={`hubQueue ${queue.tone}`} href={queue.href as Route} key={queue.label}>
                {content}
              </Link>
            ) : (
              <article className={`hubQueue ${queue.tone}`} key={queue.label}>
                {content}
              </article>
            );
          })}
        </section>

        <section className="hubGrid">
          <div className="hubPanel searchPanel">
            <div className="hubPanelHeader">
              <div>
                <h2>{data.query ? `Results for "${data.query}"` : "Live workspace"}</h2>
                <p>{data.results.length} records available to this login</p>
              </div>
              <span>{data.scope}</span>
            </div>
            <div className="hubResults">
              {data.results.length ? (
                data.results.map((result) => {
                  const body = (
                    <>
                      <div className="resultType">{result.type}</div>
                      <div className="resultBody">
                        <strong>{result.title}</strong>
                        <span>{result.subtitle}</span>
                        <small>{result.meta}</small>
                      </div>
                      <div className="resultAction">{data.preview?.id === result.id ? "Selected" : "Preview"}</div>
                    </>
                  );

                  return (
                    <Link
                      className={data.preview?.id === result.id ? "hubResult active" : "hubResult"}
                      href={hubRecordHref(data.query, data.scope, result.id)}
                      key={result.id}
                    >
                      {body}
                    </Link>
                  );
                })
              ) : (
                <div className="hubEmpty">
                  <strong>No matching records</strong>
                  <span>Try a different scope or search term.</span>
                </div>
              )}
            </div>
          </div>

          <aside className="hubSideStack">
            {data.preview ? (
              <section className="hubPanel previewPanel">
                <div className="previewHeader">
                  <span>{data.preview.type}</span>
                  <h2>{data.preview.title}</h2>
                  <p>{data.preview.subtitle}</p>
                  <small>{data.preview.meta}</small>
                </div>
                <div className="previewFlags">
                  {data.preview.flags.map((flag) => (
                    <span key={flag}>{flag}</span>
                  ))}
                </div>
                {data.preview.actions.length ? (
                  <div className="previewActions">
                    {data.preview.actions.map((action) => (
                      action.href.startsWith("/") ? (
                      <Link href={action.href as Route} key={action.label}>
                        {action.label}
                      </Link>
                      ) : (
                      <a href={action.href} key={action.label}>
                        {action.label}
                      </a>
                      )
                    ))}
                  </div>
                ) : null}
                <div className="previewFacts">
                  {data.preview.facts.map((fact) => (
                    <div key={fact.label}>
                      <span>{fact.label}</span>
                      <strong>{fact.value}</strong>
                    </div>
                  ))}
                </div>
                <div className="previewRelated">
                  {data.preview.related.map((section) => (
                    <section key={section.title}>
                      <div className="previewRelatedHeader">
                        <h3>{section.title}</h3>
                        <span>{section.rows.length}</span>
                      </div>
                      {section.rows.length ? (
                        section.rows.map((row) =>
                          row.href ? (
                            <Link className="previewRow" href={row.href as Route} key={row.id}>
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
                        <p className="previewEmpty">No imported rows here yet.</p>
                      )}
                    </section>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="hubPanel modulePanel">
              <div className="hubPanelHeader">
                <div>
                  <h2>Workstreams</h2>
                  <p>Live queues for this signed-in account.</p>
                </div>
              </div>
              <div className="workstreamStack">
                {data.workstreams.map((stream) => {
                  const body = (
                    <>
                      <div>
                        <span>{stream.label}</span>
                        <strong>{stream.value.toLocaleString("en-US")}</strong>
                        <small>{stream.meta}</small>
                      </div>
                      <div className="streamMeter" aria-hidden="true">
                        <span style={{ width: `${stream.progress}%` }} />
                      </div>
                    </>
                  );

                  return stream.href ? (
                    <Link className={`workstream ${stream.tone}`} href={stream.href as Route} key={stream.label}>
                      {body}
                    </Link>
                  ) : (
                    <article className={`workstream ${stream.tone}`} key={stream.label}>
                      {body}
                    </article>
                  );
                })}
              </div>
              <div className="hubPanelHeader inset">
                <div>
                  <h2>{data.access.title}</h2>
                  <p>{data.access.note}</p>
                </div>
              </div>
              <div className="moduleStack">
                {data.access.items.map((item) => (
                  <article className="moduleCard" key={item}>
                    <span>Included</span>
                    <strong>{item}</strong>
                  </article>
                ))}
              </div>

              <div className="hubSystem">
                {data.system.map((signal) => (
                  <div key={signal.label}>
                    <span>{signal.label}</span>
                    <strong>{typeof signal.value === "number" ? signal.value.toLocaleString("en-US") : signal.value}</strong>
                    <small>{signal.note}</small>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>

        <nav className="hubMobileDock" aria-label="Workspace navigation">
          {data.navigation.map((item) => (
            <Link className={item.href === "/hub" ? "active" : ""} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </section>
    </main>
  );
}

function hubContextHref(query: string, scope: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  params.set("scope", scope);
  return `/hub?${params.toString()}` as Route;
}

function hubRecordHref(query: string, scope: string, record: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  params.set("scope", scope);
  params.set("record", record);
  return `/hub?${params.toString()}` as Route;
}

function buildCommands(data: Awaited<ReturnType<typeof getUnifiedHub>>): HubCommand[] {
  const commands: HubCommand[] = [];

  for (const item of data.navigation) {
    const shortcut = item.href === "/hub" ? "G H" : item.label.toLowerCase().includes("request") ? "G R" : item.label.toLowerCase().includes("candidate") || item.label.toLowerCase().includes("company") ? "G C" : undefined;
    commands.push({
      id: `nav-${item.href}`,
      title: item.label,
      subtitle: item.description,
      section: "Navigation",
      href: item.href,
      shortcut
    });
  }

  for (const scope of data.scopes) {
    const params = new URLSearchParams();
    params.set("scope", scope.value);
    if (data.query) params.set("q", data.query);
    commands.push({
      id: `scope-${scope.value}`,
      title: `Search ${scope.label}`,
      subtitle: `Limit the workspace to ${scope.label.toLowerCase()}`,
      section: "Search scopes",
      href: `/hub?${params.toString()}`
    });
  }

  for (const queue of data.queues) {
    if (!queue.href) continue;
    commands.push({
      id: `queue-${queue.label}`,
      title: queue.label,
      subtitle: queue.note,
      section: "Priority queues",
      href: queue.href
    });
  }

  for (const result of data.results) {
    commands.push({
      id: `result-${result.id}`,
      title: result.title,
      subtitle: `${result.type} · ${result.subtitle}`,
      section: "Visible records",
      href: hubRecordHref(data.query, data.scope, result.id)
    });
  }

  if (data.preview) {
    for (const action of data.preview.actions) {
      commands.push({
        id: `preview-${data.preview.id}-${action.label}`,
        title: action.label,
        subtitle: data.preview.title,
        section: "Selected record",
        href: action.href
      });
    }
  }

  commands.push(
    {
      id: "shortcut-command",
      title: "Open command menu",
      subtitle: "Universal action search",
      section: "Shortcuts",
      href: "/hub",
      shortcut: "Cmd/Ctrl K"
    },
    {
      id: "shortcut-search",
      title: "Focus workspace search",
      subtitle: "Search records visible to this account",
      section: "Shortcuts",
      href: "/hub",
      shortcut: "/"
    }
  );

  return commands;
}
