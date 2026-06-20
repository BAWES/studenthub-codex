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
    // Session check failed -- continue unauthenticated
  }

  // Already logged in -- send to app
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
    // searchParams unavailable -- render without pre-selection
  }

  return (
    <main className="min-h-svh grid grid-cols-[minmax(0,1fr)_minmax(400px,520px)] bg-[var(--paper)] max-[900px]:grid-cols-1 max-[900px]:grid-rows-[auto_minmax(0,1fr)]">
      {/* ── Brand side -- an ambient coral/blue gradient ──────────────── */}
      <div className="relative grid content-center gap-4 p-[clamp(32px,5vw,64px)] overflow-hidden">
        <div className="absolute inset-0 shLoginGradient" aria-hidden="true" />

        <div className="relative z-1 animate-[shLoginBrandFadeIn_600ms_var(--sh-easing)_both]">
          <div className="inline-flex items-center gap-[10px] mb-3">
            <span className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-[#1f73b7] text-white text-lg font-black">
              SH
            </span>
            <strong className="text-xl font-bold text-[var(--ink)]">
              StudentHub
            </strong>
          </div>

          <h1 className="m-0 text-[clamp(40px,5vw,72px)] leading-[0.92] font-extrabold tracking-[-0.03em] text-[var(--ink)]">
            Join StudentHub.
            <br />
            <span className="bg-gradient-to-r from-[var(--ink)] to-[var(--sh-coral)] bg-clip-text text-transparent">
              Start building your future.
            </span>
          </h1>

          <p className="max-w-[480px] text-[clamp(15px,1.4vw,18px)] leading-[1.5] text-[var(--muted)] mt-3">
            Create your free account. Staff recruiters find the right
            opportunities — no automated matching, no spam.
          </p>

          <div className="flex flex-wrap gap-2 mt-[18px]">
            {["Free to join", "Staff-matched roles", "Secure & verified"].map(
              (item) => (
                <span
                  key={item}
                  className="min-h-8 inline-flex items-center px-3 rounded-full text-[11px] font-black uppercase tracking-[0.03em] bg-[var(--sh-coral-light)] border border-[color-mix(in_srgb,var(--sh-coral)_20%,transparent)] text-[var(--sh-coral)]"
                >
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Form side -- solid card ────────────────────────────────────── */}
      <div className="grid content-center p-6 bg-[var(--surface)] border-l border-[var(--line)] max-[900px]:border-l-0 max-[900px]:p-4">
        <div className="w-full max-w-[420px] mx-auto">
          <div className="rounded-[var(--sh-radius-xl)] bg-[var(--surface)] border border-[var(--line)] shadow-[var(--shadow-sm)] overflow-hidden animate-[shLoginFormIn_400ms_var(--sh-easing)_both] [animation-delay:60ms]">
            <SignupForm defaultRole={defaultRole} />
          </div>

          <div className="flex items-center justify-center gap-5 mt-5 text-[13px] text-[var(--muted)] animate-[shLoginFormIn_500ms_var(--sh-easing)_both] [animation-delay:200ms]">
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
      </div>
    </main>
  );
}
