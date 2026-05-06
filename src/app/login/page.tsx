import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { portalContent } from "@/modules/auth/portalContent";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/hub");

  return (
    <main className="portalChooserShell">
      <nav className="landingNav" aria-label="StudentHub login navigation">
        <Link className="landingBrand" href="/">
          <span>SH</span>
          <strong>StudentHub</strong>
        </Link>
        <ThemeToggle />
      </nav>

      <section className="portalChooserHero">
        <p className="eyebrow">Choose your login</p>
        <h1>Enter through the portal that matches your role.</h1>
        <p>
          The advanced app shares modules behind the scenes, but access stays separated for candidates, staff, companies,
          admins, and inspectors.
        </p>
        <div className="portalChooserPromise">
          <span>Same production credentials</span>
          <span>No account switching tricks</span>
          <span>Shared modules after access is verified</span>
        </div>
      </section>

      <section className="portalChoiceGrid" aria-label="Role-specific logins">
        {(["candidate", "staff", "company", "admin", "inspector"] as const).map((role) => {
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
    </main>
  );
}
