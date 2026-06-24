import { requireRoleCapability } from "@/modules/auth/session";
import { getStaffInterviewRows } from "@/modules/workspace/data";
import { StaffInterviewsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function StaffInterviewsPage() {
  const session = await requireRoleCapability("staff", "request.interview");
  const rows = await getStaffInterviewRows(Number(session.id));

  return <StaffInterviewsTable session={session} rows={rows} />;
}
