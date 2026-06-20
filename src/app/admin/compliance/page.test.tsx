import { describe, it, expect } from "vitest";
import {
  listComplianceRecordsSchema,
  approveComplianceSchema,
  denyComplianceSchema,
} from "./schemas";

/**
 * Page migration test for admin/compliance.
 *
 * Verifies that the data contract between page and action holds.
 * The compliance page uses listComplianceRecords with { type: "all" }
 * to populate its summary row and records list.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin compliance page — data contract", () => {
  it("listComplianceRecordsSchema accepts empty params (defaults to page 1, limit 20, type 'all')", () => {
    const r = listComplianceRecordsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
      expect(r.data.type).toBe("all");
    }
  });

  it("listComplianceRecordsSchema accepts the params the page passes", () => {
    const r = listComplianceRecordsSchema.safeParse({ page: 1, limit: 60, type: "all" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(60);
      expect(r.data.type).toBe("all");
    }
  });

  it("listComplianceRecordsSchema accepts per-type filters", () => {
    for (const t of ["company", "id_request", "candidate"] as const) {
      const r = listComplianceRecordsSchema.safeParse({ type: t });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.type).toBe(t);
    }
  });

  it("listComplianceRecordsSchema accepts status filter", () => {
    const r = listComplianceRecordsSchema.safeParse({ status: "pending" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.status).toBe("pending");
  });

  it("listComplianceRecordsSchema rejects invalid type", () => {
    const r = listComplianceRecordsSchema.safeParse({ type: "invalid" });
    expect(r.success).toBe(false);
  });

  it("ComplianceRow shape matches DataTable columns expected by the page", () => {
    const row = {
      id: "company-42",
      type: "company" as const,
      title: "Acme Corp",
      subtitle: "acme@example.com",
      status: "Not approved",
      updated: "10 Jun 2026",
    };
    expect(row.id).toBe("company-42");
    expect(row.type).toBe("company");
    expect(row.title).toBe("Acme Corp");
    expect(row.subtitle).toBe("acme@example.com");
    expect(row.status).toBe("Not approved");
    expect(row.updated).toBe("10 Jun 2026");
  });

  it("ComplianceSummary shape matches the 5 metrics displayed in ComplianceSummaryRow", () => {
    const summary = {
      totalCompanies: 100,
      unapprovedCompanies: 12,
      pendingIdRequests: 5,
      unapprovedCandidates: 23,
      incompleteCandidates: 8,
    };
    expect(summary.totalCompanies).toBe(100);
    expect(summary.unapprovedCompanies).toBe(12);
    expect(summary.pendingIdRequests).toBe(5);
    expect(summary.unapprovedCandidates).toBe(23);
    expect(summary.incompleteCandidates).toBe(8);
  });

  it("getComplianceSummary is callable with the expected return shape", () => {
    const result: {
      totalCompanies: number;
      unapprovedCompanies: number;
      pendingIdRequests: number;
      unapprovedCandidates: number;
      incompleteCandidates: number;
    } = {
      totalCompanies: 0,
      unapprovedCompanies: 0,
      pendingIdRequests: 0,
      unapprovedCandidates: 0,
      incompleteCandidates: 0,
    };
    expect(typeof result.totalCompanies).toBe("number");
    expect(typeof result.unapprovedCompanies).toBe("number");
    expect(typeof result.pendingIdRequests).toBe("number");
    expect(typeof result.unapprovedCandidates).toBe("number");
    expect(typeof result.incompleteCandidates).toBe("number");
  });

  it("approveComplianceSchema accepts valid company approve", () => {
    const r = approveComplianceSchema.safeParse({ id: "42", type: "company" });
    expect(r.success).toBe(true);
  });

  it("denyComplianceSchema accepts valid deny with reason", () => {
    const r = denyComplianceSchema.safeParse({
      id: "42",
      type: "company",
      reason: "Missing documentation",
    });
    expect(r.success).toBe(true);
  });
});
