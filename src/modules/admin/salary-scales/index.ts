export {
  listSalaryScalesSchema,
  salaryScaleItemSchema,
  listSalaryScalesResultSchema,
  createSalaryScaleSchema,
} from "./schemas";
export type {
  ListSalaryScalesInput,
  SalaryScaleItem,
  ListSalaryScalesResult,
  CreateSalaryScaleInput,
} from "./schemas";
export { listSalaryScales, createSalaryScale, updateSalaryScale, deleteSalaryScale } from "./actions";
