import { describe, it, expect } from "vitest";
import {
  listFulltimersSchema,
  getFulltimerSchema,
  createFulltimerSchema,
  updateFulltimerSchema,
  deleteFulltimerSchema,
  fulltimerItemSchema,
  fulltimerDetailSchema,
  fulltimerDetailOrNullSchema,
  listFulltimersResultSchema,
  type FulltimerListItem,
  type FulltimerDetail,
  type ListFulltimersResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Pure functions for testable logic
// ---------------------------------------------------------------------------

function buildFulltimerFilter(params: {
  search?: string;
  nationalityId?: number;
  employed?: "true" | "false";
}) {
  const where: Record<string, any> = {};

  if (params.search) {
    where.OR = [
      { fulltimer_name: { contains: params.search } },
      { fulltimer_email: { contains: params.search } },
      { fulltimer_phone: { contains: params.search } },
    ];
  }
  if (params.nationalityId !== undefined) {
    where.nationality_id = params.nationalityId;
  }
  if (params.employed !== undefined) {
    where.fulltimer_employed = params.employed === "true";
  }
  return where;
}

function validateFulltimerEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Tests: listFulltimersSchema
// ---------------------------------------------------------------------------

describe("listFulltimersSchema", () => {
  it("accepts empty params and defaults page/limit", () => {
    const result = listFulltimersSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts search filter", () => {
    const result = listFulltimersSchema.safeParse({ search: "Ahmed" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("Ahmed");
    }
  });

  it("accepts nationality filter", () => {
    const result = listFulltimersSchema.safeParse({ nationalityId: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nationalityId).toBe(1);
    }
  });

  it("accepts employed filter", () => {
    const result = listFulltimersSchema.safeParse({ employed: "true" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.employed).toBe("true");
    }
  });

  it("rejects negative page", () => {
    const result = listFulltimersSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listFulltimersSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: getFulltimerSchema
// ---------------------------------------------------------------------------

describe("getFulltimerSchema", () => {
  it("accepts valid UUID", () => {
    const result = getFulltimerSchema.safeParse({ fulltimerUuid: "ft_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getFulltimerSchema.safeParse({ fulltimerUuid: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: createFulltimerSchema
// ---------------------------------------------------------------------------

describe("createFulltimerSchema", () => {
  it("accepts valid minimal input", () => {
    const result = createFulltimerSchema.safeParse({
      name: "Ahmed Ali",
      email: "ahmed@example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currencyCode).toBe("KWD");
    }
  });

  it("accepts all fields", () => {
    const result = createFulltimerSchema.safeParse({
      name: "Ahmed Ali",
      email: "ahmed@example.com",
      phone: "+965 99999999",
      nationalityId: 1,
      employed: true,
      currentSalary: "500",
      expectedSalary: "800",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createFulltimerSchema.safeParse({
      name: "",
      email: "ahmed@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = createFulltimerSchema.safeParse({
      name: "Ahmed",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name over 255 chars", () => {
    const result = createFulltimerSchema.safeParse({
      name: "a".repeat(256),
      email: "ahmed@example.com",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: updateFulltimerSchema
// ---------------------------------------------------------------------------

describe("updateFulltimerSchema", () => {
  it("accepts partial update (name only)", () => {
    const result = updateFulltimerSchema.safeParse({
      fulltimerUuid: "ft_abc123",
      name: "New Name",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all fields", () => {
    const result = updateFulltimerSchema.safeParse({
      fulltimerUuid: "ft_abc123",
      name: "Updated Name",
      employed: true,
      currentSalary: "600",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing UUID", () => {
    const result = updateFulltimerSchema.safeParse({ name: "New" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: deleteFulltimerSchema
// ---------------------------------------------------------------------------

describe("deleteFulltimerSchema", () => {
  it("accepts valid UUID", () => {
    const result = deleteFulltimerSchema.safeParse({ fulltimerUuid: "ft_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = deleteFulltimerSchema.safeParse({ fulltimerUuid: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: Pure functions
// ---------------------------------------------------------------------------

describe("buildFulltimerFilter", () => {
  it("returns empty where with no params", () => {
    const result = buildFulltimerFilter({});
    expect(result).toEqual({});
  });

  it("builds OR search filter", () => {
    const result = buildFulltimerFilter({ search: "Ahmed" });
    expect(result.OR).toBeDefined();
    expect(result.OR).toHaveLength(3);
  });

  it("adds nationality filter", () => {
    const result = buildFulltimerFilter({ nationalityId: 1 });
    expect(result.nationality_id).toBe(1);
  });

  it("adds employed filter", () => {
    const result = buildFulltimerFilter({ employed: "true" });
    expect(result.fulltimer_employed).toBe(true);
  });
});

describe("validateFulltimerEmail", () => {
  it("returns null for valid email", () => {
    expect(validateFulltimerEmail("test@example.com")).toBeNull();
  });

  it("returns error for invalid email", () => {
    expect(validateFulltimerEmail("not-email")).toBe("Invalid email format");
    expect(validateFulltimerEmail("")).toBe("Invalid email format");
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: fulltimerItemSchema
// ---------------------------------------------------------------------------

const validFulltimerItem = {
  fulltimer_uuid: "ft_abc123",
  fulltimer_name: "Ahmed Ali",
  fulltimer_email: "ahmed@example.com",
  fulltimer_phone: "+965 99999999",
  fulltimer_employed: true,
  nationality_id: 1,
  country_id: null,
  university_id: null,
  fulltimer_created_datetime: "2025-06-01T10:00:00.000Z",
};

describe("fulltimerItemSchema", () => {
  it("accepts a valid fulltimer list item", () => {
    const result = fulltimerItemSchema.parse(validFulltimerItem);
    expect(result.fulltimer_uuid).toBe("ft_abc123");
    expect(result.fulltimer_name).toBe("Ahmed Ali");
  });

  it("accepts nullable fields as null", () => {
    const result = fulltimerItemSchema.parse({
      ...validFulltimerItem,
      fulltimer_phone: null,
      fulltimer_employed: null,
      nationality_id: null,
      country_id: null,
      university_id: null,
      fulltimer_created_datetime: null,
    });
    expect(result.fulltimer_phone).toBeNull();
    expect(result.fulltimer_employed).toBeNull();
    expect(result.nationality_id).toBeNull();
  });

  it("rejects missing required string field", () => {
    const { fulltimer_name, ...rest } = validFulltimerItem;
    expect(() => fulltimerItemSchema.parse(rest)).toThrow();
  });

  it("rejects wrong type for a field", () => {
    expect(() =>
      fulltimerItemSchema.parse({ ...validFulltimerItem, fulltimer_uuid: 123 }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: fulltimerDetailSchema
// ---------------------------------------------------------------------------

const validFulltimerDetail = {
  fulltimer_uuid: "ft_abc123",
  fulltimer_name: "Ahmed Ali",
  fulltimer_email: "ahmed@example.com",
  fulltimer_phone: "+965 99999999",
  fulltimer_employed: true,
  fulltimer_gender: false,
  fulltimer_birth_date: "1990-01-15T00:00:00.000Z",
  fulltimer_driving_license: true,
  nationality_id: 1,
  country_id: null,
  university_id: null,
  fulltimer_area_uuid: null,
  fulltimer_current_salary: "500",
  fulltimer_expected_salary: "800",
  fulltimer_pdf_cv: null,
  currency_code: "KWD",
  fulltimer_created_datetime: "2025-06-01T10:00:00.000Z",
  fulltimer_updated_datetime: "2025-06-01T10:00:00.000Z",
};

describe("fulltimerDetailSchema", () => {
  it("accepts a valid fulltimer detail object", () => {
    const result = fulltimerDetailSchema.parse(validFulltimerDetail);
    expect(result.fulltimer_uuid).toBe("ft_abc123");
    expect(result.fulltimer_name).toBe("Ahmed Ali");
    expect(result.currency_code).toBe("KWD");
  });

  it("accepts nullable fields as null", () => {
    const result = fulltimerDetailSchema.parse({
      ...validFulltimerDetail,
      fulltimer_phone: null,
      fulltimer_gender: null,
      fulltimer_birth_date: null,
      fulltimer_driving_license: null,
      nationality_id: null,
      fulltimer_area_uuid: null,
      fulltimer_current_salary: null,
      fulltimer_expected_salary: null,
      currency_code: null,
    });
    expect(result.fulltimer_phone).toBeNull();
    expect(result.fulltimer_gender).toBeNull();
    expect(result.currency_code).toBeNull();
  });

  it("rejects missing required field", () => {
    const { fulltimer_uuid, ...rest } = validFulltimerDetail;
    expect(() => fulltimerDetailSchema.parse(rest)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: fulltimerDetailOrNullSchema
// ---------------------------------------------------------------------------

describe("fulltimerDetailOrNullSchema", () => {
  it("accepts a valid detail object", () => {
    const result = fulltimerDetailOrNullSchema.parse(validFulltimerDetail);
    expect(result).not.toBeNull();
  });

  it("accepts null", () => {
    const result = fulltimerDetailOrNullSchema.parse(null);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: listFulltimersResultSchema
// ---------------------------------------------------------------------------

describe("listFulltimersResultSchema", () => {
  it("accepts a valid result with fulltimers", () => {
    const result = listFulltimersResultSchema.parse({
      fulltimers: [validFulltimerItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.fulltimers.length).toBe(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);
  });

  it("accepts an empty list", () => {
    const result = listFulltimersResultSchema.parse({
      fulltimers: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.fulltimers.length).toBe(0);
    expect(result.total).toBe(0);
  });

  it("rejects negative page", () => {
    expect(() =>
      listFulltimersResultSchema.parse({
        fulltimers: [],
        total: 0,
        page: -1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });

  it("rejects negative total", () => {
    expect(() =>
      listFulltimersResultSchema.parse({
        fulltimers: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });

  it("rejects string where number expected", () => {
    expect(() =>
      listFulltimersResultSchema.parse({
        fulltimers: [],
        total: "zero",
        page: 1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });
});
