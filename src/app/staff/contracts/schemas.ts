// ---------------------------------------------------------------------------
// Staff — Contracts Schemas (page-level re-exports)
// ---------------------------------------------------------------------------
// All schema definitions live in src/modules/staff/contracts/schemas.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export {
  listContractsSchema,
  getContractSchema,
  updateContractStatusSchema,
  contractRowOutputSchema,
  contractListOutputSchema,
  contractDetailObjectOutputSchema,
  contractDetailOutputSchema,
  contractStatusUpdateOutputSchema,
  contractActionResponseOutputSchema,
  type ListContractsInput,
  type GetContractInput,
  type UpdateContractStatusInput,
  type ContractRow,
  type ContractDetail,
  type ListContractsResult,
  type ContractActionResponse,
} from "@/modules/staff/contracts/schemas";
