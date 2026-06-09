import { Suspense } from "react";
import { getSession } from "@/modules/auth/session";
import CandidateLandingContent from "./CandidateLandingContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "StudentHub for Candidates — Find your next placement",
  description:
    "Create a free profile, get matched to open roles, apply in one click, and track every application from a single dashboard. 1,200+ candidates placed this year.",
  openGraph: {
    title: "StudentHub for Candidates",
    description:
      "Find your next placement and get paid — all from one profile. Smart job matching, one-tap applications, timesheets & payments.",
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
