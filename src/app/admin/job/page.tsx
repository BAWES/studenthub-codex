import { requireRoleCapability } from "@/modules/auth/session";
import { listJobs } from "./actions";
import { AdminJobsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminJobsPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listJobs({ limit: 100 });

  return <AdminJobsTable session={session} jobs={result.jobs} />;
}
