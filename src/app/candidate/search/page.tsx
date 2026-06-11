import { Suspense } from "react";
import { requireRoleCapability } from "@/modules/auth/session";
import { CandidateSearchPage } from "./CandidateSearchPage";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  return (
    <Suspense fallback={<div className="searchLoading">Loading search...</div>}>
      <CandidateSearchPage session={session} />
    </Suspense>
  );
}
