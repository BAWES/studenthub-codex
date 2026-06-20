import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { roleDefaultRoute } from "@/modules/auth/types";
import { LoginForm } from "@/modules/auth/LoginForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const dynamic = "force-dynamic";

const features = [
  "Account credentials",
  "Automatic role detection",
  "Scoped workspaces",
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect(roleDefaultRoute(session.role));
  const params = await searchParams;

  return (
    <main className="min-h-svh grid grid-cols-[minmax(0,1fr)_minmax(400px,520px)] bg-background max-[900px]:grid-cols-1 max-[900px]:grid-rows-[auto_minmax(0,1fr)]">
      {/* ── Brand side — ambient coral gradient ──────────────────────── */}
      <div className="relative grid content-center gap-4 p-[clamp(32px,5vw,64px)] overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-[color-mix(in_srgb,var(--sh-coral)_18%,transparent)] via-transparent to-[color-mix(in_srgb,#1f73b7_12%,transparent)]"
          aria-hidden="true"
        />

        <div className="relative z-1 animate-[shLoginBrandFadeIn_600ms_var(--sh-easing)_both]">
          <div className="inline-flex items-center gap-[10px] mb-3">
            <span className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-[var(--sh-coral)] text-white text-lg font-black">
              SH
            </span>
            <strong className="text-xl font-bold text-foreground">
              StudentHub
            </strong>
          </div>

          <h1 className="m-0 text-[clamp(40px,5vw,72px)] leading-[0.92] font-extrabold tracking-[-0.03em] text-foreground">
            Sign in once.
            <br />
            <span className="bg-gradient-to-r from-foreground to-[var(--sh-coral)] bg-clip-text text-transparent">
              The right workspace opens.
            </span>
          </h1>

          <p className="max-w-[480px] text-[clamp(15px,1.4vw,18px)] leading-[1.5] text-muted-foreground mt-3">
            Your account credentials know who you are. No guessing
            between admin, staff, candidate, company, or inspector.
          </p>

          <div className="flex flex-wrap gap-2 mt-[18px]">
            {features.map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="text-[var(--sh-coral)] border-[var(--sh-coral)]/30 bg-[var(--sh-coral)]/10 text-[11px] font-black uppercase tracking-[0.03em]"
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form side — solid card ──────────────────────────────────── */}
      <div className="grid content-center p-6 bg-card border-l border-border max-[900px]:border-l-0 max-[900px]:p-4">
        <div className="w-full max-w-[420px] mx-auto">
          <div className="animate-[shLoginFormIn_400ms_var(--sh-easing)_both] [animation-delay:60ms]">
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-2xl font-bold leading-[1.15]">
                  Continue to StudentHub
                </CardTitle>
                <CardDescription className="text-sm leading-[1.45]">
                  Sign in with your account credentials.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {params.error === "expired" ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>
                      That verified account choice expired. Sign in again to continue.
                    </AlertDescription>
                  </Alert>
                ) : null}
                {params.error === "account" ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>
                      Choose a verified account to continue.
                    </AlertDescription>
                  </Alert>
                ) : null}

                <LoginForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
