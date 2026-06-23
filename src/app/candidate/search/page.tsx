import { Suspense } from "react";
import { requireRoleCapability } from "@/modules/auth/session";
import { CandidateSearchPage } from "./CandidateSearchPage";
import { searchCandidates } from "./actions";
import type { CandidateSearchResult } from "./schemas";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

function SearchPageFallback() {
  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6">
        <Skeleton variant="pulse" className="mb-2 h-8 w-56" />
        <Skeleton variant="pulse" className="h-4 w-80" />
      </div>
      <div className="mb-6 flex gap-2">
        <Skeleton variant="pulse" className="h-11 flex-1 rounded-lg" />
        <Skeleton variant="pulse" className="h-11 w-24 rounded-lg" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-white p-4 flex flex-col gap-3">
            <Skeleton variant="pulse" className="h-5 w-40" />
            <Skeleton variant="pulse" className="h-4 w-full" />
            <div className="flex gap-1.5">
              <Skeleton variant="pulse" className="h-5 w-16 rounded-md" />
              <Skeleton variant="pulse" className="h-5 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function SearchPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  let initialData: CandidateSearchResult | null = null;
  try {
    initialData = await searchCandidates({ role: "candidate", page: 1 });
  } catch {
    // Initial search failed silently — the client component will retry
  }

  return (
    <Suspense fallback={<SearchPageFallback />}>
      <CandidateSearchPage session={session} initialData={initialData} />
    </Suspense>
  );
}
