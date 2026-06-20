import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: schema validation for candidate dashboard stats
// ---------------------------------------------------------------------------

const candidateIdSchema = z.object({
  candidateId: z.number().int().positive(),
});

type CandidateDashboardStats = {
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  totalPaid: number;
  totalBonus: number;
  totalEarning: number;
  totalInterviewScheduled: number;
  candidateName: string | null;
  candidateEmail: string | null;
};

describe("candidateIdSchema", () => {
  it("accepts a valid positive integer candidateId", () => {
    const result = candidateIdSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("rejects zero candidateId", () => {
    const result = candidateIdSchema.safeParse({ candidateId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    const result = candidateIdSchema.safeParse({ candidateId: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer candidateId", () => {
    const result = candidateIdSchema.safeParse({ candidateId: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects missing candidateId", () => {
    const result = candidateIdSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects null candidateId", () => {
    const result = candidateIdSchema.safeParse({ candidateId: null });
    expect(result.success).toBe(false);
  });
});

describe("CandidateDashboardStats shape", () => {
  it("defines the expected fields with correct types", () => {
    const stats: CandidateDashboardStats = {
      totalHours: 120,
      totalMinutes: 45,
      totalSeconds: 30,
      totalPaid: 4500,
      totalBonus: 200,
      totalEarning: 4700,
      totalInterviewScheduled: 3,
      candidateName: "John Doe",
      candidateEmail: "john@example.com",
    };
    expect(stats.totalHours).toBe(120);
    expect(stats.totalMinutes).toBe(45);
    expect(stats.totalSeconds).toBe(30);
    expect(stats.totalPaid).toBe(4500);
    expect(stats.totalBonus).toBe(200);
    expect(stats.totalEarning).toBe(4700);
    expect(stats.totalInterviewScheduled).toBe(3);
    expect(stats.candidateName).toBe("John Doe");
    expect(stats.candidateEmail).toBe("john@example.com");
  });

  it("allows null candidateName and candidateEmail", () => {
    const stats: CandidateDashboardStats = {
      totalHours: 0,
      totalMinutes: 0,
      totalSeconds: 0,
      totalPaid: 0,
      totalBonus: 0,
      totalEarning: 0,
      totalInterviewScheduled: 0,
      candidateName: null,
      candidateEmail: null,
    };
    expect(stats.candidateName).toBeNull();
    expect(stats.candidateEmail).toBeNull();
  });
});
