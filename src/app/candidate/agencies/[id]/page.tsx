import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { getAgency } from "./actions";

export const dynamic = "force-dynamic";

export default async function CandidateAgencyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const { id } = await params;

  const agency = await getAgency({ companyId: Number(id) });
  if (!agency) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate / Agencies"
      title={agency.company_name}
      metrics={[
        { label: "Name", value: agency.company_name, note: "Agency name" },
        { label: "Candidates", value: agency.total_candidate?.toString() ?? "—", note: "Total candidates" },
        { label: "Active Requests", value: agency.no_of_active_requests?.toString() ?? "—", note: "Open requests" },
      ]}
    >
      <DetailSection
        title="Agency Details"
        facts={[
          { label: "Company Name", value: agency.company_name },
          { label: "Common Name (EN)", value: agency.company_common_name_en ?? "—" },
          { label: "Common Name (AR)", value: agency.company_common_name_ar ?? "—" },
          { label: "Email", value: agency.company_email ?? "—" },
          { label: "Website", value: agency.company_website ?? "—" },
          { label: "Commercial Licence", value: agency.commercial_licence ?? "—" },
          { label: "Total Candidates", value: agency.total_candidate?.toString() ?? "—" },
          { label: "Active Requests", value: agency.no_of_active_requests?.toString() ?? "—" },
          { label: "Created", value: agency.company_created_at ? formatDate(agency.company_created_at) : "N/A" },
          { label: "Updated", value: agency.company_updated_at ? formatDate(agency.company_updated_at) : "N/A" },
        ]}
      />

      <div className="flex items-center gap-3 mt-8">
        <Link href="/candidate/agencies" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
          Back to Agencies
        </Link>
      </div>
    </WorkspaceShell>
  );
}
