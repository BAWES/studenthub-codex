import { Suspense } from "react";
import { getSession } from "@/modules/auth/session";
import { LandingPage } from "@/components/landing";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "StudentHub — Connecting Students with the Right Employers",
  description:
    "Kuwait's platform for student placement. Our staff recruiters match students with employers — AI assists every step of the way.",
  openGraph: {
    title: "StudentHub | Find Student Jobs & Hire Talent in Kuwait",
    description:
      "Staff-driven student placement in Kuwait. Recruiters match candidates to roles. Timesheets, payments, and compliance in one platform.",
    type: "website",
  },
  keywords: [
    "student jobs Kuwait",
    "hire students Kuwait",
    "student placement",
    "Kuwait jobs for students",
    "employer student hiring",
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
