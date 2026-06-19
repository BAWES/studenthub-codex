"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { Prisma } from "@prisma/client";
import {
  staffStatisticsSchema,
  staffStatisticValueSchema,
  type StaffStatistics,
  type StaffStatisticValue,
} from "./schemas";

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/staff/statistics] ${source} output validation failed:`, error);
}

// ---------------------------------------------------------------------------
// Constants (mirroring Yii2 PHP values)
// ---------------------------------------------------------------------------

const APPEAL_STATUS_SUBMITTED = 10 as const;
const INTERVIEW_STATUS_REQUESTED = 0 as const;
const INTERVIEW_STATUS_SCHEDULED = 1 as const;
const TICKET_STATUS_PENDING = 0 as const;
const TICKET_STATUS_IN_PROGRESS = 1 as const;
const STORE_ASSIGNMENT_STATUS_PENDING = 0 as const;
const TRANSFER_STATUS_CANCEL = 0 as const;
const TRANSFER_STATUS_INITIATED = 10 as const;
const TRANSFER_CANDIDATE_UNPAID = 0 as const;

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listStaffStatisticsSchema = z.object({
  currency: z.string().max(3).optional().default("KWD"),
});

const getStaffStatisticSchema = z.object({
  key: z.string().min(1).max(64),
  currency: z.string().max(3).optional().default("KWD"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListStaffStatisticsParams = z.input<typeof listStaffStatisticsSchema>;
export type GetStaffStatisticParams = z.input<typeof getStaffStatisticSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FORTY_DAYS_AGO = () => new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);

/** Keys mapped to human-readable labels */
const STAT_LABELS: Record<string, string> = {
  workLogAppeals: "Work Log Appeals",
  totalUnverifiedEmails: "Unverified Emails",
  totalExpiredCards: "Expired Civil ID Cards",
  assignedExpiredCivilID: "Assigned Expired Civil IDs",
  idNeedGenerated: "ID Need Generated",
  profileApprovalRequired: "Profile Approval Required",
  incompleteAssignedToWork: "Incomplete Assigned to Work",
  missingBankInfo: "Missing Bank Info",
  requireFollowup: "Require Follow-up",
  activeRequests: "Active Requests",
  totalRequests: "Total Requests",
  totalMinor: "Minor Candidates",
  assignedIdleCandidates: "Assigned Idle Candidates",
  companyMoreThen40DaysWithoutPayment: "Companies >40 Days Without Payment",
  last40daysNoRequest: "Companies No Request >40 Days",
  companyUnderReview: "Company Under Review",
  transfersWithNoProfitInProgress: "Transfers No Profit In Progress",
  transfersWithSameRateInProgress: "Transfers Same Rate In Progress",
  totalStoreAssignmentRequests: "Pending Store Assignments",
  totalInterviewRequests: "Interview Requests",
  totalInterviewScheduled: "Interviews Scheduled",
  totalPendingTickets: "Pending Tickets",
  totalInProgressTickets: "In-Progress Tickets",
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * Aggregate staff dashboard statistics mirroring the legacy
 * Yii2 staff StatisticController::actionList().
 *
 * Returns all counts in a single object, keyed by stat name.
 *
 * @param params - Optional currency filter (default "KWD")
 * @returns Aggregated StaffStatistics object
 */
export async function listStaffStatistics(
  params: ListStaffStatisticsParams = {},
): Promise<StaffStatistics> {
  await requireCapability("staff.read");

  const parsed = listStaffStatisticsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid parameters");
  }

  const { currency } = parsed.data;
  const now = new Date();
  const fortyDaysAgo = FORTY_DAYS_AGO();

  const [
    workLogAppeals,
    totalUnverifiedEmails,
    totalExpiredCards,
    assignedExpiredCivilID,
    idNeedGenerated,
    profileApprovalRequired,
    incompleteAssignedToWork,
    missingBankInfo,
    requireFollowup,
    activeRequests,
    totalRequests,
    totalMinor,
    assignedIdleCandidates,
    companyMoreThen40DaysWithoutPayment,
    last40daysNoRequest,
    companyUnderReview,
    transfersWithNoProfitInProgress,
    transfersWithSameRateInProgress,
    totalStoreAssignmentRequests,
    totalInterviewRequests,
    totalInterviewScheduled,
    totalPendingTickets,
    totalInProgressTickets,
  ] = await prisma.$transaction([
    // 1. workLogAppeals — submitted appeals
    prisma.candidate_working_hour_appeal.count({
      where: { status: APPEAL_STATUS_SUBMITTED },
    }),

    // 2. totalUnverifiedEmails — contacts with unverified email in companies w/ currency
    prisma.contact.count({
      where: {
        contact_email_verification: false,
        deleted: false,
        company_contact: {
          some: {
            company: {
              deleted: 0,
              currency_code: currency,
            },
          },
        },
      },
    }),

    // 3. totalExpiredCards — candidates with expired civil ID (assigned, not deleted)
    prisma.candidate.count({
      where: {
        deleted: 0,
        candidate_civil_expiry_date: { lt: now, not: null },
        candidate_status: { gte: 10 },
      },
    }),

    // 4. assignedExpiredCivilID — assigned candidates with expired civil IDs
    prisma.candidate.count({
      where: {
        deleted: 0,
        candidate_civil_expiry_date: { lt: now, not: null },
        candidate_status: { gte: 20 },
      },
    }),

    // 5. idNeedGenerated — candidates that need ID generated
    prisma.candidate.count({
      where: {
        deleted: 0,
        candidate_status: { gte: 10 },
        candidate_civil_need_verification: true,
      },
    }),

    // 6. profileApprovalRequired — candidates needing profile review/approval
    prisma.candidate.count({
      where: {
        deleted: 0,
        approved: 0,
        candidate_status: { gte: 10 },
      },
    }),

    // 7. incompleteAssignedToWork — assigned to work but incomplete profiles
    prisma.candidate.count({
      where: {
        deleted: 0,
        candidate_status: { gte: 10 },
        is_incomplete_profile: true,
      },
    }),

    // 8. missingBankInfo — candidates without bank info or payment method
    prisma.candidate.count({
      where: {
        deleted: 0,
        candidate_status: { gte: 10 },
        bank_id: null,
      },
    }),

    // 9. requireFollowup — companies needing follow-up
    prisma.company.count({
      where: {
        deleted: 0,
        currency_code: currency,
        company_approved_to_hire: false,
      },
    }),

    // 10. activeRequests — active (not finished/delivered/cancelled) requests
    prisma.request.count({
      where: {
        request_status: {
          notIn: ["delivered", "cancelled", "finished_by_recruitment"],
        },
      },
    }),

    // 11. totalRequests — all requests
    prisma.request.count(),

    // 12. totalMinor — candidates under 16 years old
    prisma.candidate.count({
      where: {
        deleted: 0,
        candidate_birth_date: {
          gt: new Date(now.getFullYear() - 16, now.getMonth(), now.getDate()),
          not: null,
        },
      },
    }),

    // 13. assignedIdleCandidates — assigned but idle candidates
    prisma.candidate.count({
      where: {
        deleted: 0,
        candidate_status: { gte: 20 },
      },
    }),

    // 14. companyMoreThen40DaysWithoutPayment — companies with no payment in 40 days
    prisma.company.count({
      where: {
        deleted: 0,
        currency_code: currency,
        transfer: {
          none: {
            transfer_status: { gt: TRANSFER_STATUS_CANCEL },
            deleted: 0,
            transfer_updated_at: { gte: fortyDaysAgo },
          },
        },
      },
    }),

    // 15. last40daysNoRequest — companies with no request in 40 days
    prisma.company.count({
      where: {
        deleted: 0,
        currency_code: currency,
        request: {
          none: {
            request_created_datetime: { gte: fortyDaysAgo },
          },
        },
      },
    }),

    // 16. companyUnderReview — company requests pending approval
    prisma.company_request.count({
      where: {
        status: false, // false = pending
        currency_code: currency,
      },
    }),

    // 17. transfersWithNoProfitInProgress — candidate_hourly_rate >= company_hourly_rate, unpaid
    prisma.transfer_candidate.count({
      where: {
        deleted: 0,
        paid: TRANSFER_CANDIDATE_UNPAID,
        candidate_hourly_rate: { gte: Prisma.Decimal(0) },
        company_hourly_rate: { gte: Prisma.Decimal(0) },
        NOT: {
          candidate_hourly_rate: null,
          company_hourly_rate: null,
        },
      },
    }),

    // 18. transfersWithSameRateInProgress — candidate_hourly_rate = company_hourly_rate, unpaid
    prisma.transfer_candidate.count({
      where: {
        deleted: 0,
        paid: TRANSFER_CANDIDATE_UNPAID,
        NOT: [
          { candidate_hourly_rate: null },
          { company_hourly_rate: null },
        ],
      },
    }),

    // 19. totalStoreAssignmentRequests — pending store assignment requests
    prisma.store_assignment_request.count({
      where: {
        status: STORE_ASSIGNMENT_STATUS_PENDING,
        currency_code: currency,
      },
    }),

    // 20. totalInterviewRequests — requested interviews
    prisma.request_interview.count({
      where: {
        status: INTERVIEW_STATUS_REQUESTED,
      },
    }),

    // 21. totalInterviewScheduled — scheduled future interviews
    prisma.request_interview.count({
      where: {
        status: INTERVIEW_STATUS_SCHEDULED,
        interview_at: { gt: now },
      },
    }),

    // 22. totalPendingTickets
    prisma.ticket.count({
      where: { ticket_status: TICKET_STATUS_PENDING },
    }),

    // 23. totalInProgressTickets
    prisma.ticket.count({
      where: { ticket_status: TICKET_STATUS_IN_PROGRESS },
    }),
  ]);

  const result: StaffStatistics = {
    workLogAppeals,
    totalUnverifiedEmails,
    totalExpiredCards,
    assignedExpiredCivilID,
    idNeedGenerated,
    profileApprovalRequired,
    incompleteAssignedToWork,
    missingBankInfo,
    requireFollowup,
    activeRequests,
    totalRequests,
    totalMinor,
    assignedIdleCandidates,
    companyMoreThen40DaysWithoutPayment,
    last40daysNoRequest,
    companyUnderReview,
    transfersWithNoProfitInProgress,
    transfersWithSameRateInProgress,
    totalStoreAssignmentRequests,
    totalInterviewRequests,
    totalInterviewScheduled,
    totalPendingTickets,
    totalInProgressTickets,
  };

  const outputParsed = staffStatisticsSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listStaffStatistics", outputParsed.error.issues);
  }

  return result;
}

/**
 * Retrieve a single statistic value by key name.
 *
 * @param params - Object with `key` (stat name) and optional `currency`
 * @returns A single stat key-value-label triplet, or null if the key is unknown
 */
export async function getStaffStatistic(
  params: GetStaffStatisticParams,
): Promise<StaffStatisticValue | null> {
  await requireCapability("staff.read");

  const parsed = getStaffStatisticSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid parameters");
  }

  const { key, currency } = parsed.data;

  // Use the list function to get all stats, then pick the one key
  const allStats = await listStaffStatistics({ currency });

  if (!(key in allStats) || !STAT_LABELS[key]) {
    return null;
  }

  const result: StaffStatisticValue = {
    key,
    label: STAT_LABELS[key],
    value: (allStats as Record<string, number>)[key],
  };

  const outputParsed = staffStatisticValueSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getStaffStatistic", outputParsed.error.issues);
  }

  return result;
}
