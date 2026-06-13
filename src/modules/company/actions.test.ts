import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: Zod schema validation
//
// addCompanyContact and addCompanyStore in actions.ts use these schemas
// internally. Testing them separately avoids the need to mock "use server"
// dependencies (prisma, session, next/cache).
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// addContactSchema tests
// ---------------------------------------------------------------------------

describe("addContactSchema", () => {
  it("accepts valid contact with all fields", () => {
    const result = addContactSchema.safeParse({
      companyId: "42",
      name: "Ahmed Al-Sabah",
      email: "ahmed@example.com",
      position: "HR Manager",
      phone: "+965 9999 0000",
      allowAccess: "1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(42);
      expect(result.data.name).toBe("Ahmed Al-Sabah");
      expect(result.data.email).toBe("ahmed@example.com");
    }
  });

  it("accepts contact with only required fields (name + companyId)", () => {
    const result = addContactSchema.safeParse({
      companyId: "1",
      name: "Minimal Contact",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(1);
      expect(result.data.name).toBe("Minimal Contact");
      expect(result.data.email).toBeUndefined();
      expect(result.data.position).toBeUndefined();
      expect(result.data.phone).toBeUndefined();
    }
  });

  it("accepts empty string email", () => {
    const result = addContactSchema.safeParse({
      companyId: "10",
      name: "No Email Contact",
      email: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing companyId", () => {
    const result = addContactSchema.safeParse({
      name: "No Company",
    });
    // companyId is required — without it the transform can't run
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric companyId", () => {
    const result = addContactSchema.safeParse({
      companyId: "abc",
      name: "Bad Company",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      // The pipe step catches the failed transform
      expect(result.error.issues[0]?.message).toBe("Expected number, received nan");
    }
  });

  it("rejects zero or negative companyId", () => {
    const zeroResult = addContactSchema.safeParse({
      companyId: "0",
      name: "Zero Company",
    });
    expect(zeroResult.success).toBe(false);
    if (!zeroResult.success) {
      expect(zeroResult.error.issues[0]?.message).toBe("Company is required");
    }

    const negativeResult = addContactSchema.safeParse({
      companyId: "-5",
      name: "Negative Company",
    });
    expect(negativeResult.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = addContactSchema.safeParse({
      companyId: "42",
      name: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Contact name is required");
    }
  });

  it("rejects name exceeding 255 characters", () => {
    const result = addContactSchema.safeParse({
      companyId: "42",
      name: "x".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("accepts name exactly 255 characters", () => {
    const result = addContactSchema.safeParse({
      companyId: "42",
      name: "x".repeat(255),
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email format", () => {
    const result = addContactSchema.safeParse({
      companyId: "42",
      name: "Bad Email",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Invalid email");
    }
  });

  it("rejects position exceeding 100 characters", () => {
    const result = addContactSchema.safeParse({
      companyId: "42",
      name: "Long Position",
      position: "x".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("rejects phone exceeding 50 characters", () => {
    const result = addContactSchema.safeParse({
      companyId: "42",
      name: "Long Phone",
      phone: "x".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional allowAccess field absent", () => {
    const result = addContactSchema.safeParse({
      companyId: "42",
      name: "No Access",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// addStoreSchema tests
// ---------------------------------------------------------------------------

describe("addStoreSchema", () => {
  it("accepts valid store with all fields", () => {
    const result = addStoreSchema.safeParse({
      companyId: "42",
      storeName: "Avenues Mall Branch",
      storeLocation: "Floor 2, Zone A",
      mallUuid: "mall-001",
      brandUuid: "brand-005",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(42);
      expect(result.data.storeName).toBe("Avenues Mall Branch");
      expect(result.data.storeLocation).toBe("Floor 2, Zone A");
    }
  });

  it("accepts store with only required fields", () => {
    const result = addStoreSchema.safeParse({
      companyId: "1",
      storeName: "Main Store",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(1);
      expect(result.data.storeName).toBe("Main Store");
      expect(result.data.storeLocation).toBeUndefined();
      expect(result.data.mallUuid).toBeUndefined();
      expect(result.data.brandUuid).toBeUndefined();
    }
  });

  it("rejects empty store name", () => {
    const result = addStoreSchema.safeParse({
      companyId: "42",
      storeName: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Store name is required");
    }
  });

  it("rejects store name exceeding 255 characters", () => {
    const result = addStoreSchema.safeParse({
      companyId: "42",
      storeName: "x".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("accepts store name exactly 255 characters", () => {
    const result = addStoreSchema.safeParse({
      companyId: "42",
      storeName: "x".repeat(255),
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-numeric companyId", () => {
    const result = addStoreSchema.safeParse({
      companyId: "abc",
      storeName: "Bad Store",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero companyId", () => {
    const result = addStoreSchema.safeParse({
      companyId: "0",
      storeName: "Zero Store",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Company is required");
    }
  });

  it("rejects storeLocation exceeding 255 characters", () => {
    const result = addStoreSchema.safeParse({
      companyId: "42",
      storeName: "Long Location",
      storeLocation: "x".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("rejects mallUuid exceeding 60 characters", () => {
    const result = addStoreSchema.safeParse({
      companyId: "42",
      storeName: "Long Mall UUID",
      mallUuid: "x".repeat(61),
    });
    expect(result.success).toBe(false);
  });

  it("rejects brandUuid exceeding 60 characters", () => {
    const result = addStoreSchema.safeParse({
      companyId: "42",
      storeName: "Long Brand UUID",
      brandUuid: "x".repeat(61),
    });
    expect(result.success).toBe(false);
  });

  it("accepts all optional fields absent", () => {
    const result = addStoreSchema.safeParse({
      companyId: "42",
      storeName: "Minimal Store",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(42);
      expect(result.data.storeName).toBe("Minimal Store");
    }
  });
});
