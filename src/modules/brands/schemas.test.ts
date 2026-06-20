import { describe, it, expect } from "vitest";
import {
  listBrandsSchema,
  getBrandSchema,
  brandItemSchema,
  brandDetailSchema,
  listBrandsResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validBrandItem = () => ({
  brand_uuid: "b3f2a1c4-8d7e-4f6b-9a0c-5e1d2f3a4b5c",
  company_id: 42,
  brand_name_en: "Nike",
  brand_name_ar: "نايك",
  brand_logo: "https://example.com/logo.png",
});

const validBrandItemNoLogo = () => ({
  brand_uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  company_id: null,
  brand_name_en: "Adidas",
  brand_name_ar: "أديداس",
  brand_logo: null,
});

// ---------------------------------------------------------------------------
// Input: listBrandsSchema
// ---------------------------------------------------------------------------

describe("listBrandsSchema (input)", () => {
  it("accepts empty params", () => {
    const r = listBrandsSchema.safeParse({});
    expect(r.success).toBe(true);
    expect(r.data).toEqual({});
  });

  it("accepts valid page and limit", () => {
    const r = listBrandsSchema.safeParse({ page: 2, limit: 50 });
    expect(r.success).toBe(true);
  });

  it("rejects negative page", () => {
    const r = listBrandsSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const r = listBrandsSchema.safeParse({ limit: 101 });
    expect(r.success).toBe(false);
  });

  it("rejects limit below 1", () => {
    const r = listBrandsSchema.safeParse({ limit: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const r = listBrandsSchema.safeParse({ page: 1.5 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input: getBrandSchema
// ---------------------------------------------------------------------------

describe("getBrandSchema (input)", () => {
  it("accepts a valid UUID", () => {
    const r = getBrandSchema.safeParse({ uuid: "abc-123" });
    expect(r.success).toBe(true);
  });

  it("rejects empty uuid", () => {
    const r = getBrandSchema.safeParse({ uuid: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing uuid", () => {
    const r = getBrandSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// brandItemSchema (output)
// ---------------------------------------------------------------------------

describe("brandItemSchema", () => {
  it("accepts a full brand item with logo", () => {
    const r = brandItemSchema.safeParse(validBrandItem());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal brand item (nullable fields set to null)", () => {
    const r = brandItemSchema.safeParse(validBrandItemNoLogo());
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = brandItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const r = brandItemSchema.safeParse({
      ...validBrandItem(),
      brand_uuid: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing brand_name_en", () => {
    const r = brandItemSchema.safeParse({
      ...validBrandItem(),
      brand_name_en: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing brand_name_ar", () => {
    const r = brandItemSchema.safeParse({
      ...validBrandItem(),
      brand_name_ar: undefined,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// brandDetailSchema (output)
// ---------------------------------------------------------------------------

describe("brandDetailSchema", () => {
  it("accepts a valid brand item (non-null)", () => {
    const r = brandDetailSchema.safeParse(validBrandItem());
    expect(r.success).toBe(true);
  });

  it("accepts null (brand not found)", () => {
    const r = brandDetailSchema.safeParse(null);
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// listBrandsResultSchema (output)
// ---------------------------------------------------------------------------

describe("listBrandsResultSchema", () => {
  it("accepts a full paginated result", () => {
    const r = listBrandsResultSchema.safeParse({
      brands: [validBrandItem(), validBrandItemNoLogo()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty brands array", () => {
    const r = listBrandsResultSchema.safeParse({
      brands: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listBrandsResultSchema.safeParse({
      brands: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listBrandsResultSchema.safeParse({
      brands: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const r = listBrandsResultSchema.safeParse({ brands: [] });
    expect(r.success).toBe(false);
  });

  it("rejects non-array brands", () => {
    const r = listBrandsResultSchema.safeParse({
      brands: "not-an-array",
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});
