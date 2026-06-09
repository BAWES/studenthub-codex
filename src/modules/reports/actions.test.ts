import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas (duplicated from actions.ts for isolated unit testing)
// ---------------------------------------------------------------------------

const listReportsSchema = z.object({
  type: z.string().optional(),
  date: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getRecruiterReportSchema = z.object({
  date: z.string().optional(),
  staffEmail: z.string().email().optional(),
});

const reportTypes = [
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
// Types
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
  staffRows: {
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
  }[],
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
    const rows = [
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
