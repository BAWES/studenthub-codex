import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Company action schemas — tested separately from "use server" functions
// to avoid mocking Prisma, session, and next/cache.
// The schemas are defined inline in actions.ts; these tests validate their
// parsing behavior, edge cases, and error paths.
// ---------------------------------------------------------------------------

const PROFICIENCY_LEVELS = ["basic", "intermediate", "advanced", "native"] as const;

/** Mirrors the addContactSchema from actions.ts */
const addContactSchema = z.object({
  companyId: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive("Company is required")),
  name: z.string().min(1, "Contact name is required").max(255),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  position: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  allowAccess: z.string().optional(),
});

/** Mirrors the addStoreSchema from actions.ts */
const addStoreSchema = z.object({
  companyId: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive("Company is required")),
  storeName: z.string().min(1, "Store name is required").max(255),
  storeLocation: z.string().max(255).optional(),
  mallUuid: z.string().max(60).optional(),
  brandUuid: z.string().max(60).optional(),
});

// ===========================================================================
// addContactSchema
// ===========================================================================

describe("addContactSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = addContactSchema.safeParse({
      companyId: "42",
      name: "John Doe",
      email: "john@example.com",
      position: "Manager",
      phone: "+965 1234 5678",
      allowAccess: "1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(42);
      expect(result.data.name).toBe("John Doe");
      expect(result.data.email).toBe("john@example.com");
      expect(result.data.position).toBe("Manager");
      expect(result.data.phone).toBe("+965 1234 5678");
      expect(result.data.allowAccess).toBe("1");
    }
  });

  it("accepts minimal input (only required fields)", () => {
    const result = addContactSchema.safeParse({
      companyId: "1",
      name: "Jane Doe",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(1);
      expect(result.data.name).toBe("Jane Doe");
    }
  });

  it("accepts empty email string (allows creating contact without email)", () => {
    const result = addContactSchema.safeParse({
      companyId: "7",
      name: "No Email Contact",
      email: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = addContactSchema.safeParse({
      companyId: "10",
      name: "Bad Email",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing companyId", () => {
    const result = addContactSchema.safeParse({
      name: "Missing Company",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = addContactSchema.safeParse({
      companyId: "5",
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric companyId", () => {
    const result = addContactSchema.safeParse({
      companyId: "abc",
      name: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative companyId after transform", () => {
    const result = addContactSchema.safeParse({
      companyId: "-5",
      name: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 255 characters", () => {
    const result = addContactSchema.safeParse({
      companyId: "3",
      name: "A".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("rejects position longer than 100 characters", () => {
    const result = addContactSchema.safeParse({
      companyId: "3",
      name: "Test",
      position: "B".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("rejects phone longer than 50 characters", () => {
    const result = addContactSchema.safeParse({
      companyId: "3",
      name: "Test",
      phone: "C".repeat(51),
    });
    expect(result.success).toBe(false);
  });
});

// ===========================================================================
// addStoreSchema
// ===========================================================================

describe("addStoreSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = addStoreSchema.safeParse({
      companyId: "42",
      storeName: "Main Branch",
      storeLocation: "Floor 3, Avenues Mall",
      mallUuid: "mall-001",
      brandUuid: "brand-007",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(42);
      expect(result.data.storeName).toBe("Main Branch");
      expect(result.data.storeLocation).toBe("Floor 3, Avenues Mall");
      expect(result.data.mallUuid).toBe("mall-001");
      expect(result.data.brandUuid).toBe("brand-007");
    }
  });

  it("accepts minimal input (only required fields)", () => {
    const result = addStoreSchema.safeParse({
      companyId: "1",
      storeName: "Minimal Store",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.storeName).toBe("Minimal Store");
      expect(result.data.storeLocation).toBeUndefined();
      expect(result.data.mallUuid).toBeUndefined();
      expect(result.data.brandUuid).toBeUndefined();
    }
  });

  it("rejects empty storeName", () => {
    const result = addStoreSchema.safeParse({
      companyId: "5",
      storeName: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric companyId", () => {
    const result = addStoreSchema.safeParse({
      companyId: "xyz",
      storeName: "Test Store",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative companyId", () => {
    const result = addStoreSchema.safeParse({
      companyId: "-1",
      storeName: "Test Store",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero companyId", () => {
    const result = addStoreSchema.safeParse({
      companyId: "0",
      storeName: "Test Store",
    });
    expect(result.success).toBe(false);
  });

  it("rejects storeName longer than 255 characters", () => {
    const result = addStoreSchema.safeParse({
      companyId: "3",
      storeName: "X".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("rejects storeLocation longer than 255 characters", () => {
    const result = addStoreSchema.safeParse({
      companyId: "3",
      storeName: "Valid Store",
      storeLocation: "Y".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("rejects mallUuid longer than 60 characters", () => {
    const result = addStoreSchema.safeParse({
      companyId: "3",
      storeName: "Test Store",
      mallUuid: "Z".repeat(61),
    });
    expect(result.success).toBe(false);
  });

  it("rejects brandUuid longer than 60 characters", () => {
    const result = addStoreSchema.safeParse({
      companyId: "3",
      storeName: "Test Store",
      brandUuid: "W".repeat(61),
    });
    expect(result.success).toBe(false);
  });
});
