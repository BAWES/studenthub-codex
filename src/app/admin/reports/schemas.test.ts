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
  it("accepts empty input with defaults", () => {
    expect(listReportsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(listReportsSchema.safeParse({ type: "recruiter_daily", limit: 50, page: 2 }).success).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listReportsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listReportsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listReportsSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getReportSchema
// ---------------------------------------------------------------------------
describe("getReportSchema", () => {
  it("accepts valid input", () => {
    expect(getReportSchema.safeParse({ id: "rpt-1", type: "recruiter_daily" }).success).toBe(true);
  });

  it("rejects missing id", () => {
    expect(getReportSchema.safeParse({ type: "recruiter_daily" }).success).toBe(false);
  });

  it("rejects empty id", () => {
    expect(getReportSchema.safeParse({ id: "", type: "recruiter_daily" }).success).toBe(false);
  });

  it("rejects missing type", () => {
    expect(getReportSchema.safeParse({ id: "rpt-1" }).success).toBe(false);
  });

  it("rejects empty type", () => {
    expect(getReportSchema.safeParse({ id: "rpt-1", type: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// generateReportSchema
// ---------------------------------------------------------------------------
describe("generateReportSchema", () => {
  it("accepts minimal input", () => {
    expect(generateReportSchema.safeParse({ type: "recruiter_daily" }).success).toBe(true);
  });

  it("accepts full input", () => {
    expect(
      generateReportSchema.safeParse({
        type: "recruiter_daily",
        date: "2026-06-15",
        staffEmail: "recruiter@example.com",
        params: { extra: "value" },
      }).success,
    ).toBe(true);
  });

  it("rejects missing type", () => {
    expect(generateReportSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty type", () => {
    expect(generateReportSchema.safeParse({ type: "" }).success).toBe(false);
  });

  it("rejects invalid staff email", () => {
    expect(
      generateReportSchema.safeParse({ type: "recruiter_daily", staffEmail: "not-email" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// reportTypeItemSchema
// ---------------------------------------------------------------------------
describe("reportTypeItemSchema", () => {
  const validItem = { type: "recruiter_daily", label: "Recruiter Daily", description: "Daily recruiter activity" };

  it("accepts a valid item", () => {
    expect(reportTypeItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("rejects missing type", () => {
    const { type: _, ...rest } = validItem;
    expect(reportTypeItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty type", () => {
    expect(reportTypeItemSchema.safeParse({ ...validItem, type: "" }).success).toBe(false);
  });

  it("rejects empty label", () => {
    expect(reportTypeItemSchema.safeParse({ ...validItem, label: "" }).success).toBe(false);
  });

  it("rejects empty description", () => {
    expect(reportTypeItemSchema.safeParse({ ...validItem, description: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listReportsResultSchema (paginated)
// ---------------------------------------------------------------------------
describe("listReportsResultSchema", () => {
  const validResult = {
    reports: [{ type: "recruiter_daily", label: "Recruiter Daily", description: "Desc" }],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listReportsResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty reports array", () => {
    expect(
      listReportsResultSchema.safeParse({ ...validResult, reports: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing reports", () => {
    const { reports: _, ...rest } = validResult;
    expect(listReportsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listReportsResultSchema.safeParse({ ...validResult, total: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listReportsResultSchema.safeParse({ ...validResult, page: 0 }).success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(listReportsResultSchema.safeParse({ ...validResult, totalPages: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// recruiterStaffReportSchema
// ---------------------------------------------------------------------------
describe("recruiterStaffReportSchema", () => {
  const validReport = {
    staffEmail: "recruiter@example.com",
    staffName: "Jane Recruiter",
    totalAssigned: 10,
    totalRequests: 5,
    totalNotes: 3,
    totalStories: 8,
    totalAcceptedInvitations: 4,
    totalRejectedInvitations: 2,
    totalSuggestions: 6,
    totalInvitations: 7,
    totalCompletedStories: 3,
  };

  it("accepts a valid report", () => {
    expect(recruiterStaffReportSchema.safeParse(validReport).success).toBe(true);
  });

  it("accepts zero values", () => {
    expect(
      recruiterStaffReportSchema.safeParse({
        staffEmail: "a@b.com",
        staffName: "Test",
        totalAssigned: 0,
        totalRequests: 0,
        totalNotes: 0,
        totalStories: 0,
        totalAcceptedInvitations: 0,
        totalRejectedInvitations: 0,
        totalSuggestions: 0,
        totalInvitations: 0,
        totalCompletedStories: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing staffEmail", () => {
    const { staffEmail: _, ...rest } = validReport;
    expect(recruiterStaffReportSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty staffEmail", () => {
    expect(recruiterStaffReportSchema.safeParse({ ...validReport, staffEmail: "" }).success).toBe(false);
  });

  it("rejects empty staffName", () => {
    expect(recruiterStaffReportSchema.safeParse({ ...validReport, staffName: "" }).success).toBe(false);
  });

  it("rejects negative totals", () => {
    expect(recruiterStaffReportSchema.safeParse({ ...validReport, totalAssigned: -1 }).success).toBe(false);
    expect(recruiterStaffReportSchema.safeParse({ ...validReport, totalRequests: -1 }).success).toBe(false);
    expect(recruiterStaffReportSchema.safeParse({ ...validReport, totalNotes: -1 }).success).toBe(false);
    expect(recruiterStaffReportSchema.safeParse({ ...validReport, totalStories: -1 }).success).toBe(false);
    expect(recruiterStaffReportSchema.safeParse({ ...validReport, totalAcceptedInvitations: -1 }).success).toBe(false);
    expect(recruiterStaffReportSchema.safeParse({ ...validReport, totalRejectedInvitations: -1 }).success).toBe(false);
    expect(recruiterStaffReportSchema.safeParse({ ...validReport, totalSuggestions: -1 }).success).toBe(false);
    expect(recruiterStaffReportSchema.safeParse({ ...validReport, totalInvitations: -1 }).success).toBe(false);
    expect(recruiterStaffReportSchema.safeParse({ ...validReport, totalCompletedStories: -1 }).success).toBe(false);
  });

  it("rejects wrong types", () => {
    expect(
      recruiterStaffReportSchema.safeParse({ ...validReport, staffEmail: 123 }).success,
    ).toBe(false);
    expect(
      recruiterStaffReportSchema.safeParse({ ...validReport, totalAssigned: "ten" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getRecruiterReportResultSchema
// ---------------------------------------------------------------------------
describe("getRecruiterReportResultSchema", () => {
  const validResult = {
    date: "2026-06-15",
    reports: [
      {
        staffEmail: "a@b.com",
        staffName: "Recruiter",
        totalAssigned: 5,
        totalRequests: 3,
        totalNotes: 1,
        totalStories: 2,
        totalAcceptedInvitations: 2,
        totalRejectedInvitations: 0,
        totalSuggestions: 1,
        totalInvitations: 2,
        totalCompletedStories: 1,
      },
    ],
    total: 1,
  };

  it("accepts a valid result", () => {
    expect(getRecruiterReportResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty reports array", () => {
    expect(
      getRecruiterReportResultSchema.safeParse({ ...validResult, reports: [], total: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing date", () => {
    const { date: _, ...rest } = validResult;
    expect(getRecruiterReportResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty date", () => {
    expect(getRecruiterReportResultSchema.safeParse({ ...validResult, date: "" }).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(getRecruiterReportResultSchema.safeParse({ ...validResult, total: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// singleReportSchema
// ---------------------------------------------------------------------------
describe("singleReportSchema", () => {
  const validReport = {
    id: "rpt-1",
    type: "recruiter_daily",
    label: "Recruiter Daily",
    data: {
      date: "2026-06-15",
      reports: [
        {
          staffEmail: "a@b.com",
          staffName: "Recruiter",
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
      total: 0,
    },
    generatedAt: "2026-06-15T10:00:00Z",
  };

  it("accepts a valid report with recruiter data", () => {
    expect(singleReportSchema.safeParse(validReport).success).toBe(true);
  });

  it("accepts data as record of unknown", () => {
    expect(
      singleReportSchema.safeParse({
        id: "rpt-2",
        type: "custom",
        label: "Custom",
        data: { key: "value", nested: { foo: 1 } },
        generatedAt: "now",
      }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validReport;
    expect(singleReportSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty id", () => {
    expect(singleReportSchema.safeParse({ ...validReport, id: "" }).success).toBe(false);
  });

  it("rejects empty type", () => {
    expect(singleReportSchema.safeParse({ ...validReport, type: "" }).success).toBe(false);
  });

  it("rejects empty label", () => {
    expect(singleReportSchema.safeParse({ ...validReport, label: "" }).success).toBe(false);
  });

  it("rejects missing data", () => {
    const { data: _, ...rest } = validReport;
    expect(singleReportSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing generatedAt", () => {
    const { generatedAt: _, ...rest } = validReport;
    expect(singleReportSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// generateReportResultSchema
// ---------------------------------------------------------------------------
describe("generateReportResultSchema", () => {
  it("accepts result without data", () => {
    expect(
      generateReportResultSchema.safeParse({ operation: "success", message: "Report generated" }).success,
    ).toBe(true);
  });

  it("accepts result with optional data", () => {
    expect(
      generateReportResultSchema.safeParse({
        operation: "success",
        message: "Done",
        data: {
          id: "rpt-1",
          type: "recruiter_daily",
          label: "Daily",
          data: { key: "val" },
          generatedAt: "now",
        },
      }).success,
    ).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(generateReportResultSchema.safeParse({ message: "Done" }).success).toBe(false);
  });

  it("rejects empty operation", () => {
    expect(generateReportResultSchema.safeParse({ operation: "", message: "Done" }).success).toBe(false);
  });

  it("rejects missing message", () => {
    expect(generateReportResultSchema.safeParse({ operation: "success" }).success).toBe(false);
  });

  it("rejects empty message", () => {
    expect(generateReportResultSchema.safeParse({ operation: "success", message: "" }).success).toBe(false);
  });
});
