import { redirect } from "next/navigation";
import { LoginForm } from "@/modules/auth/LoginForm";
import { getSession } from "@/modules/auth/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(`/${session.role}`);

  return (
    <main className="loginShell">
      <section className="loginBrandPanel" aria-label="StudentHub">
        <div className="loginMasthead">
          <span className="brandMark">SH</span>
          <div>
            <strong>StudentHub</strong>
            <small>Operations console</small>
          </div>
        </div>

        <div className="loginHero">
          <p className="eyebrow">Local Production Validation</p>
          <h1>One console for every workspace.</h1>
          <p>
            Sign in with the same production credentials and review the rebuild against the imported local data clone.
          </p>
        </div>

        <div className="loginProof" aria-label="Imported data coverage">
          <div>
            <span>Candidates</span>
            <strong>53k+</strong>
          </div>
          <div>
            <span>Companies</span>
            <strong>500+</strong>
          </div>
          <div>
            <span>Workspaces</span>
            <strong>5</strong>
          </div>
        </div>

        <div className="loginSignal">
          <div>
            <span>Database</span>
            <strong>studenthub_prod_local</strong>
          </div>
          <div>
            <span>Mode</span>
            <strong>Read-only validation</strong>
          </div>
        </div>
      </section>

      <section className="loginPanel" aria-label="Sign in">
        <LoginForm />
      </section>
    </main>
  );
}
