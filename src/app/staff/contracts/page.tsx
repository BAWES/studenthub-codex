import { requireRoleCapability } from "@/modules/auth/session";
import { listContracts } from "./actions";
import { StaffContractsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function StaffContractsPage() {
  const session = await requireRoleCapability("staff", "contracts.read");
  const result = await listContracts({ limit: 60 });

  const rows = result.items.map((item) => ({
    id: item.contract_uuid,
    contract_uuid: item.contract_uuid,
    candidate_name: item.candidate_name,
    company_name: item.company_name,
    type: item.type,
    status_label: item.status_label,
    start_date: item.start_date,
    end_date: item.end_date,
    transfer_cost: item.transfer_cost,
    currency_code: item.currency_code,
    created_at: item.created_at,
  }));

  return <StaffContractsTable session={session} rows={rows} />;
}
