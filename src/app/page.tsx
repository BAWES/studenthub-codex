import { Suspense } from "react";
import { getSession } from "@/modules/auth/session";
import { LandingPage } from "@/components/landing";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "StudentHub — Connecting Students with the Right Employers",
  description:
    "Kuwait's two-sided marketplace for student placement. Students build careers and employers discover vetted talent — powered by our staff recruiters.",
  openGraph: {
    title: "StudentHub | Find Student Jobs & Hire Talent in Kuwait",
    description:
      "Kuwait's two-sided marketplace connecting students with employers. Staff recruiters match candidates to roles. Timesheets, payments, and compliance in one platform.",
    type: "website",
  },
  keywords: [
    "student jobs Kuwait",
    "hire students Kuwait",
    "student placement",
    "Kuwait jobs for students",
    "employer student hiring",
    "two-sided marketplace Kuwait",
    "student work placement Kuwait",
  ],
};

export default async function Home() {
  const session = await getSession();

  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <LandingPage session={session} />
    </Suspense>
  );
}
