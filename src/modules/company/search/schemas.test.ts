import { describe, it, expect } from "vitest";
import {
  searchCompanyEntitiesSchema,
  companySearchRowSchema,
  companySearchResultSchema,
} from "./schemas";

describe("searchCompanyEntitiesSchema", () => {
  it("accepts empty input (all fields optional)", () => {
    expect(searchCompanyEntitiesSchema.safeParse({}).success).toBe(true);
  });

  it("accepts valid input with all fields", () => {
    expect(
      searchCompanyEntitiesSchema.safeParse({
        query: "Acme",
        page: 1,
        type: "companies",
      }).success,
    ).toBe(true);
  });

  it("accepts type stores", () => {
    expect(
      searchCompanyEntitiesSchema.safeParse({ type: "stores" }).success,
    ).toBe(true);
  });

  it("accepts type contacts", () => {
    expect(
      searchCompanyEntitiesSchema.safeParse({ type: "contacts" }).success,
    ).toBe(true);
  });

  it("rejects invalid type enum", () => {
    expect(
      searchCompanyEntitiesSchema.safeParse({ type: "invalid" }).success,
    ).toBe(false);
  });

  it("rejects non-positive page", () => {
    expect(
      searchCompanyEntitiesSchema.safeParse({ page: 0 }).success,
    ).toBe(false);
  });

  it("rejects negative page", () => {
    expect(
      searchCompanyEntitiesSchema.safeParse({ page: -1 }).success,
    ).toBe(false);
  });
});

describe("companySearchRowSchema", () => {
  it("accepts valid company row", () => {
    expect(
      companySearchRowSchema.safeParse({
        id: 1,
        name: "Acme Corp",
        email: "acme@example.com",
        status: "Approved",
        type: "company",
        subtitle: "Kuwait",
        meta: "5.000 KWD",
        href: "/company/companies/1",
      }).success,
    ).toBe(true);
  });

  it("accepts valid store row", () => {
    expect(
      companySearchRowSchema.safeParse({
        id: 10,
        name: "Main Store",
        email: "",
        status: "Active",
        type: "store",
        subtitle: "Acme Corp · Salmiya",
        meta: "John Manager",
        href: "/company/stores/10",
      }).success,
    ).toBe(true);
  });

  it("accepts valid contact row", () => {
    expect(
      companySearchRowSchema.safeParse({
        id: 0,
        name: "Ahmed",
        email: "ahmed@example.com",
        status: "",
        type: "contact",
        subtitle: "Acme Corp",
        meta: "ahmed@example.com",
        href: "/company/contacts",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid type", () => {
    expect(
      companySearchRowSchema.safeParse({
        id: 1,
        name: "Acme",
        email: "a@b.com",
        status: "Active",
        type: "invalid",
        subtitle: "",
        meta: "",
        href: "/test",
      }).success,
    ).toBe(false);
  });

  it("rejects non-integer id", () => {
    expect(
      companySearchRowSchema.safeParse({
        id: 1.5,
        name: "Acme",
        email: "a@b.com",
        status: "",
        type: "company",
        subtitle: "",
        meta: "",
        href: "/test",
      }).success,
    ).toBe(false);
  });

  it("rejects missing name", () => {
    expect(
      companySearchRowSchema.safeParse({
        id: 1,
        email: "a@b.com",
        status: "",
        type: "company",
        subtitle: "",
        meta: "",
        href: "/test",
      }).success,
    ).toBe(false);
  });
});

describe("companySearchResultSchema", () => {
  const validResult = {
    query: "Acme",
    page: 1,
    matchingCount: 42,
    rows: [],
    facets: [
      {
        key: "type",
        label: "Type",
        options: [
          { label: "All", value: "all", count: 42, active: false },
        ],
      },
    ],
  };

  it("accepts valid result", () => {
    expect(companySearchResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts result with rows", () => {
    expect(
      companySearchResultSchema.safeParse({
        ...validResult,
        rows: [
          {
            id: 1,
            name: "Acme",
            email: "a@b.com",
            status: "Active",
            type: "company",
            subtitle: "Kuwait",
            meta: "5 KWD",
            href: "/company/companies/1",
          },
        ],
      }).success,
    ).toBe(true);
  });

  it("rejects missing query", () => {
    const { query, ...rest } = validResult;
    expect(companySearchResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer page", () => {
    expect(
      companySearchResultSchema.safeParse({ ...validResult, page: 1.5 })
        .success,
    ).toBe(false);
  });

  it("rejects non-integer matchingCount", () => {
    expect(
      companySearchResultSchema.safeParse({
        ...validResult,
        matchingCount: 42.5,
      }).success,
    ).toBe(false);
  });

  it("rejects non-array rows", () => {
    expect(
      companySearchResultSchema.safeParse({ ...validResult, rows: "not-array" })
        .success,
    ).toBe(false);
  });

  it("rejects non-array facets", () => {
    expect(
      companySearchResultSchema.safeParse({
        ...validResult,
        facets: "not-array",
      }).success,
    ).toBe(false);
  });
});
