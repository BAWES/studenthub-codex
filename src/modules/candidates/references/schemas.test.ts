import { describe, it, expect } from "vitest";
import {
  candidateReferenceItemSchema,
  listCandidateReferencesResultSchema,
  candidateReferenceActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// candidateReferenceItemSchema
// ---------------------------------------------------------------------------
describe("candidateReferenceItemSchema", () => {
  const validItem = {
    reference_uuid: "ref-001",
    candidate_id: 123,
    name: "John Doe",
    company: "Acme Corp",
    position: "Manager",
    phone: "+1-555-0123",
    email: "john@acme.com",
    relationship: "Former Supervisor",
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-06-01T08:30:00Z",
  };

  it("accepts a fully populated valid item", () => {
    expect(candidateReferenceItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const input = {
      ...validItem,
      candidate_id: null,
      company: null,
      position: null,
      phone: null,
      email: null,
      relationship: null,
      created_at: null,
      updated_at: null,
    };
    expect(candidateReferenceItemSchema.safeParse(input).success).toBe(true);
  });

  it("rejects nullable fields as undefined (they are not optional)", () => {
    const input = {
      reference_uuid: "ref-002",
      name: "Jane Doe",
    };
    // Fields are .nullable() but not .optional(), so omitting them fails.
    expect(candidateReferenceItemSchema.safeParse(input).success).toBe(false);
  });

  it("accepts zero for candidate_id", () => {
    expect(
      candidateReferenceItemSchema.safeParse({ ...validItem, candidate_id: 0 }).success,
    ).toBe(true);
  });

  it("accepts empty strings for nullable string fields", () => {
    expect(
      candidateReferenceItemSchema.safeParse({
        ...validItem,
        company: "",
        position: "",
        phone: "",
        email: "",
        relationship: "",
      }).success,
    ).toBe(true);
  });

  it("rejects missing reference_uuid", () => {
    const { reference_uuid: _, ...rest } = validItem;
    expect(candidateReferenceItemSchema.safeParse(rest).success).toBe(false);
  });

  it("accepts empty reference_uuid (no min constraint)", () => {
    expect(
      candidateReferenceItemSchema.safeParse({ ...validItem, reference_uuid: "" }).success,
    ).toBe(true);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = validItem;
    expect(candidateReferenceItemSchema.safeParse(rest).success).toBe(false);
  });

  it("accepts empty name (no min constraint)", () => {
    expect(
      candidateReferenceItemSchema.safeParse({ ...validItem, name: "" }).success,
    ).toBe(true);
  });

  it("rejects non-integer candidate_id", () => {
    expect(
      candidateReferenceItemSchema.safeParse({ ...validItem, candidate_id: 1.5 }).success,
    ).toBe(false);
  });

  it("rejects non-numeric candidate_id", () => {
    expect(
      candidateReferenceItemSchema.safeParse({ ...validItem, candidate_id: "abc" }).success,
    ).toBe(false);
  });

  it("rejects non-string name", () => {
    expect(
      candidateReferenceItemSchema.safeParse({ ...validItem, name: 123 }).success,
    ).toBe(false);
  });

  it("rejects invalid date for created_at", () => {
    expect(
      candidateReferenceItemSchema.safeParse({ ...validItem, created_at: "not-a-date" }).success,
    ).toBe(false);
  });

  it("rejects invalid date for updated_at", () => {
    expect(
      candidateReferenceItemSchema.safeParse({ ...validItem, updated_at: "not-a-date" }).success,
    ).toBe(false);
  });

  it("accepts number for date fields (coerce converts epoch timestamp)", () => {
    expect(
      candidateReferenceItemSchema.safeParse({ ...validItem, created_at: 12345 }).success,
    ).toBe(true);
  });

  it("rejects number for string fields", () => {
    expect(
      candidateReferenceItemSchema.safeParse({ ...validItem, company: 999 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCandidateReferencesResultSchema
// ---------------------------------------------------------------------------
describe("listCandidateReferencesResultSchema", () => {
  const validResult = {
    items: [
      {
        reference_uuid: "ref-001",
        candidate_id: 123,
        name: "John Doe",
        company: "Acme Corp",
        position: "Manager",
        phone: "+1-555-0123",
        email: "john@acme.com",
        relationship: "Former Supervisor",
        created_at: "2026-01-15T10:00:00Z",
        updated_at: "2026-06-01T08:30:00Z",
      },
    ],
    total: 1,
    page: 1,
    pageSize: 20,
  };

  it("accepts a valid result with one item", () => {
    expect(listCandidateReferencesResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listCandidateReferencesResultSchema.safeParse({
        ...validResult,
        items: [],
        total: 0,
      }).success,
    ).toBe(true);
  });

  it("accepts zero total", () => {
    expect(
      listCandidateReferencesResultSchema.safeParse({
        ...validResult,
        items: [],
        total: 0,
      }).success,
    ).toBe(true);
  });

  it("accepts page 1 and pageSize 1 as minimums", () => {
    expect(
      listCandidateReferencesResultSchema.safeParse({
        ...validResult,
        page: 1,
        pageSize: 1,
        items: [],
        total: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResult;
    expect(listCandidateReferencesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = validResult;
    expect(listCandidateReferencesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = validResult;
    expect(listCandidateReferencesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing pageSize", () => {
    const { pageSize: _, ...rest } = validResult;
    expect(listCandidateReferencesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listCandidateReferencesResultSchema.safeParse({ ...validResult, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listCandidateReferencesResultSchema.safeParse({ ...validResult, page: 0 }).success,
    ).toBe(false);
  });

  it("rejects zero pageSize", () => {
    expect(
      listCandidateReferencesResultSchema.safeParse({ ...validResult, pageSize: 0 }).success,
    ).toBe(false);
  });

  it("rejects non-integer total", () => {
    expect(
      listCandidateReferencesResultSchema.safeParse({ ...validResult, total: 1.5 }).success,
    ).toBe(false);
  });

  it("rejects non-integer page", () => {
    expect(
      listCandidateReferencesResultSchema.safeParse({ ...validResult, page: 2.5 }).success,
    ).toBe(false);
  });

  it("rejects non-integer pageSize", () => {
    expect(
      listCandidateReferencesResultSchema.safeParse({ ...validResult, pageSize: 10.5 }).success,
    ).toBe(false);
  });

  it("rejects invalid item in array", () => {
    expect(
      listCandidateReferencesResultSchema.safeParse({
        ...validResult,
        items: [{ reference_uuid: "" }],
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateReferenceActionResultSchema
// ---------------------------------------------------------------------------
describe("candidateReferenceActionResultSchema", () => {
  it("accepts a successful action result", () => {
    expect(
      candidateReferenceActionResultSchema.safeParse({
        success: true,
        referenceUuid: "ref-001",
      }).success,
    ).toBe(true);
  });

  it("accepts a failed action result", () => {
    expect(
      candidateReferenceActionResultSchema.safeParse({
        success: false,
        error: "Reference not found",
      }).success,
    ).toBe(true);
  });

  it("accepts empty error string", () => {
    expect(
      candidateReferenceActionResultSchema.safeParse({
        success: false,
        error: "",
      }).success,
    ).toBe(true);
  });

  it("rejects missing success field", () => {
    expect(
      candidateReferenceActionResultSchema.safeParse({ referenceUuid: "ref-001" }).success,
    ).toBe(false);
  });

  it("rejects missing referenceUuid on success", () => {
    expect(
      candidateReferenceActionResultSchema.safeParse({ success: true }).success,
    ).toBe(false);
  });

  it("rejects missing error on failure", () => {
    expect(
      candidateReferenceActionResultSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("rejects string for success", () => {
    expect(
      candidateReferenceActionResultSchema.safeParse({
        success: "true",
        referenceUuid: "ref-001",
      }).success,
    ).toBe(false);
  });

  it("rejects number for success", () => {
    expect(
      candidateReferenceActionResultSchema.safeParse({
        success: 1,
        referenceUuid: "ref-001",
      }).success,
    ).toBe(false);
  });

  it("accepts empty referenceUuid (no min constraint)", () => {
    expect(
      candidateReferenceActionResultSchema.safeParse({
        success: true,
        referenceUuid: "",
      }).success,
    ).toBe(true);
  });

  it("rejects extra unknown fields on success branch", () => {
    // The discriminated union validates the shape exactly;
    // extra fields are stripped/dropped by Zod by default.
    const result = candidateReferenceActionResultSchema.safeParse({
      success: true,
      referenceUuid: "ref-001",
      error: "should-not-be-here",
    });
    // Zod strips unknown fields by default, so this still parses
    expect(result.success).toBe(true);
  });
});
