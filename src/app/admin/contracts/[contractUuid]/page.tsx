import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getContract } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminContractDetailPage({
  params,
}: {
  params: Promise<{ contractUuid: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { contractUuid } = await params;

  const data = await getContract(contractUuid);

  if (!data.contract) {
    notFound();
  }

  const contract = data.contract;

  const statusLabel: Record<number, string> = {
    0: "Draft",
    1: "Active",
    2: "Suspended",
    3: "Terminated",
  };

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Contracts"
        title={contract.type}
        metrics={[
          {
            label: "Status",
            value: statusLabel[contract.status] ?? `Status ${contract.status}`,
            note: "",
          },
        ]}
      >
        <DetailSection
          title="Contract Details"
          facts={[
            { label: "Type", value: contract.type ?? "—" },
            { label: "Detail", value: contract.detail ?? "—" },
            { label: "Company", value: contract.company_name ?? "—" },
            { label: "Candidate", value: contract.candidate_name ?? "—" },
            { label: "Created by", value: contract.created_by_name ?? "—" },
            { label: "Store", value: contract.store_name ?? "—" },
            {
              label: "Start date",
              value: contract.start_date ? new Date(contract.start_date).toLocaleDateString() : "—",
            },
            {
              label: "End date",
              value: contract.end_date ? new Date(contract.end_date).toLocaleDateString() : "—",
            },
            {
              label: "Transfer cost",
              value: contract.transfer_cost != null ? `${contract.transfer_cost} ${contract.currency_code ?? "KWD"}` : "—",
            },
            {
              label: "Auto generate",
              value: contract.auto_generate ? "Yes" : "No",
            },
            {
              label: "Created at",
              value: contract.created_at ? new Date(contract.created_at).toLocaleString() : "—",
            },
            {
              label: "Updated at",
              value: contract.updated_at ? new Date(contract.updated_at).toLocaleString() : "—",
            },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
