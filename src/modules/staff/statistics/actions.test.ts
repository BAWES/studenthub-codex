import { describe, it, expect } from "vitest";
import {
  staffStatisticsSchema,
  staffStatisticValueSchema,
  type StaffStatistics,
  type StaffStatisticValue,
} from "./schemas";

// ---------------------------------------------------------------------------
// Pure logic: schema validation for staff dashboard statistics
// ---------------------------------------------------------------------------

describe("staffStatisticsSchema", () => {
  it("parses a full stats object with all fields", () => {
    const result = staffStatisticsSchema.safeParse({
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
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalRequests).toBe(150);
      expect(result.data.totalStoreAssignmentRequests).toBe(0);
    }
  });

  it("rejects missing required fields", () => {
    const result = staffStatisticsSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects wrong types (strings instead of numbers)", () => {
    const result = staffStatisticsSchema.safeParse({
      workLogAppeals: "a",
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
    });
    expect(result.success).toBe(false);
  });

  it("accepts all zeros", () => {
    const data = {
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
    const result = staffStatisticsSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Object.values(result.data).every((v: number) => v === 0)).toBe(true);
    }
  });
});

describe("staffStatisticValueSchema", () => {
  it("parses a valid statistic entry", () => {
    const result = staffStatisticValueSchema.safeParse({
      key: "workLogAppeals",
      label: "Work Log Appeals",
      value: 3,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.key).toBe("workLogAppeals");
      expect(result.data.label).toBe("Work Log Appeals");
      expect(result.data.value).toBe(3);
    }
  });

  it("rejects missing key", () => {
    const result = staffStatisticValueSchema.safeParse({ label: "X", value: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-string key", () => {
    const result = staffStatisticValueSchema.safeParse({ key: 42, label: "X", value: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-number value", () => {
    const result = staffStatisticValueSchema.safeParse({ key: "abc", label: "X", value: "abc" });
    expect(result.success).toBe(false);
  });
});
