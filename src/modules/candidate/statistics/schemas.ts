import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const candidateDashboardStatsSchema = z.object({
  totalHours: z.number().int().nonnegative(),
  totalMinutes: z.number().int().nonnegative(),
  totalSeconds: z.number().int().nonnegative(),
  totalPaid: z.number().nonnegative(),
  totalBonus: z.number().nonnegative(),
  totalEarning: z.number().nonnegative(),
  totalInterviewScheduled: z.number().int().nonnegative(),
  candidateName: z.string().nullable(),
  candidateEmail: z.string().nullable(),
});

export type CandidateDashboardStats = z.output<
  typeof candidateDashboardStatsSchema
>;
