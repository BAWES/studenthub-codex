import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: client schema validation
//
// listClients, createClient, updateClient in actions.ts use these zod schemas
// internally. Testing them separately avoids mocking "use server" dependencies
// (prisma, session, next/cache).
// ---------------------------------------------------------------------------

const listClientsSchema = z.object({
  name: z.string().optional(),
  staff_id: z.number().int().positive().optional(),
  approved_to_hire: z.union([z.literal(0), z.literal(1)]).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const getClientSchema = z.object({
  id: z.number().int().positive(),
});

const createClientSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(1, "Name is required").max(255),
  common_name_en: z.string().max(255).optional(),
  common_name_ar: z.string().max(255).optional(),
  description_en: z.string().max(65535).optional(),
  description_ar: z.string().max(65535).optional(),
  website: z.string().max(65535).optional(),
  email: z.string().max(225).optional(),
  hourly_rate: z.number().positive().optional(),
  bonus_commission: z.number().min(0).optional(),
  approved_to_hire: z.union([z.literal(0), z.literal(1)]).optional(),
  country_id: z.number().int().positive().optional(),
  currency_code: z.string().length(3).optional(),
});

const updateClientSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255).optional(),
  common_name_en: z.string().max(255).optional(),
  common_name_ar: z.string().max(255).optional(),
  description_en: z.string().max(65535).optional(),
  description_ar: z.string().max(65535).optional(),
  website: z.string().max(65535).optional(),
  email: z.string().max(225).optional(),
  hourly_rate: z.number().positive().optional(),
  bonus_commission: z.number().min(0).optional(),
  approved_to_hire: z.union([z.literal(0), z.literal(1)]).optional(),
  country_id: z.number().int().positive().optional(),
  currency_code: z.string().length(3).optional(),
  staff_id: z.number().int().positive().optional(),
});

// ---------------------------------------------------------------------------
// listClientsSchema
// ---------------------------------------------------------------------------

describe("listClientsSchema", () => {
  it("accepts empty params (no filters)", () => {
    const result = listClientsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts name filter", () => {
    const result = listClientsSchema.safeParse({ name: "Acme" });
    expect(result.success).toBe(true);
  });

  it("accepts staff_id filter", () => {
    const result = listClientsSchema.safeParse({ staff_id: 5 });
    expect(result.success).toBe(true);
  });

  it("accepts approved_to_hire filter", () => {
    const result = listClientsSchema.safeParse({ approved_to_hire: 1 });
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listClientsSchema.safeParse({
      page: 1,
      limit: 20,
    });
    expect(result.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const result = listClientsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listClientsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid approved_to_hire value", () => {
    const result = listClientsSchema.safeParse({ approved_to_hire: 2 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer staff_id", () => {
    const result = listClientsSchema.safeParse({ staff_id: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getClientSchema
// ---------------------------------------------------------------------------

describe("getClientSchema", () => {
  it("accepts valid client id", () => {
    const result = getClientSchema.safeParse({ id: 42 });
    expect(result.success).toBe(true);
  });

  it("rejects missing id", () => {
    const result = getClientSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects negative id", () => {
    const result = getClientSchema.safeParse({ id: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero id", () => {
    const result = getClientSchema.safeParse({ id: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer id", () => {
    const result = getClientSchema.safeParse({ id: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createClientSchema
// ---------------------------------------------------------------------------

describe("createClientSchema", () => {
  it("accepts valid client data with only required fields", () => {
    const result = createClientSchema.safeParse({
      name: "Acme Corp",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Acme Corp");
    }
  });

  it("accepts client data with all optional fields", () => {
    const result = createClientSchema.safeParse({
      name: "Acme Corp",
      common_name_en: "Acme",
      common_name_ar: "أكمي",
      description_en: "A fine company",
      description_ar: "شركة ممتازة",
      website: "https://acme.com",
      email: "contact@acme.com",
      hourly_rate: 15.5,
      bonus_commission: 2.5,
      approved_to_hire: 1,
      country_id: 1,
      currency_code: "KWD",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = createClientSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error!.errors[0]?.message).toBe("Name is required");
  });

  it("rejects empty name", () => {
    const result = createClientSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name over 255 chars", () => {
    const result = createClientSchema.safeParse({
      name: "x".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative hourly_rate", () => {
    const result = createClientSchema.safeParse({
      name: "Test",
      hourly_rate: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid currency_code", () => {
    const result = createClientSchema.safeParse({
      name: "Test",
      currency_code: "KW",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid approved_to_hire", () => {
    const result = createClientSchema.safeParse({
      name: "Test",
      approved_to_hire: 3,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateClientSchema
// ---------------------------------------------------------------------------

describe("updateClientSchema", () => {
  it("accepts valid update with all fields", () => {
    const result = updateClientSchema.safeParse({
      id: 5,
      name: "Acme Corp Updated",
      email: "new@acme.com",
      hourly_rate: 20,
    });
    expect(result.success).toBe(true);
  });

  it("accepts partial update (single field)", () => {
    const result = updateClientSchema.safeParse({
      id: 5,
      name: "Just Name Change",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing id", () => {
    const result = updateClientSchema.safeParse({ name: "No ID" });
    expect(result.success).toBe(false);
  });

  it("rejects negative id", () => {
    const result = updateClientSchema.safeParse({ id: -1, name: "Test" });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = updateClientSchema.safeParse({ id: 5, name: "" });
    expect(result.success).toBe(false);
  });
});
