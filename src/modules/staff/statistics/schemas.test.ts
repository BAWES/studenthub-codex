import { describe, it, expect } from "vitest";
import { staffStatisticsSchema, staffStatisticValueSchema } from "./schemas";

// ---------------------------------------------------------------------------
// staffStatisticsSchema
// ---------------------------------------------------------------------------
describe("staffStatisticsSchema", () => {
  const valid = {
    workLogAppeals: 5,
    totalUnverifiedEmails: 12,
    totalExpiredCards: 3,
    assignedExpiredCivilID: 1,
    idNeedGenerated: 8,
    profileApprovalRequired: 4,
    incompleteAssignedToWork: 2,
    missingBankInfo: 6,
    requireFollowup: 3,
    activeRequests: 15,
    totalRequests: 50,
    totalMinor: 7,
    assignedIdleCandidates: 10,
    companyMoreThen40DaysWithoutPayment: 2,
    last40daysNoRequest: 3,
    companyUnderReview: 1,
    transfersWithNoProfitInProgress: 0,
    transfersWithSameRateInProgress: 1,
    totalStoreAssignmentRequests: 4,
    totalInterviewRequests: 6,
    totalInterviewScheduled: 3,
    totalPendingTickets: 8,
    totalInProgressTickets: 5,
  };

  it("accepts valid statistics", () => {
    expect(staffStatisticsSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all zeros", () => {
    const zero: Record<string, number> = {};
    for (const key of Object.keys(valid)) {
      zero[key] = 0;
    }
    expect(staffStatisticsSchema.safeParse(zero).success).toBe(true);
  });

  it("rejects missing field", () => {
    const { workLogAppeals: _, ...rest } = valid;
    expect(staffStatisticsSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-number value", () => {
    expect(
      staffStatisticsSchema.safeParse({ ...valid, workLogAppeals: "five" }).success
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// staffStatisticValueSchema
// ---------------------------------------------------------------------------
describe("staffStatisticValueSchema", () => {
  const valid = { key: "workLogAppeals", label: "Work Log Appeals", value: 5 };

  it("accepts valid statistic value", () => {
    expect(staffStatisticValueSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing key", () => {
    const { key: _, ...rest } = valid;
    expect(staffStatisticValueSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = valid;
    expect(staffStatisticValueSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-number value", () => {
    expect(
      staffStatisticValueSchema.safeParse({ ...valid, value: "five" }).success
    ).toBe(false);
  });
});