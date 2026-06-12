// ---------------------------------------------------------------------------
// Admin — Departments Schemas (page-level re-exports)
// ---------------------------------------------------------------------------
// All schema definitions live in src/modules/admin/departments/schemas.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export {
  listDepartmentsSchema,
  getDepartmentSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  deleteDepartmentSchema,
  departmentListResponseSchema,
  departmentDetailSchema,
  departmentActionResponseSchema,
  type ListDepartmentsInput,
  type GetDepartmentInput,
  type CreateDepartmentInput,
  type UpdateDepartmentInput,
  type DeleteDepartmentInput,
  type DepartmentRow,
  type DepartmentDetail,
  type DepartmentActionResponse,
  type DepartmentListResponseOutput,
  type DepartmentDetailOutput,
  type DepartmentActionResponseOutput,
} from "@/modules/admin/departments/schemas";
