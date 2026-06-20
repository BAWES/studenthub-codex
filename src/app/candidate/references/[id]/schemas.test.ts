import { describe, it, expect } from "vitest";
import {
  getReferenceEntrySchema,
  deleteReferenceEntrySchema,
  updateReferenceEntrySchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema validation tests — candidate/references/[id]
// ---------------------------------------------------------------------------

describe("getReferenceEntrySchema", () => {
  it("accepts a valid reference UUID", () => {
    expect(
      getReferenceEntrySchema.safeParse({ referenceUuid: "ref-001" }).success,
    ).toBe(true);
  });

  it("rejects missing referenceUuid", () => {
    expect(getReferenceEntrySchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty referenceUuid", () => {
    expect(
      getReferenceEntrySchema.safeParse({ referenceUuid: "" }).success,
    ).toBe(false);
  });
});

describe("deleteReferenceEntrySchema", () => {
  it("accepts a valid reference UUID", () => {
    expect(
      deleteReferenceEntrySchema.safeParse({ referenceUuid: "ref-001" })
        .success,
    ).toBe(true);
  });

  it("rejects missing referenceUuid", () => {
    expect(deleteReferenceEntrySchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty referenceUuid", () => {
    expect(
      deleteReferenceEntrySchema.safeParse({ referenceUuid: "" }).success,
    ).toBe(false);
  });
});

describe("updateReferenceEntrySchema", () => {
  const validUpdate = {
    referenceUuid: "ref-001",
    name: "Dr. Smith",
    company: "Kuwait University",
    position: "Professor",
    phone: "+965 5555 6789",
    email: "smith@ku.edu.kw",
    relationship: "Academic",
  };

  it("accepts a valid update object", () => {
    expect(
      updateReferenceEntrySchema.safeParse(validUpdate).success,
    ).toBe(true);
  });

  it("accepts optional fields omitted", () => {
    expect(
      updateReferenceEntrySchema.safeParse({
        referenceUuid: "ref-001",
        name: "Dr. Smith",
      }).success,
    ).toBe(true);
  });

  it("rejects missing referenceUuid", () => {
    const { referenceUuid: _, ...rest } = validUpdate;
    expect(updateReferenceEntrySchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(
      updateReferenceEntrySchema.safeParse({
        ...validUpdate,
        name: "",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      updateReferenceEntrySchema.safeParse({
        ...validUpdate,
        email: "bad-email",
      }).success,
    ).toBe(false);
  });
});
