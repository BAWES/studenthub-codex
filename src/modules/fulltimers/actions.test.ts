import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas (duplicated from actions.ts for isolated unit testing)
// ---------------------------------------------------------------------------

const listFulltimersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  nationalityId: z.coerce.number().int().positive().optional(),
  employed: z.enum(["true", "false"]).optional(),
});

const getFulltimerSchema = z.object({
  fulltimerUuid: z.string().min(1, "Fulltimer UUID is required"),
});

const createFulltimerSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Valid email is required"),
  phone: z.string().max(255).optional(),
  nationalityId: z.coerce.number().int().positive().optional(),
  countryId: z.coerce.number().int().positive().optional(),
  universityId: z.coerce.number().int().positive().optional(),
  employed: z.boolean().optional(),
  gender: z.boolean().optional(),
  birthDate: z.string().optional(),
  drivingLicense: z.boolean().optional(),
  currentSalary: z.string().max(100).optional(),
  expectedSalary: z.string().max(100).optional(),
  currencyCode: z.string().length(3).optional().default("KWD"),
});

const updateFulltimerSchema = z.object({
  fulltimerUuid: z.string().min(1, "Fulltimer UUID is required"),
  name: z.string().min(1).max(255).optional(),
  phone: z.string().max(255).optional(),
  nationalityId: z.coerce.number().int().positive().optional(),
  countryId: z.coerce.number().int().positive().optional(),
  universityId: z.coerce.number().int().positive().optional(),
  employed: z.boolean().optional(),
  gender: z.boolean().optional(),
  birthDate: z.string().optional(),
  drivingLicense: z.boolean().optional(),
  currentSalary: z.string().max(100).optional(),
  expectedSalary: z.string().max(100).optional(),
  currencyCode: z.string().length(3).optional(),
});

const deleteFulltimerSchema = z.object({
  fulltimerUuid: z.string().min(1, "Fulltimer UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FulltimerListItem = {
  fulltimer_uuid: string;
  fulltimer_name: string;
  fulltimer_email: string;
  fulltimer_phone: string | null;
  fulltimer_employed: boolean | null;
  nationality_id: number | null;
  country_id: number | null;
  university_id: number | null;
  fulltimer_created_datetime: string | null;
};

type ListFulltimersResult = {
  fulltimers: FulltimerListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

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
// Tests: Type shapes
// ---------------------------------------------------------------------------

describe("FulltimerListItem type shape", () => {
  it("accepts a valid fulltimer object", () => {
    const mock: FulltimerListItem = {
      fulltimer_uuid: "ft_abc123",
      fulltimer_name: "Ahmed Ali",
      fulltimer_email: "ahmed@example.com",
      fulltimer_phone: "+965 99999999",
      fulltimer_employed: true,
      nationality_id: 1,
      country_id: null,
      university_id: null,
      fulltimer_created_datetime: new Date().toISOString(),
    };
    expect(mock.fulltimer_name).toBe("Ahmed Ali");
    expect(mock.fulltimer_email).toBe("ahmed@example.com");
  });
});

describe("ListFulltimersResult type shape", () => {
  it("accepts an empty result set", () => {
    const result: ListFulltimersResult = {
      fulltimers: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.fulltimers).toHaveLength(0);
  });
});
