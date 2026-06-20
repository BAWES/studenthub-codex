import { requireRoleCapability } from "@/modules/auth/session";
import { getEmployerDashboardData } from "./actions";
import { EmployerDashboardContent } from "./employer-dashboard-content";

export const dynamic = "force-dynamic";

export default async function EmployerDashboardPage() {
  const session = await requireRoleCapability("company", "company.read.linked");
  const data = await getEmployerDashboardData();

  return (
    <EmployerDashboardContent
      session={session}
      metrics={data.metrics}
      recentApplications={data.recentApplications}
      jobStatusBreakdown={data.jobStatusBreakdown}
      totalJobs={data.totalJobs}
      totalApplications={data.totalApplications}
    />
  );
}
