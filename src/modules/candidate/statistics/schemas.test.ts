import { describe, it, expect } from "vitest";
import { candidateDashboardStatsSchema } from "./schemas";

// ---------------------------------------------------------------------------
// candidateDashboardStatsSchema
// ---------------------------------------------------------------------------

describe("candidateDashboardStatsSchema", () => {
  const validStats = () => ({
    totalHours: 40,
    totalMinutes: 30,
    totalSeconds: 15,
    totalPaid: 500.0,
    totalBonus: 50.0,
    totalEarning: 550.0,
    totalInterviewScheduled: 3,
    candidateName: "John Doe",
    candidateEmail: "john@example.com",
  });

  it("accepts a valid stats object", () => {
    const r = candidateDashboardStatsSchema.safeParse(validStats());
    expect(r.success).toBe(true);
  });

  it("accepts nullable name and email", () => {
    const r = candidateDashboardStatsSchema.safeParse({
      ...validStats(),
      candidateName: null,
      candidateEmail: null,
    });
    expect(r.success).toBe(true);
  });

  it("accepts all-zero values", () => {
    const zero = validStats();
    for (const key of Object.keys(zero)) {
      if (typeof (zero as Record<string, unknown>)[key] === "number") {
        (zero as Record<string, number>)[key] = 0;
      }
    }
    const r = candidateDashboardStatsSchema.safeParse(zero);
    expect(r.success).toBe(true);
  });

  it("rejects negative totalHours", () => {
    const r = candidateDashboardStatsSchema.safeParse({ ...validStats(), totalHours: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects missing totalMinutes", () => {
    const { totalMinutes: _, ...rest } = validStats();
    expect(candidateDashboardStatsSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects string instead of number for totalPaid", () => {
    expect(
      candidateDashboardStatsSchema.safeParse({ ...validStats(), totalPaid: "500" }).success,
    ).toBe(false);
  });
});
