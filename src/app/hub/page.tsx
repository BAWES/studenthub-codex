import type { Route } from "next";
import Link from "next/link";
import { logoutAction } from "@/modules/auth/actions";
import { requireSession } from "@/modules/auth/session";
import { roles, type Role } from "@/modules/auth/types";
import { getUnifiedHub, parseHubScope } from "@/modules/hub/data";
import { HubShortcuts, type HubCommand } from "@/modules/hub/HubShortcuts";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function HubPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; scope?: string; record?: string; required?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const scope = parseHubScope(params.scope);
  const requiredRole = parseRequiredRole(params.required);
  const data = await getUnifiedHub(session, { query: params.q, scope, record: params.record });
  const hubContext = hubContextHref(data.query, data.scope);
  const commands = buildCommands(data);
  const guide = buildRoleGuide(session.role, data);

  return (
    <main className="commandOS">
      <aside className="commandRail">
        <Link className="commandBrand" href="/hub" aria-label="StudentHub command home">
          <span>SH</span>
          <strong>StudentHub</strong>
        </Link>

        <nav className="commandRailNav" aria-label="Workspace navigation">
          {data.navigation.map((item) => (
            <Link
              className={item.href === hubContext || item.href === "/hub" ? "active" : ""}
              href={item.href}
              key={item.href}
              title={`${item.label}: ${item.description}`}
            >
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </Link>
          ))}
        </nav>

        <div className="commandRailFooter">
          <ThemeToggle />
          <form className="commandRailSignout" action={logoutAction}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </aside>

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
          <HubShortcuts commands={commands} />
        </header>

        <section className="journeyHome">
          {requiredRole && requiredRole !== session.role ? (
            <section className="roleBoundaryNotice" aria-label="Role access notice">
              <div>
                <span>Access boundary</span>
                <strong>You are signed in as {session.role}, not {requiredRole}.</strong>
                <p>Use the matching production credentials to enter that workspace. This keeps candidate, staff, company, and admin data separated.</p>
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
                      href={`/hub?scope=${item.value}${query}` as Route}
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
    </main>
  );
}

function RecordPreview({ preview }: { preview: NonNullable<HubData["preview"]> }) {
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
  return `/hub?${params.toString()}` as Route;
}

function hubRecordHref(query: string, scope: string, record: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  params.set("scope", scope);
  params.set("record", record);
  return `/hub?${params.toString()}` as Route;
}

function parseRequiredRole(value: string | string[] | undefined): Role | null {
  const role = Array.isArray(value) ? value[0] : value;
  return role && roles.includes(role as Role) ? (role as Role) : null;
}

type HubData = Awaited<ReturnType<typeof getUnifiedHub>>;

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

function buildRoleGuide(role: Role, data: HubData): RoleGuide {
  const queueValue = (label: string) => data.queues.find((queue) => queue.label.toLowerCase().includes(label))?.value ?? 0;
  const needsReview = queueValue("review");
  const incomplete = queueValue("incomplete");
  const requests = queueValue("request");
  const idReview = queueValue("id");
  const activeCandidates = data.system.find((item) => item.label === "Active candidates")?.value ?? 0;
  const transfers = data.system.find((item) => item.label === "Transfers")?.value ?? 0;

  const guides: Record<Role, RoleGuide> = {
    admin: {
      title: "Run StudentHub from clear workflows, not scattered tables.",
      description:
        "Pick the job you are trying to finish: approve candidates, operate hiring demand, clear employer accounts, or reconcile money. Search is still here, but it is no longer the whole product.",
      guardrail:
        "Admin sees system-wide records. Candidate, staff, and company accounts should still enter through their own credentials, not through an admin identity switcher.",
      primary: { label: "Start with candidate approvals", href: "/admin/candidates" as Route },
      journeys: [
        {
          kicker: `${needsReview.toLocaleString("en-US")} waiting`,
          title: "Candidate readiness",
          description: "Move a person from signup into a usable, job-ready profile.",
          steps: ["Review profile and documents", "Fix missing readiness data", "Approve or return for completion"],
          href: "/admin/candidates" as Route,
          action: "Open candidate queue"
        },
        {
          kicker: `${requests.toLocaleString("en-US")} requests`,
          title: "Hiring pipeline",
          description: "Go from employer demand to a shortlist that staff can act on.",
          steps: ["Open the request", "Review matched candidates", "Send shortlist and CV pack"],
          href: "/admin/requests" as Route,
          action: "Open requests"
        },
        {
          kicker: `${transfers.toLocaleString("en-US")} transfers`,
          title: "Finance and payouts",
          description: "Track time, candidate pay, employer charges, and invoice-ready transfer records.",
          steps: ["Review transfer batch", "Check candidate payouts", "Prepare employer invoice PDF"],
          href: "/admin/transfers" as Route,
          action: "Open finance"
        },
        {
          kicker: `${idReview.toLocaleString("en-US")} ID batches`,
          title: "Compliance",
          description: "Keep identity and civil ID review separate from day-to-day placement work.",
          steps: ["Review pending ID batches", "Resolve document status", "Return clean candidates to the pipeline"],
          href: "/hub?scope=compliance" as Route,
          action: "Open compliance"
        }
      ]
    },
    staff: {
      title: "Work your placements from request to shortlist to candidate follow-up.",
      description:
        "This workspace should feel like a daily operating desk: assigned demand first, candidate readiness second, then communication and CV/PDF actions from the record.",
      guardrail: "Staff only sees assigned requests and candidates connected to their staff account.",
      primary: { label: "Open my requests", href: "/staff/requests" as Route },
      journeys: [
        {
          kicker: "Demand",
          title: "Fill a position",
          description: "Start with the employer request, then work candidates against that specific need.",
          steps: ["Open assigned request", "Review matching candidates", "Send employer shortlist"],
          href: "/staff/requests" as Route,
          action: "Open request desk"
        },
        {
          kicker: `${incomplete.toLocaleString("en-US")} incomplete`,
          title: "Prepare candidates",
          description: "Make profiles usable before they are sent to employers.",
          steps: ["Find incomplete profile", "Check work history and notes", "Export/share CV when ready"],
          href: "/staff/candidates?filter=incomplete" as Route,
          action: "Open candidate desk"
        },
        {
          kicker: "Follow-up",
          title: "Candidate communication",
          description: "Use the candidate record as the action surface for calls, email, notes, and placement history.",
          steps: ["Open candidate", "Review notes and assignments", "Contact or update status"],
          href: "/staff/candidates" as Route,
          action: "Find candidates"
        }
      ]
    },
    candidate: {
      title: "Build your profile, get matched, track work, and understand pay.",
      description:
        "A candidate should not land in an admin database. The path is profile readiness, invitations, work logs, then payment visibility.",
      guardrail: "Candidate login only exposes the signed-in candidate profile, invitations, and work history.",
      primary: { label: "Continue my profile", href: "/candidate" as Route },
      journeys: [
        {
          kicker: "Profile",
          title: "Become job-ready",
          description: "Finish the details employers and staff need before sending you to a role.",
          steps: ["Check personal profile", "Complete missing fields", "Confirm documents"],
          href: "/candidate" as Route,
          action: "Open my profile"
        },
        {
          kicker: "Jobs",
          title: "Review invitations",
          description: "See the roles and requests sent to your account.",
          steps: ["Open invitation", "Review company and role", "Respond or follow up"],
          href: "/candidate/invitations" as Route,
          action: "Open invitations"
        },
        {
          kicker: "Work",
          title: "Track hours and pay",
          description: "Check imported shifts, timer records, and work history connected to payment.",
          steps: ["Open work logs", "Review shift history", "Confirm payment context"],
          href: "/candidate/work-logs" as Route,
          action: "Open work logs"
        }
      ]
    },
    company: {
      title: "Request staff, review candidates, and keep hiring paperwork together.",
      description:
        "Company users should start from hiring demand, not from a mixed database. Requests become the home for shortlists, CVs, status, and invoice context.",
      guardrail: "Company login only exposes linked companies and requests for that company contact.",
      primary: { label: "Open hiring requests", href: "/company/requests" as Route },
      journeys: [
        {
          kicker: "Hiring",
          title: "Request candidates",
          description: "Create and manage demand by company, position, seats, and status.",
          steps: ["Open request", "Review proposed candidates", "Confirm next step with staff"],
          href: "/company/requests" as Route,
          action: "Open requests"
        },
        {
          kicker: "Account",
          title: "Company profile",
          description: "Keep employer identity, contacts, stores, and hiring access clean.",
          steps: ["Review company details", "Check linked locations", "Confirm hiring approval"],
          href: "/company/companies" as Route,
          action: "Open company profile"
        }
      ]
    },
    inspector: {
      title: "Clear identity review without mixing it into placement work.",
      description: "Inspector accounts should move through civil ID batches, candidate lists, and document status quickly.",
      guardrail: "Inspector login only exposes ID review queues.",
      primary: { label: "Open ID requests", href: "/inspector/id-requests" as Route },
      journeys: [
        {
          kicker: `${idReview.toLocaleString("en-US")} pending`,
          title: "Civil ID review",
          description: "Work each imported batch from candidate list to resolved document status.",
          steps: ["Open pending batch", "Review candidates", "Mark review outcome"],
          href: "/inspector/id-requests" as Route,
          action: "Open ID queue"
        }
      ]
    }
  };

  if (role === "admin" && activeCandidates) {
    guides.admin.journeys[0] = {
      ...guides.admin.journeys[0],
      description: `${activeCandidates.toLocaleString("en-US")} active candidates exist, but the useful path starts by clearing what blocks placement.`
    };
  }

  return guides[role];
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
