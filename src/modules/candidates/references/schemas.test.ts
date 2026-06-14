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
  const validItem = () => ({
    reference_uuid: "ref-001",
    candidate_id: 123,
    name: "Jane Smith",
    company: "Acme Corp",
    position: "Manager",
    phone: "+965 5555 6789",
    email: "jane@acme.com",
    relationship: "Former supervisor",
    created_at: new Date("2026-06-01"),
    updated_at: new Date("2026-06-10"),
  });

  it("accepts a valid reference item", () => {
    const r = candidateReferenceItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = candidateReferenceItemSchema.safeParse({
      ...validItem(),
      candidate_id: null,
      company: null,
      position: null,
      phone: null,
      email: null,
      relationship: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing reference_uuid", () => {
    const { reference_uuid: _, ...rest } = validItem();
    expect(candidateReferenceItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string name", () => {
    expect(
      candidateReferenceItemSchema.safeParse({ ...validItem(), name: 42 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCandidateReferencesResultSchema
// ---------------------------------------------------------------------------

describe("listCandidateReferencesResultSchema", () => {
  const validItem = () => ({
    reference_uuid: "r-1",
    candidate_id: null, name: "Ref", company: null, position: null,
    phone: null, email: null, relationship: null,
    created_at: null, updated_at: null,
  });

  it("accepts a valid paginated result", () => {
    const r = listCandidateReferencesResultSchema.safeParse({
      items: [validItem()], total: 1, page: 1, pageSize: 20,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty items", () => {
    const r = listCandidateReferencesResultSchema.safeParse({
      items: [], total: 0, page: 1, pageSize: 20,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing total", () => {
    const r = listCandidateReferencesResultSchema.safeParse({
      items: [], page: 1, pageSize: 20,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateReferenceActionResultSchema
// ---------------------------------------------------------------------------

describe("candidateReferenceActionResultSchema", () => {
  it("accepts success with referenceUuid", () => {
    const r = candidateReferenceActionResultSchema.safeParse({ success: true, referenceUuid: "ref-001" });
    expect(r.success).toBe(true);
  });

  it("rejects success without referenceUuid", () => {
    const r = candidateReferenceActionResultSchema.safeParse({ success: true });
    expect(r.success).toBe(false);
  });

  it("accepts failure with error", () => {
    const r = candidateReferenceActionResultSchema.safeParse({ success: false, error: "Failed" });
    expect(r.success).toBe(true);
  });

  it("rejects failure without error", () => {
    const r = candidateReferenceActionResultSchema.safeParse({ success: false });
    expect(r.success).toBe(false);
  });
});
