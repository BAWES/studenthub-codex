import { Suspense } from "react";
import { requireRoleCapability } from "@/modules/auth/session";
import { CompanySearchPage } from "./CompanySearchPage";
import { searchCompanyEntities } from "./actions";
import type { CompanySearchResult } from "./schemas";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

function SearchPageFallback() {
  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6">
        <Skeleton variant="pulse" className="mb-2 h-8 w-40" />
        <Skeleton variant="pulse" className="h-4 w-72" />
      </div>
      <div className="mb-6 flex gap-2">
        <Skeleton variant="pulse" className="h-11 flex-1 rounded-lg" />
        <Skeleton variant="pulse" className="h-11 w-24 rounded-lg" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col gap-3">
            <Skeleton variant="pulse" className="h-5 w-40" />
            <Skeleton variant="pulse" className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function CompanySearchPageWrapper() {
  const session = await requireRoleCapability("company", "company.read.linked");

  let initialData: CompanySearchResult | null = null;
  try {
    initialData = await searchCompanyEntities(session.id, { page: 1 });
  } catch {
    // Initial search failed silently — the client component will retry
  }

  return (
    <Suspense fallback={<SearchPageFallback />}>
      <CompanySearchPage session={session} initialData={initialData} searchAction={searchCompanyEntities} />
    </Suspense>
  );
}
