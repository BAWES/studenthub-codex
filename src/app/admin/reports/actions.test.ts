import { describe, it, expect } from "vitest";
import {
  listReportsSchema,
  getReportSchema,
  generateReportSchema,
  reportTypeItemSchema,
  listReportsResultSchema,
  singleReportSchema,
  generateReportResultSchema,
  recruiterStaffReportSchema,
  getRecruiterReportResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests for admin/reports actions (pure unit — no DB)
// ---------------------------------------------------------------------------

describe("listReportsSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listReportsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const r = listReportsSchema.safeParse({ page: 2, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("coerces string page and limit", () => {
    const r = listReportsSchema.safeParse({ page: "3", limit: "50" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    expect(listReportsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(listReportsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects page below 1", () => {
    expect(listReportsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("accepts type filter string", () => {
    const r = listReportsSchema.safeParse({ type: "recruiter-daily" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.type).toBe("recruiter-daily");
    }
  });
});

describe("getReportSchema", () => {
  it("accepts valid report lookup", () => {
    const r = getReportSchema.safeParse({
      id: "2026-06-10-recruiter-daily",
      type: "recruiter-daily",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.id).toBe("2026-06-10-recruiter-daily");
      expect(r.data.type).toBe("recruiter-daily");
    }
  });

  it("rejects empty id", () => {
    expect(
      getReportSchema.safeParse({ id: "", type: "recruiter-daily" }).success,
    ).toBe(false);
  });

  it("rejects empty type", () => {
    expect(
      getReportSchema.safeParse({ id: "report-1", type: "" }).success,
    ).toBe(false);
  });

  it("rejects missing id", () => {
    expect(getReportSchema.safeParse({ type: "recruiter-daily" }).success).toBe(
      false,
    );
  });

  it("rejects missing type", () => {
    expect(getReportSchema.safeParse({ id: "report-1" }).success).toBe(false);
  });

  it("rejects empty input", () => {
    expect(getReportSchema.safeParse({}).success).toBe(false);
  });
});

describe("generateReportSchema", () => {
  it("accepts minimal valid input (type only)", () => {
    const r = generateReportSchema.safeParse({ type: "recruiter-daily" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.type).toBe("recruiter-daily");
    }
  });

  it("accepts full input with all fields", () => {
    const r = generateReportSchema.safeParse({
      type: "invitation-summary",
      date: "2026-06-10",
      staffEmail: "recruiter@studenthub.com",
      params: { region: "kuwait" },
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.type).toBe("invitation-summary");
      expect(r.data.date).toBe("2026-06-10");
      expect(r.data.staffEmail).toBe("recruiter@studenthub.com");
    }
  });

  it("rejects empty type", () => {
    expect(generateReportSchema.safeParse({ type: "" }).success).toBe(false);
  });

  it("rejects missing type", () => {
    expect(generateReportSchema.safeParse({}).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      generateReportSchema.safeParse({
        type: "recruiter-daily",
        staffEmail: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("accepts optional params as record", () => {
    const r = generateReportSchema.safeParse({
      type: "recruiter-daily",
      params: { foo: "bar", count: 42 },
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output validation — reportTypeItemSchema
// ---------------------------------------------------------------------------

describe("reportTypeItemSchema (output validation)", () => {
  it("accepts a valid report type item", () => {
    const r = reportTypeItemSchema.safeParse({
      type: "recruiter-daily",
      label: "Daily Recruiter Report",
      description: "Daily activity summary",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing type", () => {
    expect(
      reportTypeItemSchema.safeParse({
        label: "Test",
        description: "Desc",
      }).success,
    ).toBe(false);
  });

  it("rejects empty label", () => {
    expect(
      reportTypeItemSchema.safeParse({
        type: "recruiter-daily",
        label: "",
        description: "Desc",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation — listReportsResultSchema
// ---------------------------------------------------------------------------

describe("listReportsResultSchema (output validation)", () => {
  const validResponse = {
    reports: [
      {
        type: "recruiter-daily",
        label: "Daily Recruiter Report",
        description: "Daily activity summary",
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid list reports response", () => {
    const r = listReportsResultSchema.safeParse(validResponse);
    expect(r.success).toBe(true);
  });

  it("accepts empty reports array", () => {
    const r = listReportsResultSchema.safeParse({
      ...validResponse,
      reports: [],
      total: 0,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing total", () => {
    expect(
      listReportsResultSchema.safeParse({
        reports: [],
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects negative page", () => {
    expect(
      listReportsResultSchema.safeParse({
        ...validResponse,
        page: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects invalid report in reports array", () => {
    const r = listReportsResultSchema.safeParse({
      ...validResponse,
      reports: [{ type: "", label: "Bad", description: "" }],
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation — recruiterStaffReportSchema
// ---------------------------------------------------------------------------

describe("recruiterStaffReportSchema (output validation)", () => {
  const validRow = {
    staffEmail: "recruiter@test.com",
    staffName: "John Doe",
    totalAssigned: 5,
    totalRequests: 3,
    totalNotes: 10,
    totalStories: 2,
    totalAcceptedInvitations: 4,
    totalRejectedInvitations: 1,
    totalSuggestions: 8,
    totalInvitations: 5,
    totalCompletedStories: 2,
  };

  it("accepts a valid staff report row", () => {
    const r = recruiterStaffReportSchema.safeParse(validRow);
    expect(r.success).toBe(true);
  });

  it("rejects missing staffEmail", () => {
    const { staffEmail, ...rest } = validRow;
    expect(recruiterStaffReportSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative totalAssigned", () => {
    expect(
      recruiterStaffReportSchema.safeParse({
        ...validRow,
        totalAssigned: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects non-integer totalRequests", () => {
    expect(
      recruiterStaffReportSchema.safeParse({
        ...validRow,
        totalRequests: 3.5,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation — getRecruiterReportResultSchema
// ---------------------------------------------------------------------------

describe("getRecruiterReportResultSchema (output validation)", () => {
  const valid = {
    date: "2026-06-10",
    reports: [
      {
        staffEmail: "recruiter@test.com",
        staffName: "John Doe",
        totalAssigned: 5,
        totalRequests: 3,
        totalNotes: 10,
        totalStories: 2,
        totalAcceptedInvitations: 4,
        totalRejectedInvitations: 1,
        totalSuggestions: 8,
        totalInvitations: 5,
        totalCompletedStories: 2,
      },
    ],
    total: 1,
  };

  it("accepts a valid recruiter report result", () => {
    const r = getRecruiterReportResultSchema.safeParse(valid);
    expect(r.success).toBe(true);
  });

  it("rejects missing date", () => {
    const { date, ...rest } = valid;
    expect(getRecruiterReportResultSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation — singleReportSchema
// ---------------------------------------------------------------------------

describe("singleReportSchema (output validation)", () => {
  it("accepts a valid single report", () => {
    const r = singleReportSchema.safeParse({
      id: "2026-06-10-recruiter-daily",
      type: "recruiter-daily",
      label: "Daily Recruiter Report",
      data: {
        date: "2026-06-10",
        reports: [],
        total: 0,
      },
      generatedAt: "2026-06-10T12:00:00.000Z",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty id", () => {
    expect(
      singleReportSchema.safeParse({
        id: "",
        type: "recruiter-daily",
        label: "Test",
        data: {},
        generatedAt: "2026-06-10T12:00:00.000Z",
      }).success,
    ).toBe(false);
  });

  it("rejects missing generatedAt", () => {
    expect(
      singleReportSchema.safeParse({
        id: "report-1",
        type: "recruiter-daily",
        label: "Test",
        data: {},
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation — generateReportResultSchema
// ---------------------------------------------------------------------------

describe("generateReportResultSchema (output validation)", () => {
  it("accepts a success result with data", () => {
    const r = generateReportResultSchema.safeParse({
      operation: "success",
      message: "Report generated successfully",
      data: {
        id: "2026-06-10-recruiter-daily",
        type: "recruiter-daily",
        label: "Daily Recruiter Report",
        data: { date: "2026-06-10", reports: [], total: 0 },
        generatedAt: "2026-06-10T12:00:00.000Z",
      },
    });
    expect(r.success).toBe(true);
  });

  it("accepts an error result without data", () => {
    const r = generateReportResultSchema.safeParse({
      operation: "error",
      message: "Failed to generate report",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(
      generateReportResultSchema.safeParse({
        message: "Test",
      }).success,
    ).toBe(false);
  });

  it("rejects empty message", () => {
    expect(
      generateReportResultSchema.safeParse({
        operation: "error",
        message: "",
      }).success,
    ).toBe(false);
  });
});
