// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level implementation
// ---------------------------------------------------------------------------

export {
  listSalaryScales,
  createSalaryScale,
  updateSalaryScale,
  deleteSalaryScale,
} from "@/modules/admin/salary-scales/actions";

export type {
  SalaryScaleItem,
  ListSalaryScalesResult,
  SalaryScaleIdResult,
} from "@/modules/admin/salary-scales/schemas";
