import { Suspense } from "react";
import { getSession } from "@/modules/auth/session";
import LandingContent from "./LandingContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "StudentHub — Connecting Students with the Right Employers",
  description:
    "A two-sided marketplace connecting students with employers across Kuwait. Create your free profile, get AI-matched with roles, and get hired — all on one platform.",
  openGraph: {
    title: "StudentHub | Find Student Jobs & Hire Talent in Kuwait",
    description:
      "Two-sided marketplace for student talent. Students build careers, employers find vetted candidates — with AI matching, timesheets, and compliance.",
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
