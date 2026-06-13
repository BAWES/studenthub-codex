import { describe, it, expect } from "vitest";

import {
  listReportsSchema,
  getReportSchema,
  generateReportSchema,
  listReportsResultSchema,
  reportTypeItemSchema,
  recruiterStaffReportSchema,
  getRecruiterReportResultSchema,
  singleReportSchema,
  generateReportResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema: listReportsSchema
// ---------------------------------------------------------------------------

describe("listReportsSchema", () => {
  it("accepts default values when no params provided", () => {
    const result = listReportsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.type).toBeUndefined();
    }
  });

  it("accepts explicit type, page, limit", () => {
    const result = listReportsSchema.safeParse({
      type: "recruiter-daily",
      page: "2",
      limit: "50",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("recruiter-daily");
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects page less than 1", () => {
    expect(listReportsSchema.safeParse({ page: "0" }).success).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    expect(listReportsSchema.safeParse({ limit: "101" }).success).toBe(false);
  });

  it("rejects limit less than 1", () => {
    expect(listReportsSchema.safeParse({ limit: "0" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: getReportSchema
// ---------------------------------------------------------------------------

describe("getReportSchema", () => {
  it("accepts valid id and type", () => {
    const result = getReportSchema.safeParse({
      id: "report-123",
      type: "recruiter-daily",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("report-123");
      expect(result.data.type).toBe("recruiter-daily");
    }
  });

  it("rejects empty id", () => {
    expect(getReportSchema.safeParse({ id: "", type: "test" }).success).toBe(false);
  });

  it("rejects empty type", () => {
    expect(getReportSchema.safeParse({ id: "1", type: "" }).success).toBe(false);
  });

  it("rejects missing id", () => {
    expect(getReportSchema.safeParse({ type: "test" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: generateReportSchema
// ---------------------------------------------------------------------------

describe("generateReportSchema", () => {
  it("accepts minimal input with only type", () => {
    const result = generateReportSchema.safeParse({ type: "recruiter-daily" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("recruiter-daily");
      expect(result.data.date).toBeUndefined();
    }
  });

  it("accepts full input with all fields", () => {
    const result = generateReportSchema.safeParse({
      type: "recruiter-daily",
      date: "2024-06-01",
      staffEmail: "hr@studenthub.com",
      params: { period: "monthly" },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staffEmail).toBe("hr@studenthub.com");
    }
  });

  it("rejects empty type", () => {
    expect(generateReportSchema.safeParse({ type: "" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      generateReportSchema.safeParse({ type: "test", staffEmail: "not-email" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: reportTypeItemSchema
// ---------------------------------------------------------------------------

describe("reportTypeItemSchema", () => {
  it("accepts a valid report type item", () => {
    const result = reportTypeItemSchema.safeParse({
      type: "recruiter-daily",
      label: "Recruiter Daily Report",
      description: "Daily activity report for recruiters",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing label", () => {
    expect(
      reportTypeItemSchema.safeParse({ type: "test", description: "desc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: listReportsResultSchema
// ---------------------------------------------------------------------------

describe("listReportsResultSchema", () => {
  const validReport = {
    type: "recruiter-daily",
    label: "Recruiter Daily Report",
    description: "Daily activity report for recruiters",
  };

  it("accepts a valid list result", () => {
    const result = listReportsResultSchema.safeParse({
      reports: [validReport],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.reports).toHaveLength(1);
  });

  it("accepts empty result", () => {
    const result = listReportsResultSchema.safeParse({
      reports: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listReportsResultSchema.safeParse({
        reports: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: recruiterStaffReportSchema
// ---------------------------------------------------------------------------

describe("recruiterStaffReportSchema", () => {
  it("accepts a valid recruiter report row", () => {
    const result = recruiterStaffReportSchema.safeParse({
      staffEmail: "hr@studenthub.com",
      staffName: "Ahmed HR",
      totalAssigned: 150,
      totalRequests: 45,
      totalNotes: 30,
      totalStories: 12,
      totalAcceptedInvitations: 80,
      totalRejectedInvitations: 20,
      totalSuggestions: 5,
      totalInvitations: 100,
      totalCompletedStories: 8,
    });
    expect(result.success).toBe(true);
  });

  it("accepts zero values", () => {
    const result = recruiterStaffReportSchema.safeParse({
      staffEmail: "test@test.com",
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
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing staffEmail", () => {
    expect(
      recruiterStaffReportSchema.safeParse({
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
    ).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      recruiterStaffReportSchema.safeParse({
        staffEmail: "test@test.com",
        staffName: "Test",
        totalAssigned: -1,
        totalRequests: 0,
        totalNotes: 0,
        totalStories: 0,
        totalAcceptedInvitations: 0,
        totalRejectedInvitations: 0,
        totalSuggestions: 0,
        totalInvitations: 0,
        totalCompletedStories: 0,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: getRecruiterReportResultSchema
// ---------------------------------------------------------------------------

describe("getRecruiterReportResultSchema", () => {
  const validStaffRow = {
    staffEmail: "hr@test.com",
    staffName: "HR",
    totalAssigned: 10,
    totalRequests: 5,
    totalNotes: 3,
    totalStories: 2,
    totalAcceptedInvitations: 8,
    totalRejectedInvitations: 1,
    totalSuggestions: 0,
    totalInvitations: 9,
    totalCompletedStories: 1,
  };

  it("accepts a valid result", () => {
    const result = getRecruiterReportResultSchema.safeParse({
      date: "2024-06-01",
      reports: [validStaffRow],
      total: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty reports", () => {
    const result = getRecruiterReportResultSchema.safeParse({
      date: "2024-06-01",
      reports: [],
      total: 0,
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output schema: singleReportSchema
// ---------------------------------------------------------------------------

describe("singleReportSchema", () => {
  it("accepts a report with recruiter data", () => {
    const result = singleReportSchema.safeParse({
      id: "report-001",
      type: "recruiter-daily",
      label: "Recruiter Daily Report",
      data: {
        date: "2024-06-01",
        reports: [],
        total: 0,
      },
      generatedAt: "2024-06-02T10:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a report with generic data", () => {
    const result = singleReportSchema.safeParse({
      id: "report-002",
      type: "custom",
      label: "Custom Report",
      data: { key: "value", count: 42 },
      generatedAt: "2024-06-02T10:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing id", () => {
    expect(
      singleReportSchema.safeParse({
        type: "test",
        label: "Test",
        data: { key: "value" },
        generatedAt: "now",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: generateReportResultSchema
// ---------------------------------------------------------------------------

describe("generateReportResultSchema", () => {
  it("accepts a success result", () => {
    const result = generateReportResultSchema.safeParse({
      operation: "success",
      message: "Report generated",
      data: {
        id: "report-001",
        type: "recruiter-daily",
        label: "Recruiter Daily",
        data: { date: "2024-06-01", reports: [], total: 0 },
        generatedAt: "2024-06-02T10:00:00.000Z",
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts a result without data", () => {
    const result = generateReportResultSchema.safeParse({
      operation: "error",
      message: "Failed to generate",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty message", () => {
    expect(
      generateReportResultSchema.safeParse({ operation: "error", message: "" }).success,
    ).toBe(false);
  });
});
