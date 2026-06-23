// ---------------------------------------------------------------------------
// Admin Employees - barrel exports
// ---------------------------------------------------------------------------

export {
  listAdminEmployees,
  createAdminEmployee,
  deleteAdminEmployee,
  getDepartments,
  getDesignations,
  getEmployeeById,
} from "./actions";

export type {
  EmployeeRow,
  ListEmployeesResult,
  ActionResponse,
  ListEmployeesInput,
  GetEmployeeByIdInput,
  CreateEmployeeInput,
} from "./schemas";

export {
  employeeRowSchema,
  listEmployeesResultSchema,
  actionResponseSchema,
  listEmployeesSchema,
  getEmployeeByIdSchema,
  employeeDetailSchema,
  createEmployeeSchema,
} from "./schemas";
