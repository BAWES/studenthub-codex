import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getContractDetail } from "../actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function StaffContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("staff", "contracts.read");
  const { id } = await params;
  const data = await getContractDetail({ uuid: id });

  if (!data.contract) {
    notFound();
  }

  const { contract } = data;

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Staff / Contracts"
      title={`${contract.type} Contract`}
      metrics={[]}
    >
      <DetailSection
        title="Contract Details"
        facts={[
          { label: "Type", value: contract.type },
          { label: "Status", value: contract.status_label },
          { label: "Start Date", value: formatDate(contract.start_date ? new Date(contract.start_date) : null) },
          { label: "End Date", value: formatDate(contract.end_date ? new Date(contract.end_date) : null) },
          { label: "Transfer Cost", value: contract.transfer_cost ? `${contract.transfer_cost} ${contract.currency_code ?? ""}` : "N/A" },
          { label: "Auto Generate", value: contract.auto_generate ? "Yes" : "No" },
          { label: "Created", value: formatDate(contract.created_at ? new Date(contract.created_at) : null) },
          { label: "Updated", value: formatDate(contract.updated_at ? new Date(contract.updated_at) : null) },
        ]}
      />
      <section className="detailGrid">
        {contract.candidate?.candidate_name && (
          <DetailSection
            title="Candidate"
            facts={[
              { label: "Name", value: contract.candidate.candidate_name },
            ]}
          />
        )}
        {contract.company?.company_name && (
          <DetailSection
            title="Company"
            facts={[
              { label: "Name", value: contract.company.company_name },
            ]}
          />
        )}
        {contract.detail && (
          <DetailSection
            title="Additional Details"
            facts={[
              { label: "Notes", value: contract.detail },
            ]}
          />
        )}
      </section>
    </WorkspaceShell>
  );
}
