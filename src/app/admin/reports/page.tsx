import { requireRoleCapability } from "@/modules/auth/session";
import { listReports } from "./actions";
import { AdminReportsPageClient } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const reportTypes = await listReports({ limit: 100 });

  return (
    <AdminReportsPageClient
      session={session}
      reportTypes={reportTypes.reports}
    />
  );
}
