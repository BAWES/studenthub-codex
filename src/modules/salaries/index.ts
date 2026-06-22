// ---------------------------------------------------------------------------
// Salaries — barrel exports
// ---------------------------------------------------------------------------

export {
  listSalaries,
  getSalary,
} from "./actions";

export type {
  SalaryListItem,
  ListSalariesResult,
} from "./schemas";

export {
  salaryListItemSchema,
  listSalariesResultSchema,
  listSalariesSchema,
  getSalarySchema,
} from "./schemas";
