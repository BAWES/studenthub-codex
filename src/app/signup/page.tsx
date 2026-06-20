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
            Join StudentHub.<br />
            <span className="shLoginBrandHighlight">Build your career or find talent.</span>
          </h1>

          <p className="shLoginBrandBody">
            Staff-matched placements connect students with the right employers.
            One profile makes you visible across 500+ organisations in Kuwait.
          </p>

          <div className="shLoginBrandPills">
            {["Free to join", "Staff-matched", "3-minute setup"].map(
              (item) => (
                <span key={item} className="shLoginBrandPill">
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Form side — solid card ────────────────────────────────────── */}
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
