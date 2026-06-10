import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/app");

  const params = await searchParams;
  const token = params.token ?? "";

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
            Set a new password<br />
            <span className="shLoginBrandHighlight">
              Choose something you haven&apos;t used before.
            </span>
          </h1>

          <p className="shLoginBrandBody">
            Your new password must be at least 8 characters with an uppercase
            letter and a number or special character.
          </p>

          <div className="shLoginBrandPills">
            {["Encrypted", "One-time link", "Expires in 15 min"].map(
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
              <strong>Set new password</strong>
              <p>Create a strong password for your account.</p>
            </div>

            <ResetPasswordForm token={token} />
          </div>
        </div>
      </div>
    </main>
  );
}