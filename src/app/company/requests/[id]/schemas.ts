// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level schemas
// ---------------------------------------------------------------------------
// All schemas and types live in src/modules/company/schemas.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export { companyRequestActionResultSchema } from "@/modules/company/schemas";
export type { CompanyRequestActionResult } from "@/modules/company/schemas";
