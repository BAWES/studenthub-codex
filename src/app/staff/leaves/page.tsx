import { requireRoleCapability } from "@/modules/auth/session";
import { listStaffLeaves } from "@/modules/staff-leaves/actions";
import { StaffLeavesTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function StaffLeavesPage() {
  const session = await requireRoleCapability("staff", "staff_leave.read");
  const result = await listStaffLeaves({ limit: 60 });

  const rows = result.leaves.map((item) => ({
    id: item.staff_leave_uuid,
    staff_leave_uuid: item.staff_leave_uuid,
    staff_id: item.staff_id,
    staff_name: item.staff_name,
    from_date: item.from_date,
    to_date: item.to_date,
    note: item.note,
    category: item.category,
    status: item.status,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));

  return <StaffLeavesTable session={session} rows={rows} />;
}
