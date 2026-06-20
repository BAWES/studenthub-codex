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
    <main className="min-h-svh w-full grid place-items-center p-4">
      <div className="w-full max-w-[640px]">
        {/* Glass panel container for the form */}
        <div
          className="rounded-xl border border-[var(--border)] bg-white shadow-[0_18px_50px_rgba(16,24,40,0.08)]"
        >
          <SignupForm defaultRole={defaultRole} />
        </div>

        <div className="flex items-center justify-center gap-5 mt-5 text-[13px] text-[var(--muted)]">
          <span className="inline-flex items-center gap-1.5">
            <Shield className="size-3.5" />
            Encrypted & secure
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="size-3.5" />
            Free to join
          </span>
        </div>
      </div>
    </main>
  );
}
