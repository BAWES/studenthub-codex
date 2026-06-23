// ---------------------------------------------------------------------------
// Staff — Contracts Server Actions (page-level re-exports)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/staff/contracts/actions.ts (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export {
  listContracts,
  getContractDetail,
  updateContractStatus,
} from "@/modules/staff/contracts/actions";
