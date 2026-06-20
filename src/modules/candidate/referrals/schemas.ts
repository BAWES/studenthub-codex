import { z } from "zod";

// ---------------------------------------------------------------------------
// Candidate Referrals — output validation schemas
// ---------------------------------------------------------------------------

export const referralStatusSchema = z.enum(["sent", "pending", "accepted", "declined", "expired", "rewarded"]);
export type ReferralStatus = z.output<typeof referralStatusSchema>;

export const referralItemSchema = z.object({
  referral_uuid: z.string(),
  referred_name: z.string(),
  referred_email: z.string(),
  referred_phone: z.string().nullable(),
  status: referralStatusSchema,
  bonus_amount: z.number().nonnegative().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type ReferralItem = z.output<typeof referralItemSchema>;

export const listReferralsResultSchema = z.object({
  referrals: z.array(referralItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});
export type ListReferralsResult = z.output<typeof listReferralsResultSchema>;

export const referralActionResultSchema = z.object({
  success: z.boolean(),
  referral_uuid: z.string().optional(),
  error: z.string().optional(),
});
export type ReferralActionResult = z.output<typeof referralActionResultSchema>;

export const referralDetailSchema = z.object({
  referral_uuid: z.string(),
  referred_name: z.string(),
  referred_email: z.string(),
  referred_phone: z.string().nullable(),
  status: referralStatusSchema,
  bonus_amount: z.number().nonnegative().nullable(),
  bonus_currency: z.string().nullable(),
  notes: z.string().nullable(),
  referrer_name: z.string(),
  referrer_email: z.string(),
  job_title: z.string().nullable(),
  application_status: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type ReferralDetail = z.output<typeof referralDetailSchema>;
