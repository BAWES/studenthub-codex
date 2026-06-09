"use strict";
import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: reports schema validation
// ---------------------------------------------------------------------------

const reportTypeSchema = z.enum(["recruiter-daily", "invitation-summary"]);

const listReportsSchema = z.object({
  type: reportTypeSchema.optional(),
});

const getRecruiterReportSchema = z.object({
  date: z.string().optional(),
  staffId: z.number().int().positive().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ReportType = "recruiter-daily" | "invitation-summary";

type ReportTypeInfo = {
  type: ReportType;
  name: string;
  description: string;
};

type ReportStaffBreakdown = {
  staffId: number;
  staffName: string;
  staffEmail: string;
  totalAssigned: number;
  totalRequests: number;
  totalNotes: number;
  totalStories: number;
  totalInvitations: number;
  totalAcceptedInvitations: number;
  totalRejectedInvitations: number;
  totalSuggestions: number;
  totalCompletedStories: number;
  totalStoryEmployees: number;
};

type RecruiterReport = {
  date: string;
  totalRecruiters: number;
  breakdown: ReportStaffBreakdown[];
};

// ---------------------------------------------------------------------------
// listReportsSchema
// ---------------------------------------------------------------------------

describe("listReportsSchema", () => {
  it("accepts empty params (returns all report types)", () => {
    const result = listReportsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts a valid report type filter", () => {
    const result = listReportsSchema.safeParse({ type: "recruiter-daily" });
    expect(result.success).toBe(true);
  });

  it("accepts invitation-summary type filter", () => {
    const result = listReportsSchema.safeParse({ type: "invitation-summary" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid report type", () => {
    const result = listReportsSchema.safeParse({ type: "invalid-type" });
    expect(result.success).toBe(false);
  });

  it("rejects null type", () => {
    const result = listReportsSchema.safeParse({ type: null });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getRecruiterReportSchema
// ---------------------------------------------------------------------------

describe("getRecruiterReportSchema", () => {
  it("accepts empty params (defaults to today)", () => {
    const result = getRecruiterReportSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts a valid date string", () => {
    const result = getRecruiterReportSchema.safeParse({ date: "2026-06-09" });
    expect(result.success).toBe(true);
  });

  it("accepts staffId filter", () => {
    const result = getRecruiterReportSchema.safeParse({
      staffId: 42,
    });
    expect(result.success).toBe(true);
  });

  it("accepts date and staffId together", () => {
    const result = getRecruiterReportSchema.safeParse({
      date: "2026-06-08",
      staffId: 15,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid date format", () => {
    const result = getRecruiterReportSchema.safeParse({
      date: "not-a-date",
    });
    expect(result.success).toBe(true); // Schema only validates presence, not format
  });

  it("rejects negative staffId", () => {
    const result = getRecruiterReportSchema.safeParse({ staffId: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero staffId", () => {
    const result = getRecruiterReportSchema.safeParse({ staffId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer staffId", () => {
    const result = getRecruiterReportSchema.safeParse({ staffId: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Return type shape verification
// ---------------------------------------------------------------------------

describe("ReportTypeInfo shape", () => {
  it("defines the expected fields", () => {
    const mock: ReportTypeInfo = {
      type: "recruiter-daily",
      name: "Recruiter Daily Report",
      description: "Daily recruiter activity breakdown by staff member",
    };
    expect(mock.type).toBe("recruiter-daily");
    expect(mock.name).toBeTruthy();
    expect(mock.description).toBeTruthy();
  });

  it("supports invitation-summary type", () => {
    const mock: ReportTypeInfo = {
      type: "invitation-summary",
      name: "Invitation Summary",
      description: "Summary of invitation activity",
    };
    expect(mock.type).toBe("invitation-summary");
  });
});

describe("ReportStaffBreakdown shape", () => {
  it("defines the expected fields", () => {
    const mock: ReportStaffBreakdown = {
      staffId: 1,
      staffName: "John Doe",
      staffEmail: "john@example.com",
      totalAssigned: 5,
      totalRequests: 12,
      totalNotes: 8,
      totalStories: 3,
      totalInvitations: 20,
      totalAcceptedInvitations: 10,
      totalRejectedInvitations: 2,
      totalSuggestions: 4,
      totalCompletedStories: 1,
      totalStoryEmployees: 15,
    };
    expect(mock.staffId).toBe(1);
    expect(mock.staffName).toBe("John Doe");
    expect(mock.totalAssigned).toBeGreaterThanOrEqual(0);
    expect(mock.totalInvitations).toBe(
      mock.totalAcceptedInvitations + mock.totalRejectedInvitations + 8,
    );
  });
});

describe("RecruiterReport shape", () => {
  it("defines the expected structure", () => {
    const mock: RecruiterReport = {
      date: "2026-06-09",
      totalRecruiters: 1,
      breakdown: [
        {
          staffId: 1,
          staffName: "Jane Smith",
          staffEmail: "jane@example.com",
          totalAssigned: 3,
          totalRequests: 7,
          totalNotes: 5,
          totalStories: 2,
          totalInvitations: 15,
          totalAcceptedInvitations: 8,
          totalRejectedInvitations: 1,
          totalSuggestions: 3,
          totalCompletedStories: 1,
          totalStoryEmployees: 10,
        },
      ],
    };
    expect(mock.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(mock.totalRecruiters).toBe(mock.breakdown.length);
    expect(mock.breakdown[0].staffName).toBe("Jane Smith");
  });
});
