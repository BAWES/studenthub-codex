import { requireRoleCapability } from "@/modules/auth/session";
import { searchJobs } from "@/modules/employer/jobs/actions";
import { EmployerJobsSearchPage } from "./EmployerJobsSearchPage";

export const dynamic = "force-dynamic";

export default async function EmployerJobsPage() {
  const session = await requireRoleCapability("company", "company.read.linked");
  const initialData = await searchJobs({ q: "", page: 1 });

  return (
    <EmployerJobsSearchPage
      session={session}
      initialData={initialData}
      searchAction={searchJobs}
    />
  );
}
