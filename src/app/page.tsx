import { Suspense } from "react";
import { getSession } from "@/modules/auth/session";
import { LandingPage } from "@/components/landing";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "StudentHub — Student Jobs & Hiring in Kuwait",
  description:
    "Kuwait's student placement platform. Students build careers and employers find vetted talent — powered by our staff recruiters who match candidates to roles.",
  openGraph: {
    title: "StudentHub | Student Jobs & Hiring in Kuwait",
    description:
      "Kuwait's student placement platform connecting students with employers. Staff recruiters match candidates to roles. Timesheets, payments, and compliance in one platform.",
    type: "website",
  },
  keywords: [
    "student jobs Kuwait",
    "hire students Kuwait",
    "student placement",
    "Kuwait jobs for students",
    "employer student hiring",
    "staff-matched placement",
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
