import { Shield, Sparkles } from "lucide-react";
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
    <main className="shSignupRoot">
      {/* ── Brand side — animated gradient + value proposition ────────── */}
      <div className="shSignupBrand">
        <div className="shSignupGradient" aria-hidden="true" />

        <div className="shSignupBrandContent">
          <div className="shSignupBrandLogo">
            <span>SH</span>
            <strong>StudentHub</strong>
          </div>

          <h1 className="shSignupBrandTitle">
            Join StudentHub.<br />
            <span className="shSignupBrandHighlight">Start building your future.</span>
          </h1>

          <p className="shSignupBrandBody">
            Whether you&apos;re looking for work or hiring talent — one
            account gives you access to everything.
          </p>

          <div className="shSignupBrandPills">
            {["Free to join", "Staff-matched roles", "Secure & verified"].map(
              (item) => (
                <span key={item} className="shSignupBrandPill">
                  {item}
                </span>
              )
            )}
          </div>

          <div className="shSignupTrustRow">
            <span className="shSignupTrustItem">
              <Shield className="shSignupTrustIcon" />
              Encrypted & secure
            </span>
            <span className="shSignupTrustItem">
              <Sparkles className="shSignupTrustIcon" />
              Free to join
            </span>
          </div>
        </div>
      </div>

      {/* ── Form side — clean card with role selection / registration ──── */}
      <div className="shSignupFormSide">
        <div className="shSignupFormWrap">
          <div className="shSignupFormCard">
            <SignupForm defaultRole={defaultRole} />
          </div>
        </div>
      </div>
    </main>
  );
}
