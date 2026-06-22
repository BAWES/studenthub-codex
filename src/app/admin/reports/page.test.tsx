import { describe, it, expect } from "vitest";
import {
  listReportsSchema,
  getReportSchema,
  generateReportSchema,
  reportTypeItemSchema,
  listReportsResultSchema,
  generateReportResultSchema,
} from "./schemas";

/**
 * Page migration test for admin/reports.
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin reports page — data contract", () => {
  it("listReportsSchema parses with defaults", () => {
    const r = listReportsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listReportsSchema accepts type filter", () => {
    const r = listReportsSchema.safeParse({ type: "recruiter-daily" });
    expect(r.success).toBe(true);
  });

  it("getReportSchema validates with id and type", () => {
    const r = getReportSchema.safeParse({
      id: "rpt-001",
      type: "recruiter-daily",
    });
    expect(r.success).toBe(true);
  });

  it("getReportSchema rejects missing id", () => {
    const r = getReportSchema.safeParse({ type: "recruiter-daily" });
    expect(r.success).toBe(false);
  });

  it("getReportSchema rejects missing type", () => {
    const r = getReportSchema.safeParse({ id: "rpt-001" });
    expect(r.success).toBe(false);
  });

  it("generateReportSchema validates with type", () => {
    const r = generateReportSchema.safeParse({ type: "candidates" });
    expect(r.success).toBe(true);
  });

  it("generateReportSchema accepts optional fields", () => {
    const r = generateReportSchema.safeParse({
      type: "recruiter-daily",
      date: "2026-06-14",
      staffEmail: "recruiter@example.com",
    });
    expect(r.success).toBe(true);
  });

  it("reportTypeItemSchema validates a report type entry", () => {
    const r = reportTypeItemSchema.safeParse({
      type: "candidates",
      label: "Candidates Report",
      description: "List of all registered candidates",
    });
    expect(r.success).toBe(true);
  });

  it("reportTypeItemSchema rejects missing description", () => {
    const r = reportTypeItemSchema.safeParse({
      type: "candidates",
      label: "Candidates Report",
    });
    expect(r.success).toBe(false);
  });

  it("listReportsResultSchema validates paginated result", () => {
    const r = listReportsResultSchema.safeParse({
      reports: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("generateReportResultSchema validates operation result", () => {
    const r = generateReportResultSchema.safeParse({
      operation: "success",
      message: "Report generated",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.operation).toBe("success");
    }
  });
});
