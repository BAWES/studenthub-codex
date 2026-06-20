import { getSession } from "@/modules/auth/session";
import { SignupForm } from "@/modules/auth/SignupForm";
import { redirect } from "next/navigation";
import type { Role } from "@/modules/auth/types";
import { Briefcase, GraduationCap, Shield, Sparkles, Users } from "lucide-react";

export const dynamic = "force-dynamic";

// All landing page CTAs link to /signup?role=<role>. Candidate and company
// support self-registration; staff, admin, and inspector roles show a
// contextual message in SignupForm guiding users to request access.
const VALID_ROLES: Role[] = ["candidate", "company", "staff", "admin", "inspector"];

const BRAND_COPY = {
  headline: "Your career starts here",
  subheadline:
    "Join thousands of students finding work and employers building their teams.",
  features: [
    {
      icon: GraduationCap,
      text: "Staff recruiters match you to relevant opportunities",
    },
    {
      icon: Briefcase,
      text: "Track hours, invoices, and payments in one place",
    },
    {
      icon: Users,
      text: "Trusted by 50,000+ students and 1,500+ employers",
    },
  ],
};

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
    <main className="min-h-svh w-full grid lg:grid-cols-2">
      {/* ── Left: Brand panel ── */}
      <div className="relative flex flex-col justify-center p-8 sm:p-12 lg:p-16 overflow-hidden"
        style={{ backgroundColor: "#182230", color: "#ffffff" }}
      >
        {/* Subtle coral gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.04,
            background: "linear-gradient(135deg, #eb6651 0%, transparent 60%)",
          }}
        />

        {/* Decorative corner circles */}
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full"
          style={{ backgroundColor: "#eb6651", opacity: 0.06 }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full"
          style={{ backgroundColor: "#eb6651", opacity: 0.04 }}
        />

        <div className="relative z-10 max-w-md">
          {/* Logo/brand mark */}
          <div className="flex items-center gap-2 mb-10">
            <div
              className="size-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: "#eb6651", color: "#ffffff" }}
            >
              S
            </div>
            <span className="text-lg font-semibold tracking-tight">StudentHub</span>
          </div>

          {/* Headline */}
          <h1 className="text-[32px] sm:text-[40px] font-bold leading-[1.1] tracking-[-0.03em] mb-4">
            {BRAND_COPY.headline}
          </h1>
          <p className="text-[15px] leading-relaxed opacity-70 mb-10">
            {BRAND_COPY.subheadline}
          </p>

          {/* Feature list */}
          <div className="space-y-5">
            {BRAND_COPY.features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.text} className="flex items-start gap-3">
                  <div
                    className="shrink-0 size-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "rgba(235, 102, 81, 0.15)" }}
                  >
                    <Icon className="size-4" style={{ color: "#eb6651" }} />
                  </div>
                  <p className="text-[14px] leading-relaxed opacity-85 m-0">
                    {feature.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-5 mt-12 text-[13px] opacity-50">
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

      {/* ── Right: Form panel ── */}
      <div className="flex items-center justify-center p-4 sm:p-8 lg:p-12"
        style={{ backgroundColor: "var(--paper)" }}
      >
        <div className="w-full max-w-[640px]">
          <div
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[0_18px_50px_rgba(16,24,40,0.08)]"
          >
            <SignupForm defaultRole={defaultRole} />
          </div>
        </div>
      </div>
    </main>
  );
}
