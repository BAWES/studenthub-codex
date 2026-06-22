import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const staffStatisticsSchema = z.object({
  workLogAppeals: z.number(),
  totalUnverifiedEmails: z.number(),
  totalExpiredCards: z.number(),
  assignedExpiredCivilID: z.number(),
  idNeedGenerated: z.number(),
  profileApprovalRequired: z.number(),
  incompleteAssignedToWork: z.number(),
  missingBankInfo: z.number(),
  requireFollowup: z.number(),
  activeRequests: z.number(),
  totalRequests: z.number(),
  totalMinor: z.number(),
  assignedIdleCandidates: z.number(),
  companyMoreThen40DaysWithoutPayment: z.number(),
  last40daysNoRequest: z.number(),
  companyUnderReview: z.number(),
  transfersWithNoProfitInProgress: z.number(),
  transfersWithSameRateInProgress: z.number(),
  totalStoreAssignmentRequests: z.number(),
  totalInterviewRequests: z.number(),
  totalInterviewScheduled: z.number(),
  totalPendingTickets: z.number(),
  totalInProgressTickets: z.number(),
});

export type StaffStatistics = z.output<typeof staffStatisticsSchema>;

export const staffStatisticValueSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.number(),
});

export type StaffStatisticValue = z.output<typeof staffStatisticValueSchema>;
