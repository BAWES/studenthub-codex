import { describe, it, expect } from "vitest";
import {
  listReportsSchema,
  getRecruiterReportSchema,
  reportTypeItemSchema,
  recruiterStaffReportSchema,
  listReportsResultSchema,
  getRecruiterReportResultSchema,
} from "./schemas";
import type { RecruiterStaffReport, ReportTypeItem } from "./schemas";

// ---------------------------------------------------------------------------
// Pure functions for testable logic
// ---------------------------------------------------------------------------

const reportTypes: ReportTypeItem[] = [
  {
    type: "recruiter-daily",
    label: "Daily Recruiter Report",
    description: "Daily activity summary for each recruiter staff member",
  },
  {
    type: "invitation-summary",
    label: "Invitation Summary",
    description: "Summary of invitation activity across all staff",
  },
];

function listReportTypes(filter?: string): ReportTypeItem[] {
  if (filter) {
    return reportTypes.filter((r) =>
      r.type.toLowerCase().includes(filter.toLowerCase()),
    );
  }
  return [...reportTypes];
}

function validateListReports(input: unknown) {
  return listReportsSchema.parse(input);
}

function validateGetRecruiterReport(input: unknown) {
  return getRecruiterReportSchema.parse(input);
}

function buildRecruiterReportResponse(
  staffRows: RecruiterStaffReport[],
): RecruiterStaffReport[] {
  return staffRows.map((r) => ({
    staffEmail: r.staffEmail,
    staffName: r.staffName,
    totalAssigned: r.totalAssigned,
    totalRequests: r.totalRequests,
    totalNotes: r.totalNotes,
    totalStories: r.totalStories,
    totalAcceptedInvitations: r.totalAcceptedInvitations,
    totalRejectedInvitations: r.totalRejectedInvitations,
    totalSuggestions: r.totalSuggestions,
    totalInvitations: r.totalInvitations,
    totalCompletedStories: r.totalCompletedStories,
  }));
}

// ---------------------------------------------------------------------------
// Input schema tests — listReports
// ---------------------------------------------------------------------------

describe("listReports", () => {
  it("returns all report types when no filter is provided", () => {
    const result = listReportTypes();
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe("recruiter-daily");
    expect(result[1].type).toBe("invitation-summary");
  });

  it("filters report types by name", () => {
    const result = listReportTypes("invitation");
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("invitation-summary");
  });

  it("returns empty list when filter matches nothing", () => {
    const result = listReportTypes("nonexistent");
    expect(result).toHaveLength(0);
  });

  it("validates listReports schema with default limit", () => {
    const parsed = validateListReports({});
    expect(parsed.limit).toBe(20);
  });

  it("validates listReports schema with custom limit", () => {
    const parsed = validateListReports({ limit: "5" });
    expect(parsed.limit).toBe(5);
  });

  it("rejects limit over 100", () => {
    expect(() => validateListReports({ limit: "200" })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Input schema tests — getRecruiterReport
// ---------------------------------------------------------------------------

describe("getRecruiterReport", () => {
  it("validates with optional date only", () => {
    const parsed = validateGetRecruiterReport({ date: "2026-06-09" });
    expect(parsed.date).toBe("2026-06-09");
  });

  it("validates with optional staff email", () => {
    const parsed = validateGetRecruiterReport({
      date: "2026-06-09",
      staffEmail: "recruiter@example.com",
    });
    expect(parsed.staffEmail).toBe("recruiter@example.com");
  });

  it("rejects invalid email", () => {
    expect(() =>
      validateGetRecruiterReport({
        date: "2026-06-09",
        staffEmail: "not-an-email",
      }),
    ).toThrow();
  });

  it("accepts empty input", () => {
    const parsed = validateGetRecruiterReport({});
    expect(parsed.date).toBeUndefined();
    expect(parsed.staffEmail).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Build recruiter report response
// ---------------------------------------------------------------------------

describe("buildRecruiterReportResponse", () => {
  it("formats staff report rows correctly", () => {
    const rows: RecruiterStaffReport[] = [
      {
        staffEmail: "recruiter@example.com",
        staffName: "John Recruiter",
        totalAssigned: 5,
        totalRequests: 10,
        totalNotes: 3,
        totalStories: 8,
        totalAcceptedInvitations: 4,
        totalRejectedInvitations: 1,
        totalSuggestions: 6,
        totalInvitations: 7,
        totalCompletedStories: 3,
      },
    ];

    const result = buildRecruiterReportResponse(rows);
    expect(result).toHaveLength(1);
    expect(result[0].staffEmail).toBe("recruiter@example.com");
    expect(result[0].totalAssigned).toBe(5);
    expect(result[0].totalCompletedStories).toBe(3);
  });

  it("handles empty input", () => {
    const result = buildRecruiterReportResponse([]);
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — reportTypeItemSchema
// ---------------------------------------------------------------------------

describe("reportTypeItemSchema", () => {
  it("accepts a valid report type item", () => {
    const result = reportTypeItemSchema.safeParse({
      type: "recruiter-daily",
      label: "Daily Recruiter Report",
      description: "Daily summary",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing type", () => {
    const result = reportTypeItemSchema.safeParse({
      label: "Daily Recruiter Report",
      description: "Daily summary",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string type", () => {
    const result = reportTypeItemSchema.safeParse({
      type: 123,
      label: "Daily Recruiter Report",
      description: "Daily summary",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — recruiterStaffReportSchema
// ---------------------------------------------------------------------------

describe("recruiterStaffReportSchema", () => {
  it("accepts a valid recruiter staff report", () => {
    const result = recruiterStaffReportSchema.safeParse({
      staffEmail: "recruiter@example.com",
      staffName: "John Recruiter",
      totalAssigned: 5,
      totalRequests: 10,
      totalNotes: 3,
      totalStories: 8,
      totalAcceptedInvitations: 4,
      totalRejectedInvitations: 1,
      totalSuggestions: 6,
      totalInvitations: 7,
      totalCompletedStories: 3,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative totalAssigned", () => {
    const result = recruiterStaffReportSchema.safeParse({
      staffEmail: "recruiter@example.com",
      staffName: "John Recruiter",
      totalAssigned: -1,
      totalRequests: 0,
      totalNotes: 0,
      totalStories: 0,
      totalAcceptedInvitations: 0,
      totalRejectedInvitations: 0,
      totalSuggestions: 0,
      totalInvitations: 0,
      totalCompletedStories: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing staffEmail", () => {
    const result = recruiterStaffReportSchema.safeParse({
      staffName: "John Recruiter",
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
    expect(result.success).toBe(false);
  });

  it("rejects non-integer totalRequests", () => {
    const result = recruiterStaffReportSchema.safeParse({
      staffEmail: "recruiter@example.com",
      staffName: "John Recruiter",
      totalAssigned: 5,
      totalRequests: 10.5,
      totalNotes: 3,
      totalStories: 8,
      totalAcceptedInvitations: 4,
      totalRejectedInvitations: 1,
      totalSuggestions: 6,
      totalInvitations: 7,
      totalCompletedStories: 3,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — listReportsResultSchema
// ---------------------------------------------------------------------------

describe("listReportsResultSchema", () => {
  it("accepts a valid list reports result", () => {
    const result = listReportsResultSchema.safeParse({
      reports: [
        {
          type: "recruiter-daily",
          label: "Daily Recruiter Report",
          description: "Daily activity summary",
        },
        {
          type: "invitation-summary",
          label: "Invitation Summary",
          description: "Summary of invitation activity",
        },
      ],
      total: 2,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty reports array", () => {
    const result = listReportsResultSchema.safeParse({
      reports: [],
      total: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = listReportsResultSchema.safeParse({
      reports: [],
      total: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing reports field", () => {
    const result = listReportsResultSchema.safeParse({ total: 0 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — getRecruiterReportResultSchema
// ---------------------------------------------------------------------------

describe("getRecruiterReportResultSchema", () => {
  it("accepts a valid recruiter report result", () => {
    const result = getRecruiterReportResultSchema.safeParse({
      date: "2026-06-10",
      reports: [
        {
          staffEmail: "recruiter@example.com",
          staffName: "John Recruiter",
          totalAssigned: 5,
          totalRequests: 10,
          totalNotes: 3,
          totalStories: 8,
          totalAcceptedInvitations: 4,
          totalRejectedInvitations: 1,
          totalSuggestions: 6,
          totalInvitations: 7,
          totalCompletedStories: 3,
        },
      ],
      total: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty reports array", () => {
    const result = getRecruiterReportResultSchema.safeParse({
      date: "2026-06-10",
      reports: [],
      total: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing date", () => {
    const result = getRecruiterReportResultSchema.safeParse({
      reports: [],
      total: 0,
    });
    expect(result.success).toBe(false);
  });
});
