import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { listAdminJobs } from "@/modules/admin/jobs/actions";
import { AdminJobsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminJobPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const { jobs } = await listAdminJobs({ limit: 200 });

  return <AdminJobsTable session={session} jobs={jobs} />;
}
