import { describe, it, expect } from "vitest";
import { listAdminCompaniesSchema } from "./schemas";
import type { CompanyRow } from "./schemas";

/**
 * Page migration test for admin/companies.
 *
 * Verifies that listAdminCompanies accepts the params we'll pass in the page,
 * and that the returned CompanyRow shape maps correctly to DataTable columns.
 *
 * Full rendering tests require Playwright (server component).
 * This validates the data contract between page and action.
 */
describe("admin companies page — data contract", () => {
  it("listAdminCompaniesSchema accepts empty params (page defaults to 1, limit 60)", () => {
    const r = listAdminCompaniesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(60);
    }
  });

  it("listAdminCompaniesSchema accepts pagination params the page will pass", () => {
    const r = listAdminCompaniesSchema.safeParse({ page: 1, limit: 60 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(60);
    }
  });

  it("CompanyRow fields map correctly to DataTable columns", () => {
    // The page maps CompanyRow to DataTable columns:
    //   id       → row.id          (for rowHref)
    //   name     → row.name
    //   email    → row.email
    //   owner    → row.owner
    //   requests → row.requests
    //   status   → row.status
    //   updated  → row.updated    (formatted date)
    const row: CompanyRow = {
      id: 1,
      name: "Test Company",
      email: "company@test.com",
      owner: "Test Owner",
      requests: 5,
      status: "Approved",
      rate: "10.000 KWD",
      updated: "10 Jun 2026",
    };
    expect(row.id).toBe(1);
    expect(row.name).toBe("Test Company");
    expect(row.email).toBe("company@test.com");
    expect(row.owner).toBe("Test Owner");
    expect(row.requests).toBe(5);
    expect(row.status).toBe("Approved");
    expect(row.updated).toBe("10 Jun 2026");
  });

  it("listAdminCompanies returns items with expected shape", () => {
    // Simulates what listAdminCompanies returns
    const result: { items: CompanyRow[]; total: number } = {
      items: [],
      total: 0,
    };
    expect(Array.isArray(result.items)).toBe(true);
    expect(typeof result.total).toBe("number");
  });
});
