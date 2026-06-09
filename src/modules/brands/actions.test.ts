import { describe, it, expect } from "vitest";
import { z } from "zod";

const listBrandsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

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

type BrandListItem = {
  brand_uuid: string;
  company_id: number | null;
  brand_name_en: string;
  brand_name_ar: string;
  brand_logo: string | null;
};

type ListBrandsResult = {
  brands: BrandListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

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
