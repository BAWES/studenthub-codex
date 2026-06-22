import { describe, it, expect } from "vitest";
import {
  listReportsSchema,
  getReportSchema,
  generateReportSchema,
  reportTypeItemSchema,
  listReportsResultSchema,
  recruiterStaffReportSchema,
  getRecruiterReportResultSchema,
  singleReportSchema,
  generateReportResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listReportsSchema
// ---------------------------------------------------------------------------
describe("listReportsSchema", () => {
  it("accepts empty object (all defaults)", () => {
    expect(listReportsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(
      listReportsSchema.safeParse({ type: "recruiter-daily", limit: 50, page: 2 }).success,
    ).toBe(true);
  });

  it("applies default values", () => {
    const result = listReportsSchema.parse({});
    expect(result.limit).toBe(20);
    expect(result.page).toBe(1);
  });

  it("rejects negative limit", () => {
    expect(listReportsSchema.safeParse({ limit: -1 }).success).toBe(false);
  });

  it("rejects limit over 100", () => {
    expect(listReportsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects page of 0", () => {
    expect(listReportsSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getReportSchema
// ---------------------------------------------------------------------------
describe("getReportSchema", () => {
  const valid = { id: "rpt-123", type: "recruiter-daily" };

  it("accepts valid report request", () => {
    expect(getReportSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = valid;
    expect(getReportSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty id", () => {
    expect(getReportSchema.safeParse({ ...valid, id: "" }).success).toBe(false);
  });

  it("rejects missing type", () => {
    const { type: _, ...rest } = valid;
    expect(getReportSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// generateReportSchema
// ---------------------------------------------------------------------------
describe("generateReportSchema", () => {
  const valid = { type: "recruiter-daily" };

  it("accepts valid generate request with just type", () => {
    expect(generateReportSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts optional date", () => {
    expect(generateReportSchema.safeParse({ ...valid, date: "2026-06-14" }).success).toBe(true);
  });

  it("accepts optional staffEmail", () => {
    expect(generateReportSchema.safeParse({ ...valid, staffEmail: "staff@example.com" }).success).toBe(true);
  });

  it("accepts optional params", () => {
    expect(generateReportSchema.safeParse({ ...valid, params: { region: "kuwait" } }).success).toBe(true);
  });

  it("rejects missing type", () => {
    expect(generateReportSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty type", () => {
    expect(generateReportSchema.safeParse({ type: "" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(generateReportSchema.safeParse({ ...valid, staffEmail: "not-an-email" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// reportTypeItemSchema
// ---------------------------------------------------------------------------
describe("reportTypeItemSchema", () => {
  const valid = { type: "recruiter-daily", label: "Recruiter Daily", description: "Daily recruiter activity" };

  it("accepts valid item", () => {
    expect(reportTypeItemSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing type", () => {
    const { type: _, ...rest } = valid;
    expect(reportTypeItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty label", () => {
    expect(reportTypeItemSchema.safeParse({ ...valid, label: "" }).success).toBe(false);
  });

  it("rejects missing description", () => {
    const { description: _, ...rest } = valid;
    expect(reportTypeItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listReportsResultSchema
// ---------------------------------------------------------------------------
describe("listReportsResultSchema", () => {
  const valid = {
    reports: [{ type: "recruiter-daily", label: "Daily", description: "desc" }],
    total: 5,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts valid result", () => {
    expect(listReportsResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty reports array", () => {
    expect(listReportsResultSchema.safeParse({ ...valid, reports: [], total: 0, totalPages: 0 }).success).toBe(true);
  });

  it("rejects missing reports", () => {
    const { reports: _, ...rest } = valid;
    expect(listReportsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listReportsResultSchema.safeParse({ ...valid, total: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// recruiterStaffReportSchema
// ---------------------------------------------------------------------------
describe("recruiterStaffReportSchema", () => {
  const valid = {
    staffEmail: "staff@example.com",
    staffName: "Jane Staff",
    totalAssigned: 10,
    totalRequests: 5,
    totalNotes: 3,
    totalStories: 8,
    totalAcceptedInvitations: 4,
    totalRejectedInvitations: 1,
    totalSuggestions: 2,
    totalInvitations: 7,
    totalCompletedStories: 3,
  };

  it("accepts valid staff report", () => {
    expect(recruiterStaffReportSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts zero counts", () => {
    const zero = {
      ...valid,
      totalAssigned: 0,
      totalRequests: 0,
      totalNotes: 0,
      totalStories: 0,
      totalAcceptedInvitations: 0,
      totalRejectedInvitations: 0,
      totalSuggestions: 0,
      totalInvitations: 0,
      totalCompletedStories: 0,
    };
    expect(recruiterStaffReportSchema.safeParse(zero).success).toBe(true);
  });

  it("rejects missing staffEmail", () => {
    const { staffEmail: _, ...rest } = valid;
    expect(recruiterStaffReportSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative totalAssigned", () => {
    expect(recruiterStaffReportSchema.safeParse({ ...valid, totalAssigned: -1 }).success).toBe(false);
  });

  it("rejects empty staffName", () => {
    expect(recruiterStaffReportSchema.safeParse({ ...valid, staffName: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getRecruiterReportResultSchema
// ---------------------------------------------------------------------------
describe("getRecruiterReportResultSchema", () => {
  const valid = {
    date: "2026-06-14",
    reports: [
      {
        staffEmail: "a@b.com",
        staffName: "A",
        totalAssigned: 0,
        totalRequests: 0,
        totalNotes: 0,
        totalStories: 0,
        totalAcceptedInvitations: 0,
        totalRejectedInvitations: 0,
        totalSuggestions: 0,
        totalInvitations: 0,
        totalCompletedStories: 0,
      },
    ],
    total: 1,
  };

  it("accepts valid result", () => {
    expect(getRecruiterReportResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty reports array", () => {
    expect(getRecruiterReportResultSchema.safeParse({ ...valid, reports: [], total: 0 }).success).toBe(true);
  });

  it("rejects missing date", () => {
    const { date: _, ...rest } = valid;
    expect(getRecruiterReportResultSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// singleReportSchema
// ---------------------------------------------------------------------------
describe("singleReportSchema", () => {
  const valid = {
    id: "rpt-123",
    type: "recruiter-daily",
    label: "Daily Report",
    data: { date: "2026-06-14", reports: [], total: 0 },
    generatedAt: "2026-06-14T10:00:00Z",
  };

  it("accepts valid single report", () => {
    expect(singleReportSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts record data variant", () => {
    expect(singleReportSchema.safeParse({ ...valid, data: { custom: "value" } }).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = valid;
    expect(singleReportSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// generateReportResultSchema
// ---------------------------------------------------------------------------
describe("generateReportResultSchema", () => {
  const valid = { operation: "success" as const, message: "Report generated" };

  it("accepts valid result without data", () => {
    expect(generateReportResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts result with optional data", () => {
    expect(
      generateReportResultSchema.safeParse({
        ...valid,
        data: { id: "rpt-1", type: "daily", label: "D", data: { custom: "v" }, generatedAt: "2026-06-14T10:00:00Z" },
      }).success,
    ).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(generateReportResultSchema.safeParse({ message: "ok" }).success).toBe(false);
  });

  it("rejects empty message", () => {
    expect(generateReportResultSchema.safeParse({ ...valid, message: "" }).success).toBe(false);
  });
});
