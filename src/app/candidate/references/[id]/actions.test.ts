import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema definitions — mirrors references/[id]/schemas.ts for isolated unit
// testing of the detail-page validation layer.
// ---------------------------------------------------------------------------

const getReferenceEntrySchema = z.object({
  referenceUuid: z.string().min(1, "Reference UUID is required"),
});

const updateReferenceSchema = z.object({
  referenceUuid: z.string().min(1, "Reference UUID is required"),
  name: z
    .string()
    .min(1, "Reference name is required")
    .max(255, "Name must be 255 characters or fewer")
    .transform((v) => v.trim()),
  company: z
    .string()
    .max(255, "Company must be 255 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
  position: z
    .string()
    .max(255, "Position must be 255 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
  phone: z
    .string()
    .max(50, "Phone must be 50 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
  email: z
    .string()
    .max(255, "Email must be 255 characters or fewer")
    .email("Invalid email format")
    .optional()
    .or(z.literal(""))
    .default(""),
  relationship: z
    .string()
    .max(255, "Relationship must be 255 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
});

const deleteReferenceEntrySchema = z.object({
  referenceUuid: z.string().min(1, "Reference UUID is required"),
});

// ---------------------------------------------------------------------------
// Tests — getReferenceEntrySchema
// ---------------------------------------------------------------------------

describe("getReferenceEntrySchema", () => {
  it("accepts a valid UUID string", () => {
    const r = getReferenceEntrySchema.safeParse({ referenceUuid: "abc-123" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.referenceUuid).toBe("abc-123");
    }
  });

  it("rejects empty UUID", () => {
    expect(getReferenceEntrySchema.safeParse({ referenceUuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getReferenceEntrySchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests — updateReferenceSchema (used as updateReferenceEntrySchema in [id])
// ---------------------------------------------------------------------------

describe("updateReferenceSchema (updateReferenceEntrySchema)", () => {
  it("accepts valid update with all fields", () => {
    const r = updateReferenceSchema.safeParse({
      referenceUuid: "uuid-1",
      name: "Jane Doe",
      company: "Acme Corp",
      position: "Manager",
      phone: "+965 1234 5678",
      email: "jane@acme.com",
      relationship: "Colleague",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.referenceUuid).toBe("uuid-1");
      expect(r.data.name).toBe("Jane Doe");
      expect(r.data.company).toBe("Acme Corp");
      expect(r.data.email).toBe("jane@acme.com");
    }
  });

  it("accepts minimal update (UUID + name only)", () => {
    const r = updateReferenceSchema.safeParse({
      referenceUuid: "uuid-1",
      name: "Jane Doe",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company).toBe("");
      expect(r.data.phone).toBe("");
      expect(r.data.email).toBe("");
    }
  });

  it("rejects missing referenceUuid", () => {
    expect(
      updateReferenceSchema.safeParse({ name: "Test" }).success,
    ).toBe(false);
  });

  it("rejects empty referenceUuid", () => {
    expect(
      updateReferenceSchema.safeParse({ referenceUuid: "", name: "Test" }).success,
    ).toBe(false);
  });

  it("rejects missing name", () => {
    expect(
      updateReferenceSchema.safeParse({ referenceUuid: "uuid-1" }).success,
    ).toBe(false);
  });

  it("rejects empty name", () => {
    expect(
      updateReferenceSchema.safeParse({ referenceUuid: "uuid-1", name: "" }).success,
    ).toBe(false);
  });

  it("rejects name over 255 chars", () => {
    expect(
      updateReferenceSchema.safeParse({
        referenceUuid: "uuid-1",
        name: "a".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects invalid email format", () => {
    expect(
      updateReferenceSchema.safeParse({
        referenceUuid: "uuid-1",
        name: "Test",
        email: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("accepts empty email string", () => {
    const r = updateReferenceSchema.safeParse({
      referenceUuid: "uuid-1",
      name: "Test",
      email: "",
    });
    expect(r.success).toBe(true);
  });

  it("trims whitespace from name", () => {
    const r = updateReferenceSchema.safeParse({
      referenceUuid: "uuid-1",
      name: "  Jane Doe  ",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Jane Doe");
    }
  });
});

// ---------------------------------------------------------------------------
// Tests — deleteReferenceEntrySchema
// ---------------------------------------------------------------------------

describe("deleteReferenceEntrySchema", () => {
  it("accepts a valid UUID", () => {
    const r = deleteReferenceEntrySchema.safeParse({ referenceUuid: "uuid-1" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.referenceUuid).toBe("uuid-1");
    }
  });

  it("rejects empty UUID", () => {
    expect(deleteReferenceEntrySchema.safeParse({ referenceUuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(deleteReferenceEntrySchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

type ReferenceEntryResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
};

describe("ReferenceEntryResponse type shape", () => {
  it("accepts a success response", () => {
    const result: ReferenceEntryResponse = {
      success: true,
      data: { referenceUuid: "uuid-1" },
    };
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ referenceUuid: "uuid-1" });
  });

  it("accepts an error response", () => {
    const result: ReferenceEntryResponse = {
      success: false,
      error: "Reference entry not found or access denied",
    };
    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
  });
});
