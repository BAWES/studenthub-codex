// ---------------------------------------------------------------------------
// Admin Contracts - barrel exports
// ---------------------------------------------------------------------------

export {
  listContracts,
  getContract,
  createContract,
  updateContract,
  deleteContract,
} from "./actions";

export type {
  ListContractsInput,
  GetContractInput,
  CreateContractInput,
  UpdateContractInput,
  DeleteContractInput,
  ContractActionResponse,
  ContractItem,
  ListContractsResult,
  ContractOperationResult,
} from "./schemas";

export {
  listContractsSchema,
  contractRowOutputSchema,
  listContractsOutputSchema,
  getContractSchema,
  contractObjectOutputSchema,
  contractDetailOutputSchema,
  createContractSchema,
  updateContractSchema,
  deleteContractSchema,
  contractMutationOutputSchema,
  contractItemSchema,
  listContractsResultSchema,
  contractOperationResultSchema,
} from "./schemas";
