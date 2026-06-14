import { describe, it, expect } from "vitest";
import {
  staffStatisticsSchema,
  staffStatisticValueSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// staffStatisticsSchema
// ---------------------------------------------------------------------------

describe("staffStatisticsSchema", () => {
  const validStats = () => ({
    workLogAppeals: 5,
    totalUnverifiedEmails: 12,
    totalExpiredCards: 3,
    assignedExpiredCivilID: 0,
    idNeedGenerated: 8,
    profileApprovalRequired: 2,
    incompleteAssignedToWork: 1,
    missingBankInfo: 7,
    requireFollowup: 4,
    activeRequests: 10,
    totalRequests: 45,
    totalMinor: 2,
    assignedIdleCandidates: 6,
    companyMoreThen40DaysWithoutPayment: 0,
    last40daysNoRequest: 3,
    companyUnderReview: 1,
    transfersWithNoProfitInProgress: 2,
    transfersWithSameRateInProgress: 1,
    totalStoreAssignmentRequests: 5,
    totalInterviewRequests: 3,
    totalInterviewScheduled: 1,
    totalPendingTickets: 4,
    totalInProgressTickets: 2,
  });

  it("accepts a valid statistics object", () => {
    const r = staffStatisticsSchema.safeParse(validStats());
    expect(r.success).toBe(true);
  });

  it("accepts all-zero counters", () => {
    const zero = validStats();
    for (const key of Object.keys(zero)) {
      (zero as Record<string, number>)[key] = 0;
    }
    const r = staffStatisticsSchema.safeParse(zero);
    expect(r.success).toBe(true);
  });

  it("rejects missing workLogAppeals", () => {
    const { workLogAppeals: _, ...rest } = validStats();
    expect(staffStatisticsSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects string instead of number", () => {
    expect(
      staffStatisticsSchema.safeParse({ ...validStats(), totalRequests: "45" }).success,
    ).toBe(false);
  });

  it("rejects null values", () => {
    expect(
      staffStatisticsSchema.safeParse({ ...validStats(), activeRequests: null }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// staffStatisticValueSchema
// ---------------------------------------------------------------------------

describe("staffStatisticValueSchema", () => {
  const validItem = () => ({
    key: "totalUnverifiedEmails",
    label: "Unverified Emails",
    value: 12,
  });

  it("accepts a valid statistic value", () => {
    const r = staffStatisticValueSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts zero value", () => {
    const r = staffStatisticValueSchema.safeParse({ ...validItem(), value: 0 });
    expect(r.success).toBe(true);
  });

  it("rejects missing key", () => {
    const { key: _, ...rest } = validItem();
    expect(staffStatisticValueSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects number value for label", () => {
    expect(
      staffStatisticValueSchema.safeParse({ ...validItem(), label: 123 }).success,
    ).toBe(false);
  });
});
