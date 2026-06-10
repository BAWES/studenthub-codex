import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const session = await getSession();
  if (session) redirect("/app");

  return (
    <main className="shLoginRoot">
      {/* ── Brand side ──────────────────────────────────────────── */}
      <div className="shLoginBrand">
        <div className="shLoginGradient" aria-hidden="true" />

        <div className="shLoginBrandContent">
          <div className="shLoginBrandLogo">
            <span>SH</span>
            <strong>StudentHub</strong>
          </div>

          <h1 className="shLoginBrandTitle">
            Forgot your password?<br />
            <span className="shLoginBrandHighlight">Don&apos;t worry — it happens to the best of us.</span>
          </h1>

          <p className="shLoginBrandBody">
            Enter the email address associated with your account and we&apos;ll
            send you a link to reset your password.
          </p>

          <div className="shLoginBrandPills">
            {["Encrypted tokens", "One-time use", "15 min expiry"].map(
              (item) => (
                <span key={item} className="shLoginBrandPill">
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Form side ────────────────────────────────────────────── */}
      <div className="shLoginFormSide">
        <div className="shLoginFormWrap">
          <div className="shLoginFormCard">
            <div className="shLoginFormCardHeader shLoginStagger">
              <strong>Reset your password</strong>
              <p>We&apos;ll send a reset link to your email.</p>
            </div>

            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </main>
  );
}