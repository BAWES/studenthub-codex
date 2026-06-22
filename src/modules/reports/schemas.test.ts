import { describe, it, expect } from "vitest";
import {
  reportTypeItemSchema,
  recruiterStaffReportSchema,
  listReportsResultSchema,
  getRecruiterReportResultSchema,
} from "./schemas";

describe("reportTypeItemSchema", () => {
  const valid = { type: "recruiter", label: "Recruiter Report", description: "Shows recruiter activity" };
  it("accepts a valid report type", () => expect(reportTypeItemSchema.safeParse(valid).success).toBe(true));
  it("rejects missing type", () => {
    const { type: _, ...rest } = valid;
    expect(reportTypeItemSchema.safeParse(rest).success).toBe(false);
  });
  it("rejects non-string label", () => {
    expect(reportTypeItemSchema.safeParse({ ...valid, label: 123 }).success).toBe(false);
  });
});

describe("recruiterStaffReportSchema", () => {
  const valid = {
    staffEmail: "recruiter@example.com", staffName: "John Doe",
    totalAssigned: 10, totalRequests: 5, totalNotes: 20, totalStories: 3,
    totalAcceptedInvitations: 8, totalRejectedInvitations: 2,
    totalSuggestions: 4, totalInvitations: 10, totalCompletedStories: 2,
  };
  it("accepts a valid staff report", () => expect(recruiterStaffReportSchema.safeParse(valid).success).toBe(true));
  it("rejects negative totalAssigned", () => {
    expect(recruiterStaffReportSchema.safeParse({ ...valid, totalAssigned: -1 }).success).toBe(false);
  });
  it("rejects missing staffEmail", () => {
    const { staffEmail: _, ...rest } = valid;
    expect(recruiterStaffReportSchema.safeParse(rest).success).toBe(false);
  });
});

describe("listReportsResultSchema", () => {
  const valid = { reports: [{ type: "r", label: "R", description: "D" }], total: 1 };
  it("accepts a valid result", () => expect(listReportsResultSchema.safeParse(valid).success).toBe(true));
  it("accepts empty reports", () => expect(listReportsResultSchema.safeParse({ ...valid, reports: [] }).success).toBe(true));
  it("rejects missing reports", () => {
    const { reports: _, ...rest } = valid;
    expect(listReportsResultSchema.safeParse(rest).success).toBe(false);
  });
});

describe("getRecruiterReportResultSchema", () => {
  const valid = {
    date: "2026-06-14",
    reports: [{
      staffEmail: "r@ex.com", staffName: "John", totalAssigned: 0,
      totalRequests: 0, totalNotes: 0, totalStories: 0,
      totalAcceptedInvitations: 0, totalRejectedInvitations: 0,
      totalSuggestions: 0, totalInvitations: 0, totalCompletedStories: 0,
    }],
    total: 1,
  };
  it("accepts a valid report", () => expect(getRecruiterReportResultSchema.safeParse(valid).success).toBe(true));
  it("accepts empty reports", () => expect(getRecruiterReportResultSchema.safeParse({ ...valid, reports: [] }).success).toBe(true));
  it("rejects missing date", () => {
    const { date: _, ...rest } = valid;
    expect(getRecruiterReportResultSchema.safeParse(rest).success).toBe(false);
  });
});
