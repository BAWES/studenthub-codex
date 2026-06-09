import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { LoginForm } from "@/modules/auth/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/app");
  const params = await searchParams;

  return (
    <main className="shLoginRoot">
      {/* ── Brand side — animated gradient + visual statement ────────── */}
      <div className="shLoginBrand">
        <div className="shLoginGradient" aria-hidden="true" />

        <div className="shLoginBrandContent">
          <div className="shLoginBrandLogo">
            <span>SH</span>
            <strong>StudentHub</strong>
          </div>

          <h1 className="shLoginBrandTitle">
            Sign in once.<br />
            <span className="shLoginBrandHighlight">Every workspace is yours.</span>
          </h1>

          <p className="shLoginBrandBody">
            Candidate, staff, company, admin, or inspector — one account opens
            the right portal for your role. No switching. No guessing.
          </p>
        </div>
      </div>

      {/* ── Form side — glass card ────────────────────────────────────── */}
      <div className="shLoginFormSide">
        <div className="shLoginFormWrap">
          <div className="shLoginFormCard">
            <div className="shLoginFormCardHeader shLoginStagger">
              <strong>Continue to StudentHub</strong>
              <p>Enter your production credentials to sign in.</p>
            </div>

            {params.error === "expired" ? (
              <div className="shLoginFormCardBody">
                <div className="shLoginError">
                  That verified account choice expired. Sign in again to continue.
                </div>
              </div>
            ) : null}
            {params.error === "account" ? (
              <div className="shLoginFormCardBody">
                <div className="shLoginError">
                  Choose a verified account to continue.
                </div>
              </div>
            ) : null}

            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
