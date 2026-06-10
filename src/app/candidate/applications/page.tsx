import { requireRoleCapability } from "@/modules/auth/session";
import { listMyApplications } from "../jobs/actions";
import { MyApplicationsTable } from "./my-applications-table";
import type { ApplicationRow } from "../jobs/schemas";
import type { ApplicationRow } from "../jobs/schemas";

export const dynamic = "force-dynamic";

export default async function CandidateApplicationsPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const result = await listMyApplications({ limit: 100 });

  const rows = result.applications.map((a: ApplicationRow) => ({
    id: `app-${a.applicationId}`,
    jobTitle: a.jobTitle,
    employerName: a.employerName,
    status: a.status,
    createdAt: a.createdAt.toISOString().slice(0, 10),
  }));

  return (
    <MyApplicationsTable session={session} rows={rows} total={result.total} />
  );
}
