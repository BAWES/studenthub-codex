import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/modules/auth/LoginForm";
import { getSession } from "@/modules/auth/session";
import { portalContent } from "@/modules/auth/portalContent";
import { roles, type Role } from "@/modules/auth/types";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function RoleLoginPage({ params }: { params: Promise<{ role: string }> }) {
  const session = await getSession();
  if (session) redirect("/hub");

  const { role: roleParam } = await params;
  if (!roles.includes(roleParam as Role)) notFound();
  const role = roleParam as Role;
  const portal = portalContent[role];

  return (
    <main className="roleLoginShell">
      <section className="roleLoginIntro">
        <nav className="landingNav compact" aria-label="StudentHub login navigation">
          <Link className="landingBrand" href="/">
            <span>SH</span>
            <strong>StudentHub</strong>
          </Link>
          <ThemeToggle />
        </nav>
        <div>
          <p className="eyebrow">{portal.label}</p>
          <h1>{portal.audience}</h1>
          <p>{portal.promise}</p>
          <div className="roleLoginPromise">
            <span>Production-compatible authentication</span>
            <span>Role-scoped workspace</span>
            <span>Shared search, documents, finance, and workflow modules</span>
          </div>
        </div>
        <Link className="switchPortalLink" href="/login">Use another portal</Link>
      </section>
      <section className="loginPanel appLoginPanel" aria-label={`${portal.label} sign in`}>
        <LoginForm lockedRole={role} />
      </section>
    </main>
  );
}
