import { describe, it, expect } from "vitest";
import {
  listAdminCompaniesSchema,
  getAdminCompanySchema,
} from "./schemas";

describe("listAdminCompaniesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listAdminCompaniesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(60);
      expect(r.data.status).toBe("all");
    }
  });

  it("accepts search query with custom pagination", () => {
    const r = listAdminCompaniesSchema.safeParse({
      q: "Tech",
      page: 2,
      limit: 25,
      status: "approved",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("Tech");
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(25);
      expect(r.data.status).toBe("approved");
    }
  });

  it("rejects limit over 100", () => {
    expect(listAdminCompaniesSchema.safeParse({ limit: 999 }).success).toBe(
      false,
    );
  });

  it("rejects invalid status values", () => {
    expect(
      listAdminCompaniesSchema.safeParse({ status: "invalid" }).success,
    ).toBe(false);
  });

  it("rejects negative page number", () => {
    expect(listAdminCompaniesSchema.safeParse({ page: -1 }).success).toBe(
      false,
    );
  });

  it("accepts not_approved status filter", () => {
    const r = listAdminCompaniesSchema.safeParse({ status: "not_approved" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe("not_approved");
    }
  });
});

describe("getAdminCompanySchema", () => {
  it("accepts a valid company ID", () => {
    const r = getAdminCompanySchema.safeParse({ companyId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyId).toBe(42);
    }
  });

  it("coerces string company ID to number", () => {
    const r = getAdminCompanySchema.safeParse({ companyId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyId).toBe(42);
    }
  });

  it("rejects negative company ID", () => {
    expect(getAdminCompanySchema.safeParse({ companyId: -1 }).success).toBe(
      false,
    );
  });

  it("rejects zero company ID", () => {
    expect(getAdminCompanySchema.safeParse({ companyId: 0 }).success).toBe(
      false,
    );
  });

  it("rejects missing companyId", () => {
    expect(getAdminCompanySchema.safeParse({}).success).toBe(false);
  });
});
