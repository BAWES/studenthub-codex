import { requireRoleCapability } from "@/modules/auth/session";
import { listStaffInterviews } from "./actions";
import { StaffInterviewsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function StaffInterviewsPage() {
  const session = await requireRoleCapability("staff", "request.interview");
  const result = await listStaffInterviews({ limit: 60 });
  const rows = result.items;

  return <StaffInterviewsTable session={session} rows={rows} />;
}
