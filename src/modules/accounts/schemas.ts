import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/accounts actions
// ---------------------------------------------------------------------------

export const listAccountsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().max(255).optional(),
  status: z.number().int().optional(),
});

export const getAccountSchema = z.object({
  id: z.number().int().positive(),
});

export type ListAccountsParams = z.input<typeof listAccountsSchema>;
export type GetAccountParams = z.input<typeof getAccountSchema>;
export type AccountListItem = {
  admin_id: number;
  admin_name: string;
  admin_email: string;
  admin_status: number;
  admin_created_at: Date;
};
export type AccountDetail = AccountListItem & {
  admin_updated_at: Date;
  admin_limited_access: number | null;
};
export type ListAccountsResult = {
  accounts: AccountListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export const listCandidateSkillsSchema = z.object({
  candidateId: z.coerce.number().int().positive().optional(),
});
export const updateEmailSchema = z.object({
  email: z.string().email("A valid email address is required"),
});
export const updateBankAccountSchema = z.object({
  benefName: z.string().min(1, "Beneficiary name is required"),
  iban: z.string().min(1, "IBAN code is required"),
});
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});
export type ListCandidateSkillsParams = z.input<typeof listCandidateSkillsSchema>;
export type UpdateEmailParams = z.input<typeof updateEmailSchema>;
export type UpdateBankAccountParams = z.input<typeof updateBankAccountSchema>;
export type ChangePasswordParams = z.input<typeof changePasswordSchema>;
export type CandidateSkillItem = {
  candidate_skill_id: number;
  skill: string;
  candidate_skill_created_at: Date | null;
};
export type SkillListResult = {
  skills: CandidateSkillItem[];
};
export type AccountActionResult = {
  operation: string;
  message: string;
};
export type UpdateBankResult = AccountActionResult & {
  bankName?: string;
};
