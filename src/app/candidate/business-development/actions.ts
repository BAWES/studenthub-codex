// ---------------------------------------------------------------------------
// Candidate Business Development — colocated server actions
// Delegates to module-level actions in @/modules/business-development/actions
// ---------------------------------------------------------------------------

export {
  listBusinessDevelopments as listBusinessDevelopment,
  getBusinessDevelopment,
  createBusinessDevelopment,
  updateBusinessDevelopment,
  deleteBusinessDevelopment,
} from "@/modules/business-development/actions";

export type {
  BusinessDevelopmentItem,
  ListBusinessDevelopmentsResult,
  BusinessDevelopmentActionResult,
} from "@/modules/business-development/schemas";
