import Link from "next/link";
import type { Route } from "next";
import { getSession } from "@/modules/auth/session";
import { portalContent } from "@/modules/auth/portalContent";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";

export const dynamic = "force-dynamic";

const portalIcons: Record<(typeof portalRoles)[number], string> = {
  candidate: "🎓",
  staff: "📋",
  company: "🏭",
  admin: "⚙️",
  inspector: "🔍",
};

const benefits = [
  {
    title: "Purpose-built portals",
    body: "Each role gets exactly the right tools — no clutter, no missing features, no one-size-fits-all compromises.",
  },
  {
    title: "Smart candidate search",
    body: "Typo-tolerant, filter-rich search across countries, skills, and statuses. Saved searches for repeat workflows.",
  },
  {
    title: "End-to-end workflows",
    body: "From profile readiness to timesheets and payments — every step is connected in one system.",
  },
  {
    title: "Production-grade foundation",
    body: "Built for real data volumes, real teams, and real compliance — not a prototype.",
  },
];

const portalRoles = ["candidate", "staff", "company", "admin", "inspector"] as const;

export default async function Home() {
  const session = await getSession();

  return (
    <main className="landingShell">
      <nav className="landingNav" aria-label="StudentHub public navigation">
        <Link className="landingBrand" href="/">
          <span>SH</span>
          <strong>StudentHub</strong>
        </Link>
        <div>
          {session ? <Link href="/app">Open app</Link> : <Link href="/login">Sign in</Link>}
          <ThemeToggle />
        </div>
      </nav>

      <section className="landingHero">
        <div className="landingHeroStage" aria-hidden="true">
          <div className="landingOpsFrame">
            <div className="landingOpsRail">
              {["Search", "Queue", "Work", "Money"].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div className="landingOpsMain">
              <div className="landingOpsSearch">
                <span>Candidate search</span>
                <strong>find talent</strong>
                <small>80 results · filtered · ready for review</small>
              </div>
              <div className="landingOpsColumns">
                {[
                  { label: "Profile", status: "Live" },
                  { label: "CV export", status: "PDF" },
                  { label: "Timesheet", status: "Live" },
                  { label: "Payment", status: "Live" },
                ].map((item) => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.status}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="landingOpsAside">
              <span>Actions</span>
              <strong>Send CVs</strong>
              <small>One click to share with employers.</small>
            </div>
          </div>
        </div>
        <div className="landingHeroCopy">
          <p className="eyebrow">The StudentHub platform</p>
          <h1>Every role gets its own workspace.</h1>
          <p>
            Candidates find jobs, staff place talent, companies hire, admins oversee, and inspectors verify — all
            from a single platform with role-specific portals that adapt to how each person works.
          </p>
          <div className="landingActions">
            <Link className="primary" href="/login">Get started</Link>
            <Link href="/login">Explore portals</Link>
          </div>
          <div className="landingHeroStats" aria-label="Platform highlights">
            <span>5 role-specific portals</span>
            <span>Unified search &amp; documents</span>
            <span>End-to-end workflows</span>
          </div>
        </div>
      </section>

      <section className="portalGrid" aria-label="StudentHub portals">
        {portalRoles.map((role) => {
          const portal = portalContent[role];
          return (
            <Link href={portal.href as Route} key={role}>
              <span className="portalIcon" aria-hidden="true">{portalIcons[role]}</span>
              <span>{portal.label}</span>
              <strong>{portal.audience}</strong>
              <small>{portal.promise}</small>
            </Link>
          );
        })}
      </section>

      <section className="landingBenefitsSection">
        <div>
          <p className="eyebrow">Why StudentHub</p>
          <h2>Built for how staffing actually works.</h2>
          <p>
            Not a generic dashboard. Every feature is shaped by real placement workflows — search, shortlisting,
            document exchange, timesheets, and payments run in one system.
          </p>
        </div>
        <div className="benefitGrid">
          {benefits.map((b) => (
            <article key={b.title}>
              <strong>{b.title}</strong>
              <p>{b.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
