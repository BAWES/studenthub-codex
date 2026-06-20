// ---------------------------------------------------------------------------
// Candidate Agency [id] — colocated server actions
// Delegates to module-level actions in @/modules/candidates/agencies/actions
// ---------------------------------------------------------------------------

export {
  getAgency,
  updateAgency,
  deleteAgency,
} from "@/modules/candidates/agencies/actions";

export type {
  AgencyItem,
  AgencyActionResult,
} from "@/modules/candidates/agencies/schemas";
