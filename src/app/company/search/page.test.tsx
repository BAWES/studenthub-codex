import { describe, it, expect } from "vitest";
import {
  searchCompanyEntitiesSchema,
  companySearchRowSchema,
  companySearchResultSchema,
  type CompanySearchResult,
} from "./schemas";

/**
 * Page data-contract test for company/search.
 *
 * Verifies the schema contracts used by the company search page.
 * The search page (page.tsx) calls searchCompanyEntities with
 * searchCompanyEntitiesSchema and receives CompanySearchResult
 * validated against companySearchResultSchema.
 *
 * The client component (CompanySearchPage.tsx) consumes the typed
 * response to render search results, facets, and pagination.
 *
 * Full rendering tests require Playwright (server component).
 */

describe("company search page — data contract", () => {
  // -----------------------------------------------------------------------
  // Input schema — passed to searchCompanyEntities server action
  // -----------------------------------------------------------------------

  describe("searchCompanyEntitiesSchema", () => {
    it("parses with defaults (empty params)", () => {
      const r = searchCompanyEntitiesSchema.safeParse({});
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.page).toBeUndefined();
        expect(r.data.query).toBeUndefined();
        expect(r.data.type).toBeUndefined();
      }
    });

    it("accepts query string", () => {
      const r = searchCompanyEntitiesSchema.safeParse({ query: "Acme" });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.query).toBe("Acme");
      }
    });

    it("accepts page number", () => {
      const r = searchCompanyEntitiesSchema.safeParse({ page: 3 });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.page).toBe(3);
      }
    });

    it("accepts type filter", () => {
      const r = searchCompanyEntitiesSchema.safeParse({ type: "stores" });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.type).toBe("stores");
      }
    });

    it("accepts all type enum values", () => {
      for (const t of ["all", "companies", "stores", "contacts"] as const) {
        const r = searchCompanyEntitiesSchema.safeParse({ type: t });
        expect(r.success).toBe(true);
      }
    });

    it("rejects invalid type value", () => {
      const r = searchCompanyEntitiesSchema.safeParse({ type: "invalid" });
      expect(r.success).toBe(false);
    });

    it("rejects non-positive page", () => {
      const r = searchCompanyEntitiesSchema.safeParse({ page: 0 });
      expect(r.success).toBe(false);
    });

    it("rejects negative page", () => {
      const r = searchCompanyEntitiesSchema.safeParse({ page: -5 });
      expect(r.success).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Output row schema — each search result row
  // -----------------------------------------------------------------------

  describe("companySearchRowSchema", () => {
    it("validates a company row", () => {
      const r = companySearchRowSchema.safeParse({
        id: 1,
        name: "Acme Corp",
        email: "acme@example.com",
        status: "Approved",
        type: "company",
        subtitle: "Kuwait",
        meta: "5.000 KWD",
        href: "/company/companies/1",
      });
      expect(r.success).toBe(true);
    });

    it("validates a store row", () => {
      const r = companySearchRowSchema.safeParse({
        id: 10,
        name: "Main Store",
        email: "",
        status: "Active",
        type: "store",
        subtitle: "Acme Corp • Salmiya",
        meta: "John Manager",
        href: "/company/stores/10",
      });
      expect(r.success).toBe(true);
    });

    it("validates a contact row", () => {
      const r = companySearchRowSchema.safeParse({
        id: 0,
        name: "Ahmed",
        email: "ahmed@example.com",
        status: "",
        type: "contact",
        subtitle: "Acme Corp",
        meta: "ahmed@example.com",
        href: "/company/contacts",
      });
      expect(r.success).toBe(true);
    });

    it("rejects invalid type enum", () => {
      const r = companySearchRowSchema.safeParse({
        id: 1,
        name: "Test",
        email: "t@t.com",
        status: "",
        type: "invalid",
        subtitle: "",
        meta: "",
        href: "/test",
      });
      expect(r.success).toBe(false);
    });

    it("rejects non-integer id", () => {
      const r = companySearchRowSchema.safeParse({
        id: 1.5,
        name: "Test",
        email: "t@t.com",
        status: "",
        type: "company",
        subtitle: "",
        meta: "",
        href: "/test",
      });
      expect(r.success).toBe(false);
    });

    it("rejects missing required name", () => {
      const r = companySearchRowSchema.safeParse({
        id: 1,
        email: "t@t.com",
        status: "",
        type: "company",
        subtitle: "",
        meta: "",
        href: "/test",
      });
      expect(r.success).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Output result schema — full search response
  // -----------------------------------------------------------------------

  describe("companySearchResultSchema", () => {
    const validResult = {
      query: "Acme",
      page: 1,
      matchingCount: 42,
      rows: [
        {
          id: 1,
          name: "Acme Corp",
          email: "acme@example.com",
          status: "Approved",
          type: "company",
          subtitle: "Kuwait",
          meta: "5.000 KWD",
          href: "/company/companies/1",
        },
      ],
      facets: [
        {
          key: "type",
          label: "Type",
          options: [
            { label: "All", value: "all", count: 42, active: false },
            { label: "Companies", value: "companies", count: 1, active: false },
          ],
        },
      ],
    };

    it("validates a complete search result", () => {
      const r = companySearchResultSchema.safeParse(validResult);
      expect(r.success).toBe(true);
      if (r.success) {
        expect((r.data as CompanySearchResult).rows).toHaveLength(1);
        expect((r.data as CompanySearchResult).facets).toHaveLength(1);
      }
    });

    it("validates empty result", () => {
      const r = companySearchResultSchema.safeParse({
        query: "",
        page: 1,
        matchingCount: 0,
        rows: [],
        facets: [],
      });
      expect(r.success).toBe(true);
    });

    it("rejects missing query", () => {
      const { query, ...rest } = validResult;
      const r = companySearchResultSchema.safeParse(rest);
      expect(r.success).toBe(false);
    });

    it("rejects non-integer matchingCount", () => {
      const r = companySearchResultSchema.safeParse({
        ...validResult,
        matchingCount: 42.5,
      });
      expect(r.success).toBe(false);
    });

    it("rejects non-array rows", () => {
      const r = companySearchResultSchema.safeParse({
        ...validResult,
        rows: "not-an-array",
      });
      expect(r.success).toBe(false);
    });

    it("rejects non-array facets", () => {
      const r = companySearchResultSchema.safeParse({
        ...validResult,
        facets: "not-an-array",
      });
      expect(r.success).toBe(false);
    });
  });
});
