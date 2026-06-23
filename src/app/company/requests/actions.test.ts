import { describe, it, expect } from "vitest";
import {
  listCompanyRequestsSchema,
  getCompanyRequestDetailSchema,
  createCompanyRequestSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests (pure unit tests — no DB required)
// ---------------------------------------------------------------------------

describe("listCompanyRequestsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    expect(listCompanyRequestsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts pagination params", () => {
    const r = listCompanyRequestsSchema.safeParse({ page: 2, limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    expect(listCompanyRequestsSchema.safeParse({ limit: 999 }).success).toBe(
      false,
    );
  });

  it("rejects negative page", () => {
    expect(listCompanyRequestsSchema.safeParse({ page: -1 }).success).toBe(
      false,
    );
  });

  it("accepts optional company_id filter", () => {
    const r = listCompanyRequestsSchema.safeParse({ company_id: 5 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company_id).toBe(5);
    }
  });

  it("rejects zero company_id", () => {
    expect(listCompanyRequestsSchema.safeParse({ company_id: 0 }).success).toBe(
      false,
    );
  });
});

describe("getCompanyRequestDetailSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      getCompanyRequestDetailSchema.safeParse({ uuid: "abc-123-def" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(
      getCompanyRequestDetailSchema.safeParse({ uuid: "" }).success,
    ).toBe(false);
  });
});

describe("createCompanyRequestSchema", () => {
  it("accepts valid request data", () => {
    const r = createCompanyRequestSchema.safeParse({
      company_id: 1,
      position_title: "Software Engineer",
      compensation: "1500 KWD",
      number_of_employees: 2,
      location: "Kuwait City",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company_id).toBe(1);
      expect(r.data.position_title).toBe("Software Engineer");
      expect(r.data.number_of_employees).toBe(2);
    }
  });

  it("accepts minimal data (company + title only)", () => {
    const r = createCompanyRequestSchema.safeParse({
      company_id: 1,
      position_title: "Junior Developer",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.compensation).toBeUndefined();
      expect(r.data.number_of_employees).toBeUndefined();
    }
  });

  it("rejects empty title", () => {
    expect(
      createCompanyRequestSchema.safeParse({
        company_id: 1,
        position_title: "",
      }).success,
    ).toBe(false);
  });

  it("rejects missing company_id", () => {
    expect(
      createCompanyRequestSchema.safeParse({
        position_title: "Engineer",
      }).success,
    ).toBe(false);
  });

  it("rejects zero employees", () => {
    expect(
      createCompanyRequestSchema.safeParse({
        company_id: 1,
        position_title: "Engineer",
        number_of_employees: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects too many employees", () => {
    expect(
      createCompanyRequestSchema.safeParse({
        company_id: 1,
        position_title: "Engineer",
        number_of_employees: 1001,
      }).success,
    ).toBe(false);
  });
});
