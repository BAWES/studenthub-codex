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
    <main className="grid grid-cols-[224px_minmax(0,1fr)] min-h-svh bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--blue)_10%,transparent),transparent_32rem),var(--paper)] text-[var(--ink)]">
      <aside className="sticky top-0 h-svh grid grid-rows-[auto_minmax(0,1fr)_auto] justify-items-stretch gap-2.5 border-r border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] py-3 px-2.5">
        <Link className="w-full min-h-11 flex items-center gap-2.5 border border-[var(--line)] rounded-lg bg-[var(--ink)] text-[var(--surface)] px-3 font-black no-underline dark:bg-[#e7ecf5] dark:text-[#090d14]" href="/app" aria-label="StudentHub command home">
          <span className="w-[30px] h-[30px] inline-flex items-center justify-center rounded-md bg-[rgba(255,255,255,0.14)]">SH</span>
          <strong>StudentHub</strong>
        </Link>

        <nav className="w-full grid content-start gap-[5px]" aria-label="Workspace navigation">
          {data.navigation.map((item) => (
            <Link
              className={`w-full min-h-[46px] grid content-center gap-[3px] border rounded-lg px-3 no-underline ${
                item.href === hubContext || item.href === "/app"
                  ? "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--blue)]"
                  : "border-transparent text-[var(--muted)] hover:border-[var(--line)] hover:bg-[var(--surface-soft)] hover:text-[var(--blue)]"
              }`}
              href={item.href}
              key={item.href}
              title={`${item.label}: ${item.description}`}
            >
              <strong className="text-inherit text-sm">{item.label}</strong>
              <small className="overflow-hidden text-[var(--muted)] text-xs text-ellipsis whitespace-nowrap">{item.description}</small>
            </Link>
          ))}
        </nav>

        <div className="grid gap-2">
          <ThemeToggle />
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full min-h-10 border border-[var(--line)] rounded-lg bg-[var(--surface-soft)] text-[var(--ink)] text-[13px] font-black cursor-pointer hover:border-[var(--blue)] hover:text-[var(--blue)]"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <section className="min-w-0 grid grid-rows-[auto_minmax(0,1fr)] min-h-svh">
        <header className="sticky top-0 z-20 min-h-16 grid grid-cols-[220px_minmax(280px,1fr)_auto] items-center gap-2.5 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] backdrop-blur-md px-3.5 py-2.5">
          <div className="min-w-0 grid gap-0.5">
            <span className="text-[#667085] text-[11px] font-black uppercase">{session.role}</span>
            <strong className="overflow-hidden text-ellipsis whitespace-nowrap">{session.name}</strong>
            <small className="overflow-hidden text-[#667085] text-ellipsis whitespace-nowrap">{session.email}</small>
          </div>
          <form className="grid grid-cols-[minmax(0,1fr)_auto] overflow-hidden border border-[var(--line)] rounded-lg bg-[var(--surface)] focus-within:border-[#8bb4ea] focus-within:shadow-[0_0_0_3px_rgba(11,99,206,0.12)]">
            <input
              aria-label="Find records"
              data-command-search
              defaultValue={data.query}
              id="hub-search"
              name="q"
              className="min-w-0 h-[42px] border-0 bg-transparent text-[var(--ink)] px-[13px] font-inherit focus:outline-none"
              placeholder="Search candidates, companies, requests, transfers, ID batches"
            />
            <input type="hidden" name="scope" value={data.scope} />
            <button
              type="submit"
              className="border-0 border-l border-[var(--line)] bg-[var(--surface-soft)] text-[var(--ink)] px-3.5 font-black cursor-pointer"
            >
              Search
            </button>
          </form>
          <HubShortcuts commands={commands} />
        </header>

        <section className="w-[min(100%,1500px)] min-w-0 min-h-0 overflow-y-auto grid content-start gap-3 mx-auto p-3.5">
          {requiredRole && requiredRole !== session.role ? (
            <section className="flex items-center justify-between gap-3.5 border border-[#f3c2d3] rounded-lg bg-[#fff8fb] p-3.5 px-4" aria-label="Role access notice">
              <div className="grid gap-1">
                <span className="text-[var(--rose)] text-[11px] font-black uppercase">Access boundary</span>
                <strong className="text-[#101828]">You are signed in as {session.role}, not {requiredRole}.</strong>
                <p className="text-[var(--muted)] m-0">Use the matching production credentials to enter that workspace. This keeps candidate, staff, company, and admin data separated.</p>
              </div>
              <Link className="min-h-[38px] inline-flex items-center border border-[#e8a6bd] rounded-lg bg-white text-[var(--rose)] px-3 font-black no-underline whitespace-nowrap" href="/login">Switch account</Link>
            </section>
          ) : null}

          <section className="grid grid-cols-[minmax(0,1fr)_minmax(250px,340px)] gap-3.5 border border-[var(--line)] rounded-lg bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface)_96%,var(--blue)),var(--surface))] p-4 dark:border-[var(--line)] dark:bg-[var(--surface)] dark:text-[var(--ink)]">
            <div>
              <span className="text-[#667085] text-[11px] font-black uppercase tracking-normal">Start here</span>
              <h1 className="max-w-[860px] text-[var(--ink)] text-3xl leading-[1.06] my-1.5 mx-0">{guide.title}</h1>
              <p className="max-w-[780px] text-[var(--muted)] text-[15px] leading-relaxed m-0">{guide.description}</p>
              <div className="flex flex-wrap gap-2.5 mt-[18px]">
                <Link className="min-h-10 inline-flex items-center rounded-lg bg-[#111827] text-white px-[13px] font-black no-underline" href={guide.primary.href}>
                  {guide.primary.label}
                </Link>
                <Link className="min-h-10 inline-flex items-center border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] px-4 font-bold text-sm no-underline rounded-lg whitespace-nowrap" href={hubContext}>Open focused search</Link>
              </div>
            </div>
            <aside className="border border-[var(--line)] rounded-lg bg-[var(--surface)] p-3.5 dark:border-[var(--line)] dark:bg-[var(--surface)] dark:text-[var(--ink)]">
              <span className="text-[#667085] text-[11px] font-black uppercase tracking-normal">Signed in as {session.role}</span>
              <strong>{session.name}</strong>
              <p className="text-[var(--muted)] m-0">{guide.guardrail}</p>
            </aside>
          </section>

          <section className="grid grid-cols-2 gap-3 max-[1040px]:grid-cols-1" aria-label={`${session.role} workflows`}>
            {guide.journeys.map((journey) => (
              <article className="grid gap-2.5 border border-[var(--line)] rounded-lg bg-[var(--surface)] p-4 dark:border-[var(--line)] dark:bg-[var(--surface)] dark:text-[var(--ink)]" key={journey.title}>
                <div className="grid gap-1.5">
                  <span className="text-[#667085] text-[11px] font-black uppercase tracking-normal">{journey.kicker}</span>
                  <strong>{journey.title}</strong>
                  <p className="text-[var(--muted)] m-0">{journey.description}</p>
                </div>
                <ol className="grid gap-2.5 list-none p-0 m-0">
                  {journey.steps.map((step, index) => (
                    <li className="grid grid-cols-[24px_minmax(0,1fr)] gap-2" key={step}>
                      <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-[var(--blue)] text-white text-xs font-bold">{index + 1}</span>
                      <strong>{step}</strong>
                    </li>
                  ))}
                </ol>
                <Link className="min-h-9 inline-flex items-center border border-[var(--line)] rounded-lg bg-[var(--surface-soft)] text-[var(--blue)] text-[13px] font-extrabold px-3 no-underline whitespace-nowrap w-fit hover:border-[var(--blue)] hover:bg-[#eef5ff]" href={journey.href}>{journey.action}</Link>
              </article>
            ))}
          </section>

          <section className="grid gap-3" aria-label="Search and live queues">
            <div className="border border-[var(--line)] rounded-lg bg-[var(--surface)] dark:border-[var(--line)] dark:bg-[var(--surface)] dark:text-[var(--ink)]">
              <div className="grid gap-1.5 p-4 border-b border-[var(--line)]">
                <span className="text-[#667085] text-[11px] font-black uppercase tracking-normal">Live queues</span>
                <strong>What needs attention</strong>
              </div>
              <div className="grid grid-cols-2">
                {data.queues.map((queue) => {
                  const content = (
                    <>
                      <span className="text-[#667085] text-[11px] font-black uppercase tracking-normal">{queue.label}</span>
                      <strong className="text-[22px] leading-none">{queue.value.toLocaleString("en-US")}</strong>
                      <small className="text-[#667085] leading-[1.35]">{queue.note}</small>
                    </>
                  );
                  return queue.href ? (
                    <Link className="grid gap-1 rounded-lg text-[#344054] p-2 px-2 no-underline hover:bg-[#f6f8fb]" href={queue.href as Route} key={queue.label}>
                      {content}
                    </Link>
                  ) : (
                    <article className="grid gap-1 rounded-lg text-[#344054] p-2 px-2" key={queue.label}>
                      {content}
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="border border-[var(--line)] rounded-lg bg-[var(--surface)] dark:border-[var(--line)] dark:bg-[var(--surface)] dark:text-[var(--ink)]">
              <div className="grid gap-1.5 p-4 border-b border-[var(--line)]">
                <span className="text-[#667085] text-[11px] font-black uppercase tracking-normal">{data.scope}</span>
                <strong>{data.query ? `Search results for ${data.query}` : "Find a record"}</strong>
              </div>
              <nav className="flex flex-wrap gap-2 p-3" aria-label="Search scopes">
                {data.scopes.map((item) => {
                  const query = data.query ? `&q=${encodeURIComponent(data.query)}` : "";
                  return (
                    <Link
                      className={`min-h-8 inline-flex items-center rounded-full px-2.5 text-xs font-extrabold no-underline ${
                        item.value === data.scope
                          ? "bg-[var(--blue)] text-white"
                          : "bg-[#eef2f7] text-[#344054] hover:bg-[#dde5f3]"
                      }`}
                      href={`/app?scope=${item.value}${query}` as Route}
                      key={item.value}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="grid gap-1 p-3">
                {data.results.slice(0, 6).map((result) => (
                  <Link className="grid grid-cols-[92px_minmax(0,1fr)_minmax(160px,230px)] items-center gap-3 border border-transparent rounded-lg text-[#111827] px-2.5 py-2 no-underline hover:border-[#d7e4f7] hover:bg-white hover:shadow-[0_8px_24px_rgba(16,24,40,0.06)]" href={hubRecordHref(data.query, data.scope, result.id)} key={result.id}>
                    <span className="text-[#667085] text-xs">{result.type}</span>
                    <strong className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{result.title}</strong>
                    <small className="min-w-0 text-[#667085] text-xs overflow-hidden text-ellipsis whitespace-nowrap not-italic">{result.meta}</small>
                  </Link>
                ))}
                {data.results.length === 0 ? <p className="text-[var(--muted)]">No matching records for this login and scope.</p> : null}
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
    <section className="border border-[var(--line)] rounded-lg bg-[var(--surface)] dark:border-[var(--line)] dark:bg-[var(--surface)] dark:text-[var(--ink)]" aria-label="Selected record preview">
      <div className="grid gap-1.5 p-4 border-b border-[var(--line)]">
        <span className="text-[#667085] text-[11px] font-black uppercase">{preview.type}</span>
        <h2 className="break-words text-[22px] m-0">{preview.title}</h2>
        <p className="text-[#667085] m-0 break-words">{preview.subtitle}</p>
        <small className="text-[#667085] m-0 break-words">{preview.meta}</small>
      </div>

      {preview.flags.length ? (
        <div className="flex flex-wrap gap-2 p-3 px-4 border-b border-[var(--line)]">
          {preview.flags.map((flag) => (
            <span className="min-h-[26px] inline-flex items-center rounded-full bg-[#eef2f7] text-[#344054] px-[9px] text-xs font-extrabold" key={flag}>{flag}</span>
          ))}
        </div>
      ) : null}

      {preview.actions.length ? (
        <div className="flex flex-wrap gap-2 p-3 px-4 border-b border-[var(--line)]">
          {preview.actions.map((action) => (
            <a className="min-h-9 inline-flex items-center border border-[#d9dee8] rounded-lg bg-[#fbfcfd] text-[#111827] px-2.5 text-[13px] font-black no-underline hover:border-[#8bb4ea] hover:text-[#0b63ce] hover:bg-[#eef5ff]" href={action.href} key={`${action.label}-${action.href}`}>
              {action.label}
            </a>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-2 border-b border-[var(--line)]">
        {preview.facts.map((fact) => (
          <div className="min-w-0 min-h-[72px] grid content-center gap-[5px] border-r border-b border-[var(--line)] px-3 py-2.5 [&:nth-child(2n)]:border-r-0" key={fact.label}>
            <span className="text-[#667085] text-[11px] font-black uppercase">{fact.label}</span>
            <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">{fact.value}</strong>
          </div>
        ))}
      </div>

      {preview.related.length ? (
        <div className="grid">
          {preview.related.map((section) => (
            <section className="border-b border-[var(--line)]" key={section.title}>
              <div className="min-h-[42px] flex items-center justify-between gap-3 px-3">
                <span className="text-[#667085] text-[11px] font-black uppercase">Related</span>
                <h3 className="text-sm m-0">{section.title}</h3>
              </div>
              {section.rows.length ? (
                section.rows.map((row) =>
                  row.href ? (
                    <Link className="min-h-[58px] grid gap-1 text-[#111827] px-3 py-[9px] no-underline hover:bg-[#f6f8fb]" href={row.href} key={row.id}>
                      <strong className="overflow-hidden text-ellipsis whitespace-nowrap">{row.title}</strong>
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[#667085] text-xs">{row.subtitle}</span>
                      <small className="overflow-hidden text-ellipsis whitespace-nowrap text-[#667085] text-xs">{row.meta}</small>
                    </Link>
                  ) : (
                    <article className="min-h-[58px] grid gap-1 text-[#111827] px-3 py-[9px]" key={row.id}>
                      <strong className="overflow-hidden text-ellipsis whitespace-nowrap">{row.title}</strong>
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[#667085] text-xs">{row.subtitle}</span>
                      <small className="overflow-hidden text-ellipsis whitespace-nowrap text-[#667085] text-xs">{row.meta}</small>
                    </article>
                  )
                )
              ) : (
                <p className="grid gap-1.5 p-3.5 text-[#667085] text-xs">No related records visible to this login.</p>
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
          href: "/app?scope=compliance" as Route,
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
    const shortcut = item.href === "/app" ? "G H" : item.label.toLowerCase().includes("request") ? "G R" : item.label.toLowerCase().includes("candidate") || item.label.toLowerCase().includes("company") ? "G C" : undefined;
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
      href: `/app?${params.toString()}`
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
      href: "/app",
      shortcut: "Cmd/Ctrl K"
    },
    {
      id: "shortcut-search",
      title: "Focus workspace search",
      subtitle: "Search records visible to this account",
      section: "Shortcuts",
      href: "/app",
      shortcut: "/"
    }
  );

  return commands;
}
