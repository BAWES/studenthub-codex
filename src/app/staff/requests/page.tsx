import { requireRoleCapability } from "@/modules/auth/session";
import { listStaffRequests } from "./actions";
import { StaffRequestsTable } from "./staff-requests-table";

export const dynamic = "force-dynamic";

export default async function StaffRequestsPage() {
  const session = await requireRoleCapability("staff", "request.read.assigned");
  const result = await listStaffRequests({ limit: 60 });
  const rows = result.items;

  return <StaffRequestsTable session={session} rows={rows} />;
}
