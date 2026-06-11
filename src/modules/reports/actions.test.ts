import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  listReportsSchema,
  getRecruiterReportSchema,
  reportTypeItemSchema,
  listReportsResultSchema,
  recruiterStaffReportSchema,
  getRecruiterReportResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Type aliases (mirrored from actions.ts for test isolation)
// ---------------------------------------------------------------------------

type ReportTypeItem = {
  type: string;
  label: string;
  description: string;
};

type RecruiterStaffReport = {
  staffEmail: string;
  staffName: string;
  totalAssigned: number;
  totalRequests: number;
  totalNotes: number;
  totalStories: number;
  totalAcceptedInvitations: number;
  totalRejectedInvitations: number;
  totalSuggestions: number;
  totalInvitations: number;
  totalCompletedStories: number;
};

type ListReportsResult = {
  reports: ReportTypeItem[];
  total: number;
};

type GetRecruiterReportResult = {
  date: string;
  reports: RecruiterStaffReport[];
  total: number;
};

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

// ---------------------------------------------------------------------------
// Pure functions for testable logic
// ---------------------------------------------------------------------------

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
  return staffRows.map((r) => ({ ...r }));
}

function buildListReportsResponse(
  reports: ReportTypeItem[],
  total: number,
): ListReportsResult {
  return { reports, total };
}

function buildGetRecruiterReportResponse(
  date: string,
  reports: RecruiterStaffReport[],
): GetRecruiterReportResult {
  return { date, reports, total: reports.length };
}

// ---------------------------------------------------------------------------
// Output validation helpers
// ---------------------------------------------------------------------------

function validateListReportsOutput(data: unknown): ListReportsResult {
  return listReportsResultSchema.parse(data);
}

function validateGetRecruiterReportOutput(
  data: unknown,
): GetRecruiterReportResult {
  return getRecruiterReportResultSchema.parse(data);
}

// ---------------------------------------------------------------------------
// Tests
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
// Output validation tests
// ---------------------------------------------------------------------------

describe("output validation — listReportsResultSchema", () => {
  it("accepts valid listReports result", () => {
    const result = buildListReportsResponse(reportTypes, 2);
    const parsed = validateListReportsOutput(result);
    expect(parsed.reports).toHaveLength(2);
    expect(parsed.total).toBe(2);
  });

  it("accepts empty reports list", () => {
    const result = buildListReportsResponse([], 0);
    const parsed = validateListReportsOutput(result);
    expect(parsed.reports).toHaveLength(0);
    expect(parsed.total).toBe(0);
  });

  it("rejects negative total", () => {
    expect(() =>
      validateListReportsOutput({ reports: [], total: -1 }),
    ).toThrow();
  });

  it("rejects missing total field", () => {
    expect(() =>
      validateListReportsOutput({ reports: [] }),
    ).toThrow();
  });

  it("rejects string total instead of number", () => {
    expect(() =>
      validateListReportsOutput({ reports: reportTypes, total: "2" }),
    ).toThrow();
  });
});

describe("output validation — recruiterStaffReportSchema", () => {
  it("accepts valid recruiter staff report", () => {
    const parsed = recruiterStaffReportSchema.parse({
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
    expect(parsed.staffEmail).toBe("recruiter@example.com");
  });

  it("rejects negative counts", () => {
    expect(() =>
      recruiterStaffReportSchema.parse({
        staffEmail: "recruiter@example.com",
        staffName: "John",
        totalAssigned: -1,
        totalRequests: 0,
        totalNotes: 0,
        totalStories: 0,
        totalAcceptedInvitations: 0,
        totalRejectedInvitations: 0,
        totalSuggestions: 0,
        totalInvitations: 0,
        totalCompletedStories: 0,
      }),
    ).toThrow();
  });

  it("rejects missing staffEmail", () => {
    expect(() =>
      recruiterStaffReportSchema.parse({
        staffName: "John",
        totalAssigned: 0,
        totalRequests: 0,
        totalNotes: 0,
        totalStories: 0,
        totalAcceptedInvitations: 0,
        totalRejectedInvitations: 0,
        totalSuggestions: 0,
        totalInvitations: 0,
        totalCompletedStories: 0,
      }),
    ).toThrow();
  });

  it("rejects string count instead of number", () => {
    expect(() =>
      recruiterStaffReportSchema.parse({
        staffEmail: "recruiter@example.com",
        staffName: "John",
        totalAssigned: "5",
        totalRequests: 0,
        totalNotes: 0,
        totalStories: 0,
        totalAcceptedInvitations: 0,
        totalRejectedInvitations: 0,
        totalSuggestions: 0,
        totalInvitations: 0,
        totalCompletedStories: 0,
      }),
    ).toThrow();
  });
});

describe("output validation — getRecruiterReportResultSchema", () => {
  it("accepts valid getRecruiterReport result", () => {
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
    const result = buildGetRecruiterReportResponse("2026-06-09", rows);
    const parsed = validateGetRecruiterReportOutput(result);
    expect(parsed.date).toBe("2026-06-09");
    expect(parsed.reports).toHaveLength(1);
    expect(parsed.total).toBe(1);
  });

  it("handles empty reports array", () => {
    const result = buildGetRecruiterReportResponse("2026-06-09", []);
    const parsed = validateGetRecruiterReportOutput(result);
    expect(parsed.reports).toHaveLength(0);
    expect(parsed.total).toBe(0);
  });

  it("rejects missing date", () => {
    expect(() =>
      validateGetRecruiterReportOutput({ reports: [], total: 0 }),
    ).toThrow();
  });

  it("rejects string total", () => {
    expect(() =>
      validateGetRecruiterReportOutput({
        date: "2026-06-09",
        reports: [],
        total: "0",
      }),
    ).toThrow();
  });
});

describe("reportTypeItemSchema", () => {
  it("accepts valid report type item", () => {
    const parsed = reportTypeItemSchema.parse({
      type: "recruiter-daily",
      label: "Daily Recruiter Report",
      description: "Some description",
    });
    expect(parsed.type).toBe("recruiter-daily");
  });

  it("rejects missing label", () => {
    expect(() =>
      reportTypeItemSchema.parse({
        type: "recruiter-daily",
        description: "Some description",
      }),
    ).toThrow();
  });

  it("rejects empty type", () => {
    expect(() =>
      reportTypeItemSchema.parse({
        type: "",
        label: "Label",
        description: "Desc",
      }),
    ).toThrow();
  });
});
