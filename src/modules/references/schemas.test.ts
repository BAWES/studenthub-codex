import { describe, it, expect } from "vitest";
import {
  referenceItemSchema,
  referenceListSchema,
  referenceActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// referenceItemSchema — output validation
// ---------------------------------------------------------------------------

const validReferenceItem = {
  reference_uuid: "ref-uuid-001",
  candidate_id: 42,
  name: "John Smith",
  company: "ACME Corp",
  position: "Manager",
  phone: "+965 1234 5678",
  email: "john@acme.com",
  relationship: "Former supervisor",
  created_at: new Date("2024-01-01"),
  updated_at: new Date("2024-06-01"),
};

describe("referenceItemSchema", () => {
  it("accepts a fully populated valid reference item", () => {
    const result = referenceItemSchema.safeParse(validReferenceItem);
    expect(result.success).toBe(true);
  });

  it("accepts a reference item with minimal required fields", () => {
    const result = referenceItemSchema.safeParse({
      reference_uuid: "ref-uuid-002",
      candidate_id: null,
      name: "Jane Doe",
      company: null,
      position: null,
      phone: null,
      email: null,
      relationship: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    const result = referenceItemSchema.safeParse({
      reference_uuid: "ref-uuid-003",
      candidate_id: null,
      name: "Alice",
      company: null,
      position: null,
      phone: null,
      email: null,
      relationship: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty reference_uuid", () => {
    const result = referenceItemSchema.safeParse({
      ...validReferenceItem,
      reference_uuid: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing reference_uuid", () => {
    const result = referenceItemSchema.safeParse({
      candidate_id: 42,
      name: "John Smith",
      company: null,
      position: null,
      phone: null,
      email: null,
      relationship: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = referenceItemSchema.safeParse({
      ...validReferenceItem,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = referenceItemSchema.safeParse({
      reference_uuid: "ref-uuid-004",
      candidate_id: null,
      company: null,
      position: null,
      phone: null,
      email: null,
      relationship: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer candidate_id", () => {
    const result = referenceItemSchema.safeParse({
      ...validReferenceItem,
      candidate_id: 42.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects string candidate_id", () => {
    const result = referenceItemSchema.safeParse({
      ...validReferenceItem,
      candidate_id: "forty-two",
    });
    expect(result.success).toBe(false);
  });

  it("rejects number value for name", () => {
    const result = referenceItemSchema.safeParse({
      ...validReferenceItem,
      name: 42,
    });
    expect(result.success).toBe(false);
  });

  it("rejects string for created_at when it should be Date", () => {
    const result = referenceItemSchema.safeParse({
      ...validReferenceItem,
      created_at: "2024-01-01T00:00:00Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing candidate_id field", () => {
    const result = referenceItemSchema.safeParse({
      reference_uuid: "ref-uuid-005",
      name: "Test",
      company: null,
      position: null,
      phone: null,
      email: null,
      relationship: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects passing a number for phone (type rejection)", () => {
    const result = referenceItemSchema.safeParse({
      ...validReferenceItem,
      phone: 123456789,
    });
    expect(result.success).toBe(false);
  });

  it("rejects boolean for name (type rejection)", () => {
    const result = referenceItemSchema.safeParse({
      ...validReferenceItem,
      name: false,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// referenceListSchema — output validation
// ---------------------------------------------------------------------------

describe("referenceListSchema", () => {
  it("accepts an array of valid reference items", () => {
    const result = referenceListSchema.safeParse([
      validReferenceItem,
      { ...validReferenceItem, reference_uuid: "ref-uuid-002", name: "Jane Doe" },
    ]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
    }
  });

  it("accepts a single-item array", () => {
    const result = referenceListSchema.safeParse([validReferenceItem]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
    }
  });

  it("accepts an empty array", () => {
    const result = referenceListSchema.safeParse([]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(0);
    }
  });

  it("rejects an array with an invalid item (empty reference_uuid)", () => {
    const result = referenceListSchema.safeParse([
      validReferenceItem,
      { ...validReferenceItem, reference_uuid: "" },
    ]);
    expect(result.success).toBe(false);
  });

  it("rejects non-array input", () => {
    const result = referenceListSchema.safeParse(validReferenceItem);
    expect(result.success).toBe(false);
  });

  it("rejects null input", () => {
    const result = referenceListSchema.safeParse(null);
    expect(result.success).toBe(false);
  });

  it("rejects an array containing a non-object value", () => {
    const result = referenceListSchema.safeParse(["not-an-object"]);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// referenceActionResultSchema — discriminated union
// ---------------------------------------------------------------------------

describe("referenceActionResultSchema", () => {
  // --- success branch ---

  it("accepts a success result with referenceUuid", () => {
    const result = referenceActionResultSchema.safeParse({
      success: true,
      referenceUuid: "ref-uuid-001",
    });
    expect(result.success).toBe(true);
  });

  it("rejects success result with empty referenceUuid", () => {
    const result = referenceActionResultSchema.safeParse({
      success: true,
      referenceUuid: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects success result with missing referenceUuid", () => {
    const result = referenceActionResultSchema.safeParse({
      success: true,
    });
    expect(result.success).toBe(false);
  });

  // --- error branch ---

  it("accepts an error result with error message", () => {
    const result = referenceActionResultSchema.safeParse({
      success: false,
      error: "Reference not found",
    });
    expect(result.success).toBe(true);
  });

  it("rejects error result with empty error message", () => {
    const result = referenceActionResultSchema.safeParse({
      success: false,
      error: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects error result with missing error field", () => {
    const result = referenceActionResultSchema.safeParse({
      success: false,
    });
    expect(result.success).toBe(false);
  });

  // --- cross-branch ---

  it("should reject input with missing discriminator field entirely", () => {
    const result = referenceActionResultSchema.safeParse({
      referenceUuid: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects when success is a string instead of boolean", () => {
    const result = referenceActionResultSchema.safeParse({
      success: "true",
      referenceUuid: "ref-uuid-001",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty object", () => {
    const result = referenceActionResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects null input", () => {
    const result = referenceActionResultSchema.safeParse(null);
    expect(result.success).toBe(false);
  });

  it("rejects undefined input", () => {
    const result = referenceActionResultSchema.safeParse(undefined);
    expect(result.success).toBe(false);
  });
});
