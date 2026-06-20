import { getSession } from "@/modules/auth/session";
import { SignupForm } from "@/modules/auth/SignupForm";
import { redirect } from "next/navigation";
import type { Role } from "@/modules/auth/types";

export const dynamic = "force-dynamic";

// All landing page CTAs link to /signup?role=<role>. Candidate and company
// support self-registration; staff, admin, and inspector roles show a
// contextual message in SignupForm guiding users to request access.
const VALID_ROLES: Role[] = ["candidate", "company", "staff", "admin", "inspector"];

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  // Defensive: wrap session check to prevent crash if cookies() fails
  let session = null;
  try {
    session = await getSession();
  } catch {
    // Session check failed — continue unauthenticated
  }

  // Already logged in — send to app
  if (session) {
    redirect("/app");
  }

  let defaultRole: Role | undefined;
  try {
    const params = await searchParams;
    defaultRole = VALID_ROLES.includes(params.role as Role)
      ? (params.role as Role)
      : undefined;
  } catch {
    // searchParams unavailable — render without pre-selection
  }

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
            Create your account.<br />
            <span className="shLoginBrandHighlight">The right workspace opens.</span>
          </h1>

          <p className="shLoginBrandBody">
            Sign up as a student looking for work or an employer hiring talent.
            One account, one platform — staff recruiters handle the match.
          </p>

          <div className="shLoginBrandPills">
            {["Student or employer", "Free to join", "Encrypted & secure"].map(
              (item) => (
                <span key={item} className="shLoginBrandPill">
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Form side — clean card ──────────────────────────────────── */}
      <div className="shLoginFormSide">
        <div className="shLoginFormWrap">
          <div className="shLoginFormCard">
            <SignupForm defaultRole={defaultRole} />
          </div>
        </div>
      </div>
    </main>
  );
}
