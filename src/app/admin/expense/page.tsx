import { requireRoleCapability } from "@/modules/auth/session";
import { listExpenses } from "./actions";
import { AdminExpensesPage } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminExpensesListPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listExpenses({ limit: 100 });

  return (
    <AdminExpensesPage session={session} expenses={result.expenses} total={result.total} />
  );
}
