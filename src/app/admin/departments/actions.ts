// ---------------------------------------------------------------------------
// Admin — Departments Server Actions (page-level re-exports)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/admin/departments/actions.ts (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export {
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/modules/admin/departments/actions";
