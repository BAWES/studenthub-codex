// ---------------------------------------------------------------------------
// Candidate Agencies — colocated server actions
// Delegates to module-level actions in @/modules/candidates/agencies/actions
// ---------------------------------------------------------------------------

export {
  listAgencies,
  getAgency,
  createAgency,
  updateAgency,
  deleteAgency,
} from "@/modules/candidates/agencies/actions";

export type {
  AgencyItem,
  ListAgenciesResult,
  AgencyActionResult,
} from "@/modules/candidates/agencies/schemas";
