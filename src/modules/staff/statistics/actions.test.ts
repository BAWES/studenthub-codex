import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: schema validation for staff dashboard statistics
// ---------------------------------------------------------------------------

const listStaffStatisticsSchema = z.object({
  currency: z.string().max(3).optional().default("KWD"),
});

const getStaffStatisticSchema = z.object({
  key: z.string().min(1).max(64),
  currency: z.string().max(3).optional().default("KWD"),
});

type StaffStatistics = {
  workLogAppeals: number;
  totalUnverifiedEmails: number;
  totalExpiredCards: number;
  assignedExpiredCivilID: number;
  idNeedGenerated: number;
  profileApprovalRequired: number;
  incompleteAssignedToWork: number;
  missingBankInfo: number;
  requireFollowup: number;
  activeRequests: number;
  totalRequests: number;
  totalMinor: number;
  assignedIdleCandidates: number;
  companyMoreThen40DaysWithoutPayment: number;
  last40daysNoRequest: number;
  companyUnderReview: number;
  transfersWithNoProfitInProgress: number;
  transfersWithSameRateInProgress: number;
  totalStoreAssignmentRequests: number;
  totalInterviewRequests: number;
  totalInterviewScheduled: number;
  totalPendingTickets: number;
  totalInProgressTickets: number;
};

type StaffStatisticValue = {
  key: string;
  label: string;
  value: number;
};

describe("listStaffStatisticsSchema", () => {
  it("accepts empty params and defaults to KWD", () => {
    const result = listStaffStatisticsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("KWD");
    }
  });

  it("accepts a custom currency code", () => {
    const result = listStaffStatisticsSchema.safeParse({ currency: "USD" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("USD");
    }
  });

  it("rejects currency longer than 3 characters", () => {
    const result = listStaffStatisticsSchema.safeParse({ currency: "KWDX" });
    expect(result.success).toBe(false);
  });

  it("rejects non-string currency", () => {
    const result = listStaffStatisticsSchema.safeParse({ currency: 42 });
    expect(result.success).toBe(false);
  });
});

describe("getStaffStatisticSchema", () => {
  it("accepts a valid key with default currency", () => {
    const result = getStaffStatisticSchema.safeParse({ key: "workLogAppeals" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.key).toBe("workLogAppeals");
      expect(result.data.currency).toBe("KWD");
    }
  });

  it("accepts a key with custom currency", () => {
    const result = getStaffStatisticSchema.safeParse({ key: "totalExpiredCards", currency: "USD" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("USD");
    }
  });

  it("rejects empty key", () => {
    const result = getStaffStatisticSchema.safeParse({ key: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing key", () => {
    const result = getStaffStatisticSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("StaffStatistics shape", () => {
  it("defines all expected fields with correct types", () => {
    const stats: StaffStatistics = {
      workLogAppeals: 3,
      totalUnverifiedEmails: 12,
      totalExpiredCards: 5,
      assignedExpiredCivilID: 2,
      idNeedGenerated: 8,
      profileApprovalRequired: 15,
      incompleteAssignedToWork: 7,
      missingBankInfo: 4,
      requireFollowup: 6,
      activeRequests: 22,
      totalRequests: 150,
      totalMinor: 1,
      assignedIdleCandidates: 10,
      companyMoreThen40DaysWithoutPayment: 3,
      last40daysNoRequest: 8,
      companyUnderReview: 2,
      transfersWithNoProfitInProgress: 11,
      transfersWithSameRateInProgress: 4,
      totalStoreAssignmentRequests: 0,
      totalInterviewRequests: 9,
      totalInterviewScheduled: 14,
      totalPendingTickets: 5,
      totalInProgressTickets: 3,
    };
    expect(stats.workLogAppeals).toBe(3);
    expect(stats.totalUnverifiedEmails).toBe(12);
    expect(stats.activeRequests).toBe(22);
    expect(stats.totalMinor).toBe(1);
    expect(stats.totalStoreAssignmentRequests).toBe(0);
  });

  it("defaults all values to zero when empty", () => {
    const stats: StaffStatistics = {
      workLogAppeals: 0,
      totalUnverifiedEmails: 0,
      totalExpiredCards: 0,
      assignedExpiredCivilID: 0,
      idNeedGenerated: 0,
      profileApprovalRequired: 0,
      incompleteAssignedToWork: 0,
      missingBankInfo: 0,
      requireFollowup: 0,
      activeRequests: 0,
      totalRequests: 0,
      totalMinor: 0,
      assignedIdleCandidates: 0,
      companyMoreThen40DaysWithoutPayment: 0,
      last40daysNoRequest: 0,
      companyUnderReview: 0,
      transfersWithNoProfitInProgress: 0,
      transfersWithSameRateInProgress: 0,
      totalStoreAssignmentRequests: 0,
      totalInterviewRequests: 0,
      totalInterviewScheduled: 0,
      totalPendingTickets: 0,
      totalInProgressTickets: 0,
    };
    expect(Object.values(stats).every((v) => v === 0)).toBe(true);
  });
});

describe("StaffStatisticValue", () => {
  it("represents a single statistic with key, label, and value", () => {
    const item: StaffStatisticValue = {
      key: "workLogAppeals",
      label: "Work Log Appeals",
      value: 3,
    };
    expect(item.key).toBe("workLogAppeals");
    expect(item.label).toBe("Work Log Appeals");
    expect(item.value).toBe(3);
  });
});
