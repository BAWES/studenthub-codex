import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: region list / get schema validation
// ---------------------------------------------------------------------------

const listRegionsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  countryId: z.number().int().positive().optional(),
  search: z.string().optional(),
});

const getRegionSchema = z.object({
  areaUuid: z.string().min(1, "Area UUID is required"),
});

describe("listRegionsSchema", () => {
  it("accepts empty params", () => {
    const result = listRegionsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listRegionsSchema.safeParse({ page: 1, limit: 20 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts countryId filter", () => {
    const result = listRegionsSchema.safeParse({ countryId: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.countryId).toBe(1);
    }
  });

  it("accepts search filter", () => {
    const result = listRegionsSchema.safeParse({ search: "Kuwait" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("Kuwait");
    }
  });

  it("rejects limit over 100", () => {
    const result = listRegionsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });
});

describe("getRegionSchema", () => {
  it("accepts a valid UUID", () => {
    const result = getRegionSchema.safeParse({ areaUuid: "abc-123-def" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getRegionSchema.safeParse({ areaUuid: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Return type shapes
// ---------------------------------------------------------------------------

type RegionListItem = {
  area_uuid: string;
  country_id: number;
  area_name_en: string;
  area_name_ar: string;
  area_latitude: number | null;
  area_longitude: number | null;
};

type ListRegionsResult = {
  regions: RegionListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type RegionDetail = RegionListItem & {
  area_created_at: Date | null;
  area_updated_at: Date | null;
};

type GetRegionResult = {
  region: RegionDetail;
};

describe("RegionListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: RegionListItem = {
      area_uuid: "abc-123",
      country_id: 1,
      area_name_en: "Kuwait City",
      area_name_ar: "مدينة الكويت",
      area_latitude: 29.3759,
      area_longitude: 47.9774,
    };
    expect(mock.area_uuid).toBe("abc-123");
    expect(mock.country_id).toBe(1);
    expect(mock.area_name_en).toBe("Kuwait City");
    expect(mock.area_name_ar).toBe("مدينة الكويت");
  });
});

describe("ListRegionsResult shape", () => {
  it("accepts a valid result set", () => {
    const result: ListRegionsResult = {
      regions: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.regions).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Pure function: build region filter
// ---------------------------------------------------------------------------

type RegionWhereInput = {
  country_id?: number;
  OR?: Array<{ area_name_en?: { contains: string }; area_name_ar?: { contains: string } }>;
};

function buildRegionListFilter(countryId?: number, search?: string): RegionWhereInput {
  const where: RegionWhereInput = {};
  if (countryId !== undefined) where.country_id = countryId;
  if (search) {
    where.OR = [
      { area_name_en: { contains: search } },
      { area_name_ar: { contains: search } },
    ];
  }
  return where;
}

describe("buildRegionListFilter", () => {
  it("returns empty filter when no params", () => {
    const result = buildRegionListFilter();
    expect(result).toEqual({});
  });

  it("filters by country_id", () => {
    const result = buildRegionListFilter(1);
    expect(result).toEqual({ country_id: 1 });
  });

  it("filters by search in both English and Arabic names", () => {
    const result = buildRegionListFilter(undefined, "Kuwait");
    expect(result.OR).toBeDefined();
    expect(result.OR).toHaveLength(2);
    expect(result.country_id).toBeUndefined();
  });

  it("filters by country_id and search", () => {
    const result = buildRegionListFilter(1, "Kuwait");
    expect(result.country_id).toBe(1);
    expect(result.OR).toBeDefined();
  });
});
