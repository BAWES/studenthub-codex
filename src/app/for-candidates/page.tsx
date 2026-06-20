import { Suspense } from "react";
import { getSession } from "@/modules/auth/session";
import CandidateLandingContent from "./CandidateLandingContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Find Your Next Placement | StudentHub for Candidates",
  description:
    "Create a free profile visible to 60+ employers. Staff recruiters match you to open roles across Kuwait. One tap apply, timesheets, and payments. 1,200+ candidates placed this year.",
  openGraph: {
    title: "StudentHub for Candidates | Start Your Career Journey",
    description:
      "Free profile, staff-matched placements, one-tap applications, timesheets and payments. Discover the role that fits your skills and schedule.",
  },
};

export default async function ForCandidatesPage() {
  const session = await getSession();

  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <CandidateLandingContent session={session} />
    </Suspense>
  );
}
