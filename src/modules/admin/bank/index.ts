// ---------------------------------------------------------------------------
// Admin Bank - barrel exports
// ---------------------------------------------------------------------------

export {
  listBanks,
  getBank,
  createBank,
  updateBank,
  deleteBank,
} from "./actions";

export type {
  ListBanksInput,
  GetBankInput,
  CreateBankInput,
  UpdateBankInput,
  DeleteBankInput,
  BankActionResponse,
  BankItem,
  ListBanksResult,
  BankOperationResult,
} from "./schemas";

export {
  listBanksSchema,
  bankRowOutputSchema,
  listBanksOutputSchema,
  getBankSchema,
  bankObjectOutputSchema,
  bankDetailOutputSchema,
  createBankSchema,
  updateBankSchema,
  deleteBankSchema,
  bankMutationOutputSchema,
  bankItemSchema,
  listBanksResultSchema,
  bankOperationResultSchema,
} from "./schemas";
