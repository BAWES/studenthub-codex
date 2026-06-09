import { Suspense } from "react";
import { getSession } from "@/modules/auth/session";
import LandingContent from "./LandingContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "StudentHub — Unified Platform for Hiring, Compliance & Workforce Management",
  description:
    "Connect candidates, staffing agencies, employers, and compliance teams on one platform. Smart matching, timesheet management, compliance automation, and consolidated billing — purpose-built for modern workforce operations.",
  openGraph: {
    title: "StudentHub | Smarter Hiring, Compliance & Workforce Operations",
    description:
      "One platform for candidates, staffing agencies, employers, and compliance. AI matching, timesheets, compliance automation, and unified billing.",
  },
};

export default async function Home() {
  const session = await getSession();

  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <LandingContent session={session} />
    </Suspense>
  );
}
