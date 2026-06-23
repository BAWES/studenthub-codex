// ---------------------------------------------------------------------------
// Staff-salaries — barrel exports
// ---------------------------------------------------------------------------

export {
  listStaffSalaries,
  getStaffSalary,
  createStaffSalary
} from "./actions";

export type {
  StaffSalaryItem,
  ListStaffSalariesResult,
  SalaryActionResult
} from "./schemas";

export {
  staffSalaryItemSchema,
  listStaffSalariesResultSchema,
  salaryActionResultSchema
} from "./schemas";
