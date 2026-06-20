import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { roleDefaultRoute } from "@/modules/auth/types";
import { LoginForm } from "@/modules/auth/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect(roleDefaultRoute(session.role));
  const params = await searchParams;

  return (
    <main className="min-h-svh grid place-items-center bg-[var(--paper)]">
      <div className="w-full max-w-[420px] p-6">
        {/* ── Brand ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 mb-8">
          <span className="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-[#1f73b7] text-white text-sm font-black">
            SH
          </span>
          <strong className="text-lg font-bold text-[var(--ink)]">
            StudentHub
          </strong>
        </div>

        {/* ── Form card ──────────────────────────────────────────── */}
        <div className="rounded-xl bg-[var(--surface)] border border-[var(--line)] shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-2">
            <h1 className="text-xl font-bold leading-[1.2] text-[var(--ink)] m-0">
              Sign in
            </h1>
            <p className="text-sm text-[var(--muted)] mt-1 m-0">
              Enter your credentials to continue.
            </p>
          </div>

          {params.error === "expired" ? (
            <div className="px-6 pb-3">
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium">
                That session expired. Sign in again to continue.
              </div>
            </div>
          ) : null}
          {params.error === "account" ? (
            <div className="px-6 pb-3">
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium">
                Choose a verified account to continue.
              </div>
            </div>
          ) : null}

          <LoginForm />
        </div>
      </div>
    </main>
  );
}
