import { requireRoleCapability } from "@/modules/auth/session";
import { listBankTransactions, getReconciliationStatus } from "./actions";
import { AdminXeroPage } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminXeroRoute() {
  const session = await requireRoleCapability("admin", "admin.read");
  const [result, reconciliation] = await Promise.all([
    listBankTransactions({ limit: 100 }),
    getReconciliationStatus(),
  ]);

  return (
    <AdminXeroPage
      session={session}
      transactions={result.transactions}
      reconciliation={reconciliation}
    />
  );
}
