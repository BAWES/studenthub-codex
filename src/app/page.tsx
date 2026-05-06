import Link from "next/link";
import type { Route } from "next";
import { getSession } from "@/modules/auth/session";
import { portalContent } from "@/modules/auth/portalContent";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";

export const dynamic = "force-dynamic";

const searchSignals = [
  "Typo-tolerant candidate search",
  "Country, university, status, skill, company, availability filters",
  "Saved searches for staff and admin teams",
  "Production-safe indexing from the existing MySQL database"
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
          {session ? <Link href="/hub">Open app</Link> : <Link href="/login">Sign in</Link>}
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
                <strong>jaafar</strong>
                <small>80 scoped results · FAD · needs review · Lebanon</small>
              </div>
              <div className="landingOpsColumns">
                {["Profile ready", "CV export", "Timesheet", "Payment"].map((item, index) => (
                  <div key={item}>
                    <span>{item}</span>
                    <strong>{index === 1 ? "PDF" : "Live"}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="landingOpsAside">
              <span>Command</span>
              <strong>Send CVs to employer</strong>
              <small>Same action layer for staff and admin, scoped by role.</small>
            </div>
          </div>
        </div>
        <div className="landingHeroCopy">
          <p className="eyebrow">Next-generation StudentHub</p>
          <h1>One modern platform, purpose-built portals.</h1>
          <p>
            A Silicon Valley-grade rebuild for candidates, staff, companies, inspectors, and admins. Each person gets the
            right login and workflow, while shared modules keep search, documents, payments, and reporting unified.
          </p>
          <div className="landingActions">
            <Link className="primary" href="/login/candidate">Students start here</Link>
            <Link href="/login">Choose another portal</Link>
          </div>
          <div className="landingHeroStats" aria-label="StudentHub platform goals">
            <span>Role-specific access</span>
            <span>Shared search and documents</span>
            <span>Production-data migration path</span>
          </div>
        </div>
      </section>

      <section className="portalGrid" aria-label="StudentHub portals">
        {portalRoles.map((role) => {
          const portal = portalContent[role];
          return (
            <Link href={portal.href as Route} key={role}>
              <span>{portal.label}</span>
              <strong>{portal.audience}</strong>
              <small>{portal.promise}</small>
            </Link>
          );
        })}
      </section>

      <section className="landingSearchSection">
        <div>
          <p className="eyebrow">Search-first migration</p>
          <h2>Candidate search should feel instant, forgiving, and operational.</h2>
          <p>
            The app should index the production candidate model into a dedicated search layer, then keep MySQL as the source
            of truth for workflows, permissions, and writes.
          </p>
        </div>
        <div className="searchSignalGrid">
          {searchSignals.map((signal) => (
            <article key={signal}>
              <span>Search</span>
              <strong>{signal}</strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
