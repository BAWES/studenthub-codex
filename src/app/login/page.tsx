import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { LoginForm } from "@/modules/auth/LoginForm";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { isRole, type Role } from "@/modules/auth/types";

export const dynamic = "force-dynamic";

const loginHints: Record<Role, string> = {
  admin: "Admin access is detected after authentication.",
  staff: "Staff access is detected after authentication.",
  company: "Company contact access is detected after authentication.",
  candidate: "Candidate access is detected after authentication.",
  inspector: "Inspector access is detected after authentication."
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ intent?: string; error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/app");
  const params = await searchParams;
  const intent = params.intent ?? null;
  const hint = isRole(intent) ? loginHints[intent] : null;

  return (
    <main className="roleLoginShell unifiedLoginShell">
      <nav className="landingNav" aria-label="StudentHub login navigation">
        <Link className="landingBrand" href="/">
          <span>SH</span>
          <strong>StudentHub</strong>
        </Link>
        <ThemeToggle />
      </nav>

      <section className="roleLoginIntro unifiedLoginIntro">
        <div>
          <p className="eyebrow">One StudentHub login</p>
          <h1>Sign in once. We’ll open the right workspace.</h1>
          <p>
            No more guessing whether you are entering as admin, staff, candidate, company, or inspector. Your production
            credentials decide what you can see and do.
          </p>
          <div className="roleLoginPromise">
            <span>Production-compatible credentials</span>
            <span>Server-side account detection</span>
            <span>Capability-scoped workspaces</span>
          </div>
        </div>
        <Link className="switchPortalLink" href="/">
          Back to landing
        </Link>
      </section>

      <section className="loginPanel appLoginPanel unifiedLoginPanel" aria-label="StudentHub sign in">
        {params.error === "expired" ? (
          <p className="formError">That verified account choice expired. Sign in again to continue.</p>
        ) : null}
        {params.error === "account" ? <p className="formError">Choose a verified account to continue.</p> : null}
        <LoginForm hint={hint ?? undefined} />
      </section>

      <section className="unifiedLoginNotes" aria-label="Account detection notes">
        <article>
          <span>Students</span>
          <strong>Profile, jobs, hours, pay</strong>
        </article>
        <article>
          <span>Staff</span>
          <strong>Requests, candidates, CVs, time</strong>
        </article>
        <article>
          <span>Companies</span>
          <strong>Requests, candidates, invoices</strong>
        </article>
        <article>
          <span>Admin</span>
          <strong>Finance, approvals, migration</strong>
        </article>
      </section>
    </main>
  );
}
