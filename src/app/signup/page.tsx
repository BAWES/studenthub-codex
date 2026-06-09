import { Shield, Sparkles } from "lucide-react";
import { getSession } from "@/modules/auth/session";
import { SignupForm } from "@/modules/auth/SignupForm";
import { redirect } from "next/navigation";
import type { Role } from "@/modules/auth/types";

export const dynamic = "force-dynamic";

const VALID_ROLES: Role[] = ["candidate", "company"];

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const session = await getSession();

  // Already logged in — send to app
  if (session) {
    redirect("/app");
  }

  const params = await searchParams;
  const defaultRole = VALID_ROLES.includes(params.role as Role)
    ? (params.role as Role)
    : undefined;

  return (
    <main className="min-h-svh w-full grid place-items-center p-4">
      <div className="w-full max-w-[640px]">
        {/* Glass panel container for the form */}
        <div
          className="rounded-xl border border-[var(--sh-glass-border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-xl shadow-[0_18px_50px_rgba(16,24,40,0.08)]"
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
