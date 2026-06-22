import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
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

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single account list item.
 */
export const accountListItemSchema = z.object({
  admin_id: z.number().int(),
  admin_name: z.string(),
  admin_email: z.string(),
  admin_status: z.number().int(),
  admin_created_at: z.date(),
});

/**
 * Schema for a full account detail record.
 */
export const accountDetailSchema = accountListItemSchema.extend({
  admin_updated_at: z.date(),
  admin_limited_access: z.number().int().nullable(),
});

/**
 * Schema for the listAccounts response.
 */
export const listAccountsResultSchema = z.object({
  accounts: z.array(accountListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Schema for a single candidate skill item.
 */
export const candidateSkillItemSchema = z.object({
  candidate_skill_id: z.number().int(),
  skill: z.string(),
  candidate_skill_created_at: z.date().nullable(),
});

/**
 * Schema for the listCandidateSkills response.
 */
export const skillListResultSchema = z.object({
  skills: z.array(candidateSkillItemSchema),
});

/**
 * Schema for a generic account action result (success/error).
 */
export const accountActionResultSchema = z.object({
  operation: z.string(),
  message: z.string(),
});

/**
 * Schema for the updateBankAccount response.
 */
export const updateBankResultSchema = accountActionResultSchema.extend({
  bankName: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListAccountsParams = z.input<typeof listAccountsSchema>;
export type GetAccountParams = z.input<typeof getAccountSchema>;
export type ListCandidateSkillsParams = z.input<typeof listCandidateSkillsSchema>;
export type UpdateEmailParams = z.input<typeof updateEmailSchema>;
export type UpdateBankAccountParams = z.input<typeof updateBankAccountSchema>;
export type ChangePasswordParams = z.input<typeof changePasswordSchema>;

export type AccountListItem = z.output<typeof accountListItemSchema>;
export type AccountDetail = z.output<typeof accountDetailSchema>;
export type ListAccountsResult = z.output<typeof listAccountsResultSchema>;
export type CandidateSkillItem = z.output<typeof candidateSkillItemSchema>;
export type SkillListResult = z.output<typeof skillListResultSchema>;
export type AccountActionResult = z.output<typeof accountActionResultSchema>;
export type UpdateBankResult = z.output<typeof updateBankResultSchema>;
