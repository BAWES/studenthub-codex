// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level schemas
// ---------------------------------------------------------------------------
// All schemas and types live in src/modules/company/schemas.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export {
  listCompanyNotesSchema,
  getCompanyNoteSchema,
  createCompanyNoteSchema,
  updateCompanyNoteSchema,
  deleteCompanyNoteSchema,
  companyNoteListItemSchema,
  listCompanyNotesResultSchema,
  companyNoteDetailSchema,
  companyNoteActionResultSchema,
} from "@/modules/company/schemas";

export type {
  ListCompanyNotesInput,
  CreateCompanyNoteInput,
  UpdateCompanyNoteInput,
  CompanyNoteListItem,
  CompanyNoteDetail,
  ListCompanyNotesResult,
} from "@/modules/company/schemas";
