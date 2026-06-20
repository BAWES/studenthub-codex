// ---------------------------------------------------------------------------
// Admin Departments — barrel exports
// ---------------------------------------------------------------------------

export {
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "./actions";

export type {
  ListDepartmentsInput,
  GetDepartmentInput,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  DeleteDepartmentInput,
  DepartmentRow,
  DepartmentDetail,
  DepartmentActionResponse,
} from "./schemas";

export {
  listDepartmentsSchema,
  getDepartmentSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  deleteDepartmentSchema,
  departmentListResponseSchema,
  departmentDetailSchema,
  departmentActionResponseSchema,
} from "./schemas";
