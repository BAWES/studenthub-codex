import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";
import { LoginForm } from "@/modules/auth/LoginForm";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/app");
  const params = await searchParams;

  return (
    <main className="min-h-svh flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] flex flex-col gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2">
          <span className="size-10 inline-flex items-center justify-center rounded-xl bg-foreground text-card font-black text-lg">
            SH
          </span>
          <strong className="text-xl text-foreground">StudentHub</strong>
        </div>

      {/* Intro */}
      <Card className="overflow-hidden border-border bg-gradient-to-br from-blue/10 via-transparent to-transparent">
        <CardContent className="p-[clamp(22px,4vw,48px)]">
          <p className="text-coral text-[11px] font-black uppercase">One StudentHub login</p>
          <h1 className="mt-0 max-w-[760px] text-[clamp(44px,6.4vw,92px)] leading-[0.94] max-sm:text-[40px]">
            Sign in once. We&rsquo;ll open the right workspace.
          </h1>
          <p className="text-muted-foreground max-w-[620px] leading-relaxed">
            No more guessing whether you are entering as admin, staff, candidate, company, or inspector. Your production
            credentials decide what you can see and do.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            {["Production-compatible credentials", "Server-side account detection", "Capability-scoped workspaces"].map(
              (item) => (
                <Badge key={item} variant="outline" className="text-coral text-[11px] font-black uppercase px-3 py-1.5">
                  {item}
                </Badge>
              )
            )}
          </div>
        </CardContent>
        <Link href="/" className="inline-block mt-4 text-sm no-underline text-muted-foreground hover:text-coral px-[clamp(22px,4vw,48px)] pb-[clamp(22px,4vw,48px)]">
          Back to landing
        </Link>
      </Card>

        {/* Footer link */}
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/" className="text-muted-foreground hover:text-[#eb6651] no-underline transition-colors">
            Back to landing
          </Link>
        </p>
      </div>
    </main>
  );
}
