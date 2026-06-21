import { describe, it, expect } from "vitest";
import {
  candidateIdRequestRowSchema,
  listCandidateIdRequestsOutputSchema,
  getCandidateIdRequestOutputSchema,
  updateCandidateIdRequestStatusOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// candidateIdRequestRowSchema
// ---------------------------------------------------------------------------
describe("candidateIdRequestRowSchema", () => {
  const validRow = {
    cir_uuid: "cir-001-abc-def-123",
    candidate_ids: "123,456,789",
    status: "pending",
    rejection_reason: null,
    created_by_name: "John Staff",
    updated_by_name: null,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
  };

  it("accepts a valid row", () => {
    expect(candidateIdRequestRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    expect(
      candidateIdRequestRowSchema.safeParse({
        cir_uuid: "cir-002",
        candidate_ids: null,
        status: null,
        rejection_reason: null,
        created_by_name: null,
        updated_by_name: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing cir_uuid", () => {
    const { cir_uuid: _, ...rest } = validRow;
    expect(candidateIdRequestRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty cir_uuid", () => {
    expect(candidateIdRequestRowSchema.safeParse({ ...validRow, cir_uuid: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCandidateIdRequestsOutputSchema
// ---------------------------------------------------------------------------
describe("listCandidateIdRequestsOutputSchema", () => {
  const validOutput = {
    items: [
      {
        cir_uuid: "cir-001",
        candidate_ids: "123,456",
        status: "pending",
        rejection_reason: null,
        created_by_name: "John",
        updated_by_name: null,
        created_at: null,
        updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid list output", () => {
    expect(listCandidateIdRequestsOutputSchema.safeParse(validOutput).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listCandidateIdRequestsOutputSchema.safeParse({ ...validOutput, items: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validOutput;
    expect(listCandidateIdRequestsOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listCandidateIdRequestsOutputSchema.safeParse({ ...validOutput, total: -1 }).success).toBe(false);
  });

  it("rejects invalid item in array", () => {
    expect(
      listCandidateIdRequestsOutputSchema.safeParse({
        ...validOutput,
        items: [{ status: "pending" }], // missing cir_uuid
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCandidateIdRequestOutputSchema
// ---------------------------------------------------------------------------
describe("getCandidateIdRequestOutputSchema", () => {
  it("accepts a valid request detail", () => {
    expect(
      getCandidateIdRequestOutputSchema.safeParse({
        request: {
          cir_uuid: "cir-001",
          candidate_ids: "123",
          status: "approved",
          rejection_reason: null,
          created_by_name: "Staff",
          updated_by_name: null,
          created_at: "2025-01-15T10:00:00Z",
          updated_at: null,
        },
      }).success,
    ).toBe(true);
  });

  it("accepts null request", () => {
    expect(getCandidateIdRequestOutputSchema.safeParse({ request: null }).success).toBe(true);
  });

  it("rejects missing request key", () => {
    expect(getCandidateIdRequestOutputSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCandidateIdRequestStatusOutputSchema
// ---------------------------------------------------------------------------
describe("updateCandidateIdRequestStatusOutputSchema", () => {
  it("accepts success response", () => {
    expect(updateCandidateIdRequestStatusOutputSchema.safeParse({ operation: "success", message: "Updated" }).success).toBe(true);
  });

  it("accepts error response", () => {
    expect(updateCandidateIdRequestStatusOutputSchema.safeParse({ operation: "error", message: "Failed" }).success).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(updateCandidateIdRequestStatusOutputSchema.safeParse({ message: "No op" }).success).toBe(false);
  });

  it("rejects invalid operation value", () => {
    expect(updateCandidateIdRequestStatusOutputSchema.safeParse({ operation: "invalid", message: "Bad" }).success).toBe(false);
  });

  it("rejects empty message", () => {
    expect(updateCandidateIdRequestStatusOutputSchema.safeParse({ operation: "success", message: "" }).success).toBe(false);
  });
});
