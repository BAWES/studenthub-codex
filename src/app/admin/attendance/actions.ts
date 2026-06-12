"use server";

// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level implementation
// ---------------------------------------------------------------------------

export {
  listAdminAttendance,
  createAdminAttendance,
  getEmployeeOptions,
} from "@/modules/admin/attendance/actions";
