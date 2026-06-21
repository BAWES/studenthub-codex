import { requireRoleCapability } from "@/modules/auth/session";
import { AdminPaymentsPage } from "./_components";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await requireRoleCapability("admin", "finance.read");
  return <AdminPaymentsPage session={session} />;
}
