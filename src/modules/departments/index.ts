// ---------------------------------------------------------------------------
// Departments — barrel exports
// ---------------------------------------------------------------------------

export {
  listDepartments,
  getDepartment
} from "./actions";

export type {
  ListDepartmentsParams,
  GetDepartmentParams,
  DepartmentItem,
  ListDepartmentsResult
} from "./schemas";

export {
  listDepartmentsSchema,
  getDepartmentSchema,
  departmentItemSchema,
  listDepartmentsResultSchema
} from "./schemas";
