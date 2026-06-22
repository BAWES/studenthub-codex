import { describe, it, expect } from "vitest";
import { getReportSchema, recruiterStaffReportSchema, getRecruiterReportResultSchema, singleReportSchema } from "../schemas";

// ---------------------------------------------------------------------------
// Input schema: getReportSchema
// ---------------------------------------------------------------------------
describe("getReportSchema (input)", () => {
  it("accepts valid id and type", () => {
    const r = getReportSchema.safeParse({ id: "rpt-1", type: "recruiter-daily" });
    expect(r.success).toBe(true);
  });

  it("rejects empty id", () => {
    expect(getReportSchema.safeParse({ id: "", type: "test" }).success).toBe(false);
  });

  it("rejects empty type", () => {
    expect(getReportSchema.safeParse({ id: "rpt-1", type: "" }).success).toBe(false);
  });

  it("rejects missing id", () => {
    expect(getReportSchema.safeParse({ type: "test" }).success).toBe(false);
  });

  it("rejects missing type", () => {
    expect(getReportSchema.safeParse({ id: "rpt-1" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: recruiterStaffReportSchema
// ---------------------------------------------------------------------------
describe("recruiterStaffReportSchema (output)", () => {
  it("accepts a valid recruiter report row", () => {
    const r = recruiterStaffReportSchema.safeParse({
      staffEmail: "test@example.com",
      staffName: "Test Staff",
      totalAssigned: 5,
      totalRequests: 3,
      totalNotes: 10,
      totalStories: 2,
      totalAcceptedInvitations: 1,
      totalRejectedInvitations: 0,
      totalSuggestions: 4,
      totalInvitations: 7,
      totalCompletedStories: 1,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing staffEmail", () => {
    const r = recruiterStaffReportSchema.safeParse({ staffName: "Test" });
    expect(r.success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(recruiterStaffReportSchema.safeParse({
      staffEmail: "a@b.com", staffName: "T",
      totalAssigned: -1, totalRequests: 0, totalNotes: 0, totalStories: 0,
      totalAcceptedInvitations: 0, totalRejectedInvitations: 0, totalSuggestions: 0,
      totalInvitations: 0, totalCompletedStories: 0,
    }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: getRecruiterReportResultSchema
// ---------------------------------------------------------------------------
describe("getRecruiterReportResultSchema (output)", () => {
  const validRow = {
    staffEmail: "a@b.com", staffName: "T",
    totalAssigned: 1, totalRequests: 0, totalNotes: 0, totalStories: 0,
    totalAcceptedInvitations: 0, totalRejectedInvitations: 0, totalSuggestions: 0,
    totalInvitations: 0, totalCompletedStories: 0,
  };

  it("accepts a valid result", () => {
    const r = getRecruiterReportResultSchema.safeParse({ date: "2026-06-01", reports: [validRow], total: 1 });
    expect(r.success).toBe(true);
  });

  it("rejects missing date", () => {
    expect(getRecruiterReportResultSchema.safeParse({ reports: [], total: 0 }).success).toBe(false);
  });

  it("accepts empty reports", () => {
    const r = getRecruiterReportResultSchema.safeParse({ date: "2026-06-01", reports: [], total: 0 });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output schema: singleReportSchema
// ---------------------------------------------------------------------------
describe("singleReportSchema (output)", () => {
  it("accepts a report with recruiter data", () => {
    const r = singleReportSchema.safeParse({
      id: "2026-06-10-recruiter-daily",
      type: "recruiter-daily",
      label: "Daily Recruiter Report",
      data: {
        date: "2026-06-10",
        reports: [],
        total: 0,
      },
      generatedAt: "2026-06-10T12:00:00Z",
    });
    expect(r.success).toBe(true);
  });

  it("accepts a report with generic data", () => {
    const r = singleReportSchema.safeParse({
      id: "custom-report",
      type: "custom",
      label: "Custom",
      data: { someKey: "someValue" },
      generatedAt: "2026-06-10T12:00:00Z",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    expect(singleReportSchema.safeParse({ type: "test", label: "Test", data: {}, generatedAt: "now" }).success).toBe(false);
  });
});
