import { describe, it, expect } from "vitest";
import { candidateDashboardStatsSchema } from "./schemas";

// ---------------------------------------------------------------------------
// candidateDashboardStatsSchema
// ---------------------------------------------------------------------------
describe("candidateDashboardStatsSchema", () => {
  const valid = {
    totalHours: 120,
    totalMinutes: 45,
    totalSeconds: 30,
    totalPaid: 1500.5,
    totalBonus: 200,
    totalEarning: 1700.5,
    totalInterviewScheduled: 3,
    candidateName: "John Doe",
    candidateEmail: "john@example.com",
  };

  it("accepts valid stats", () => {
    expect(candidateDashboardStatsSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable name and email", () => {
    const r = candidateDashboardStatsSchema.safeParse({
      ...valid,
      candidateName: null,
      candidateEmail: null,
    });
    expect(r.success).toBe(true);
  });

  it("accepts all-zero values", () => {
    const zero = { ...valid };
    for (const key of Object.keys(zero) as Array<keyof typeof zero>) {
      if (typeof zero[key] === "number") {
        (zero as any)[key] = 0;
      }
    }
    const r = candidateDashboardStatsSchema.safeParse(zero);
    expect(r.success).toBe(true);
  });
  it("rejects negative totalHours", () => {
    expect(
      candidateDashboardStatsSchema.safeParse({ ...valid, totalHours: -1 }).success
    ).toBe(false);
  });

  it("rejects negative totalPaid", () => {
    expect(
      candidateDashboardStatsSchema.safeParse({ ...valid, totalPaid: -1 }).success
    ).toBe(false);
  });

  it("rejects missing required field", () => {
    const { totalHours: _, ...rest } = valid;
    expect(candidateDashboardStatsSchema.safeParse(rest).success).toBe(false);
  });
});