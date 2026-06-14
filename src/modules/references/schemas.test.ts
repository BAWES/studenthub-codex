import { describe, it, expect } from "vitest";
import {
  referenceItemSchema,
  referenceListSchema,
  referenceActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// referenceItemSchema
// ---------------------------------------------------------------------------
describe("referenceItemSchema", () => {
  const now = new Date();
  const valid = {
    reference_uuid: "ref_001",
    candidate_id: 42,
    name: "Ahmed Al-Salem",
    company: "Kuwait Oil Co.",
    position: "Senior Engineer",
    phone: "+96512345678",
    email: "ahmed@example.com",
    relationship: "Colleague",
    created_at: now,
    updated_at: now,
  };

  it("accepts a valid reference item", () => {
    expect(referenceItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable candidate_id", () => {
    expect(
      referenceItemSchema.safeParse({ ...valid, candidate_id: null }).success,
    ).toBe(true);
  });

  it("accepts nullable company", () => {
    expect(
      referenceItemSchema.safeParse({ ...valid, company: null }).success,
    ).toBe(true);
  });

  it("accepts nullable position", () => {
    expect(
      referenceItemSchema.safeParse({ ...valid, position: null }).success,
    ).toBe(true);
  });

  it("accepts nullable phone", () => {
    expect(
      referenceItemSchema.safeParse({ ...valid, phone: null }).success,
    ).toBe(true);
  });

  it("accepts nullable email", () => {
    expect(
      referenceItemSchema.safeParse({ ...valid, email: null }).success,
    ).toBe(true);
  });

  it("accepts nullable relationship", () => {
    expect(
      referenceItemSchema.safeParse({ ...valid, relationship: null }).success,
    ).toBe(true);
  });

  it("accepts nullable created_at", () => {
    expect(
      referenceItemSchema.safeParse({ ...valid, created_at: null }).success,
    ).toBe(true);
  });

  it("accepts nullable updated_at", () => {
    expect(
      referenceItemSchema.safeParse({ ...valid, updated_at: null }).success,
    ).toBe(true);
  });

  it("accepts all nullable fields simultaneously", () => {
    expect(
      referenceItemSchema.safeParse({
        reference_uuid: "ref_002",
        candidate_id: null,
        name: "Sara Al-Mutairi",
        company: null,
        position: null,
        phone: null,
        email: null,
        relationship: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing reference_uuid", () => {
    const { reference_uuid: _, ...rest } = valid;
    expect(referenceItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = valid;
    expect(referenceItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty reference_uuid", () => {
    expect(
      referenceItemSchema.safeParse({ ...valid, reference_uuid: "" }).success,
    ).toBe(false);
  });

  it("rejects empty name", () => {
    expect(
      referenceItemSchema.safeParse({ ...valid, name: "" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for candidate_id", () => {
    expect(
      referenceItemSchema.safeParse({ ...valid, candidate_id: "not-a-number" })
        .success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// referenceListSchema (array)
// ---------------------------------------------------------------------------
describe("referenceListSchema", () => {
  const valid = [
    {
      reference_uuid: "ref_001",
      candidate_id: 42,
      name: "Ahmed",
      company: "KOC",
      position: "Engineer",
      phone: null,
      email: null,
      relationship: null,
      created_at: null,
      updated_at: null,
    },
  ];

  it("accepts a valid list", () => {
    expect(referenceListSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty array", () => {
    expect(referenceListSchema.safeParse([]).success).toBe(true);
  });

  it("rejects non-array", () => {
    expect(referenceListSchema.safeParse("not-array").success).toBe(false);
  });

  it("rejects array with invalid element", () => {
    expect(referenceListSchema.safeParse([{ invalid: true }]).success).toBe(
      false,
    );
  });
});

// ---------------------------------------------------------------------------
// referenceActionResultSchema (discriminated union)
// ---------------------------------------------------------------------------
describe("referenceActionResultSchema", () => {
  it("accepts success with referenceUuid", () => {
    expect(
      referenceActionResultSchema.safeParse({
        success: true,
        referenceUuid: "ref_001",
      }).success,
    ).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      referenceActionResultSchema.safeParse({
        success: false,
        error: "Reference not found.",
      }).success,
    ).toBe(true);
  });

  it("rejects success without referenceUuid", () => {
    expect(
      referenceActionResultSchema.safeParse({ success: true }).success,
    ).toBe(false);
  });

  it("rejects missing error on false", () => {
    expect(
      referenceActionResultSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("rejects empty referenceUuid", () => {
    expect(
      referenceActionResultSchema.safeParse({
        success: true,
        referenceUuid: "",
      }).success,
    ).toBe(false);
  });

  it("rejects empty error", () => {
    expect(
      referenceActionResultSchema.safeParse({
        success: false,
        error: "",
      }).success,
    ).toBe(false);
  });
});
