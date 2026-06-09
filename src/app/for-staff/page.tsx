import { Suspense } from "react";
import { getSession } from "@/modules/auth/session";
import StaffLandingContent from "./StaffLandingContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "StudentHub for Staff — Place candidates faster",
  description:
    "AI-powered candidate matching, auto-generated compliance docs, and real-time placement tracking. 350+ agencies already placing faster with StudentHub.",
  openGraph: {
    title: "StudentHub for Staff",
    description:
      "Place candidates faster with AI matching, automated paperwork, and compliance tracking — all in one workspace.",
  },
};

export default async function ForStaffPage() {
  const session = await getSession();

  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <StaffLandingContent session={session} />
    </Suspense>
  );
}
