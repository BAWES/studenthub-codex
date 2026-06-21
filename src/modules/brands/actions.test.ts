import { describe, it, expect } from "vitest";
import {
  listBrandsSchema,
  getBrandSchema,
  brandItemSchema,
  brandDetailSchema,
  listBrandsResultSchema,
  type BrandListItem,
  type ListBrandsResult,
} from "./schemas";

describe("listBrandsSchema", () => {
  it("accepts empty params", () => {
    expect(listBrandsSchema.safeParse({}).success).toBe(true);
  });
  it("accepts pagination params", () => {
    const r = listBrandsSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });
  it("rejects limit over 100", () => {
    expect(listBrandsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });
  it("rejects negative page", () => {
    expect(listBrandsSchema.safeParse({ page: -1 }).success).toBe(false);
  });
});

describe("getBrandSchema", () => {
  it("accepts a valid UUID", () => {
    expect(getBrandSchema.safeParse({ uuid: "brand_abc123" }).success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getBrandSchema.safeParse({ uuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getBrandSchema.safeParse({}).success).toBe(false);
  });
});

describe("BrandListItem shape", () => {
  it("defines expected fields", () => {
    const mock: BrandListItem = {
      brand_uuid: "brand_abc123",
      company_id: 1,
      brand_name_en: "Nike",
      brand_name_ar: "نايك",
      brand_logo: "https://example.com/logo.png",
    };
    expect(mock.brand_uuid).toBe("brand_abc123");
  });
});

describe("ListBrandsResult shape", () => {
  it("accepts empty result", () => {
    const r: ListBrandsResult = { brands: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    expect(r.total).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: brandItemSchema
// ---------------------------------------------------------------------------

const validBrandItem = {
  brand_uuid: "brand_abc123",
  company_id: 1,
  brand_name_en: "Nike",
  brand_name_ar: "نايك",
  brand_logo: "https://example.com/logo.png",
};

describe("brandItemSchema", () => {
  it("accepts a valid brand item", () => {
    const result = brandItemSchema.parse(validBrandItem);
    expect(result.brand_uuid).toBe("brand_abc123");
  });

  it("accepts nullable fields as null", () => {
    const result = brandItemSchema.parse({
      ...validBrandItem,
      company_id: null,
      brand_logo: null,
    });
    expect(result.company_id).toBeNull();
    expect(result.brand_logo).toBeNull();
  });

  it("rejects missing required string field", () => {
    const { brand_name_en, ...rest } = validBrandItem;
    expect(() => brandItemSchema.parse(rest)).toThrow();
  });

  it("rejects wrong type for numeric field", () => {
    expect(() =>
      brandItemSchema.parse({ ...validBrandItem, company_id: "not-a-number" }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: brandDetailSchema
// ---------------------------------------------------------------------------

describe("brandDetailSchema", () => {
  it("accepts a valid brand item", () => {
    const result = brandDetailSchema.parse(validBrandItem);
    expect(result).not.toBeNull();
  });

  it("accepts null", () => {
    const result = brandDetailSchema.parse(null);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: listBrandsResultSchema
// ---------------------------------------------------------------------------

describe("listBrandsResultSchema", () => {
  it("accepts a valid result with brands", () => {
    const result = listBrandsResultSchema.parse({
      brands: [validBrandItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.brands.length).toBe(1);
  });

  it("accepts an empty list", () => {
    const result = listBrandsResultSchema.parse({
      brands: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.brands.length).toBe(0);
  });

  it("rejects negative page", () => {
    expect(() =>
      listBrandsResultSchema.parse({
        brands: [],
        total: 0,
        page: -1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });
});
