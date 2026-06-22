import { describe, it, expect } from "vitest";
import {
  getReferenceEntrySchema,
  updateReferenceEntrySchema,
  deleteReferenceEntrySchema,
} from "./schemas";
import { updateReferenceSchema } from "../schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit, no mocking required
// ---------------------------------------------------------------------------

describe("getReferenceEntrySchema", () => {
  it("accepts a valid reference UUID", () => {
    expect(
      getReferenceEntrySchema.safeParse({ referenceUuid: "ref_abc-123" })
        .success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(
      getReferenceEntrySchema.safeParse({ referenceUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getReferenceEntrySchema.safeParse({}).success).toBe(false);
  });

  it("rejects null UUID", () => {
    expect(
      getReferenceEntrySchema.safeParse({ referenceUuid: null }).success,
    ).toBe(false);
  });
});

describe("updateReferenceEntrySchema", () => {
  it("accepts a valid update", () => {
    const result = updateReferenceEntrySchema.safeParse({
      referenceUuid: "ref_abc-123",
      name: "Updated Name",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.referenceUuid).toBe("ref_abc-123");
      expect(result.data.name).toBe("Updated Name");
    }
  });

  it("rejects empty UUID", () => {
    const result = updateReferenceEntrySchema.safeParse({
      referenceUuid: "",
      name: "Full Name",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = updateReferenceEntrySchema.safeParse({
      name: "Full Name",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all optional fields", () => {
    const result = updateReferenceEntrySchema.safeParse({
      referenceUuid: "ref_abc-123",
      name: "Jane Doe",
      company: "Acme Corp",
      position: "Manager",
      phone: "+965 1234 5678",
      email: "jane@acme.com",
      relationship: "Supervisor",
    });
    expect(result.success).toBe(true);
  });
});

describe("deleteReferenceEntrySchema", () => {
  it("accepts a valid referenceUuid", () => {
    const result = deleteReferenceEntrySchema.safeParse({
      referenceUuid: "ref_abc-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = deleteReferenceEntrySchema.safeParse({ referenceUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = deleteReferenceEntrySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Parent schema re-export sanity check
// ---------------------------------------------------------------------------

describe("updateReferenceSchema (from parent schemas)", () => {
  it("re-exports correctly", () => {
    const result = updateReferenceSchema.safeParse({
      referenceUuid: "ref_001",
      name: "John Doe",
    });
    expect(result.success).toBe(true);
  });
});
