// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level implementation
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/admin/employees/actions.ts (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export { getEmployeeById } from "@/modules/admin/employees/actions";
export type { GetEmployeeByIdInput } from "@/modules/admin/employees/schemas";
