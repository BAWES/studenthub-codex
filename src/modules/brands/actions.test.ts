import { describe, it, expect } from "vitest";
import {
  listBrandsSchema,
  getBrandSchema,
  type BrandListItem,
  type ListBrandsResult,
} from "./actions";

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
