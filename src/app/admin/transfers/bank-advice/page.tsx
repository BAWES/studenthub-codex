import { requireRoleCapability } from "@/modules/auth/session";
import { listTransferBankAdvices } from "./actions";
import { AdminBankAdviceTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminBankAdvicePage() {
  const session = await requireRoleCapability("admin", "finance.read");
  const result = await listTransferBankAdvices({ limit: 100 });

  return (
    <AdminBankAdviceTable
      session={session}
      advices={result.advices}
    />
  );
}
