import { requireRoleCapability } from "@/modules/auth/session";
import { listAgencies } from "./actions";
import { CandidateAgenciesTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function CandidateAgenciesPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const result = await listAgencies({ limit: 100 });

  const rows = result.items.map((a) => ({
    id: `agency-${a.company_id}`,
    companyName: a.company_name,
    companyEmail: a.company_email ?? "",
    companyWebsite: a.company_website ?? "",
    commercialLicence: a.commercial_licence ?? "",
    totalCandidates: a.total_candidate ?? 0,
    activeRequests: a.no_of_active_requests ?? 0,
    createdAt: a.company_created_at?.toISOString().slice(0, 10) ?? "",
  }));

  return (
    <CandidateAgenciesTable
      session={session}
      rows={rows}
      total={result.total}
    />
  );
}
