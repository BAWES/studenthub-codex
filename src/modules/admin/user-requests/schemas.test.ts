import { describe, it, expect } from "vitest";
import {
  storeAssignmentRequestRowSchema,
  listStoreAssignmentRequestsOutputSchema,
  getStoreAssignmentRequestOutputSchema,
  updateStoreAssignmentRequestStatusOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// storeAssignmentRequestRowSchema
// ---------------------------------------------------------------------------
describe("storeAssignmentRequestRowSchema", () => {
  const validRow = {
    sar_uuid: "sar-001-abc-def",
    candidate_id: 123,
    candidate_name: "Jane Candidate",
    store_id: 456,
    store_name: "Dubai Mall Branch",
    currency_code: "AED",
    status: 0,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
  };

  it("accepts a valid row", () => {
    expect(storeAssignmentRequestRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    expect(
      storeAssignmentRequestRowSchema.safeParse({
        sar_uuid: "sar-002",
        candidate_id: null,
        candidate_name: null,
        store_id: null,
        store_name: null,
        currency_code: null,
        status: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("accepts approved status", () => {
    expect(storeAssignmentRequestRowSchema.safeParse({ ...validRow, status: 1 }).success).toBe(true);
  });

  it("rejects missing sar_uuid", () => {
    const { sar_uuid: _, ...rest } = validRow;
    expect(storeAssignmentRequestRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty sar_uuid", () => {
    expect(storeAssignmentRequestRowSchema.safeParse({ ...validRow, sar_uuid: "" }).success).toBe(false);
  });

  it("rejects wrong type for candidate_id", () => {
    expect(storeAssignmentRequestRowSchema.safeParse({ ...validRow, candidate_id: "abc" }).success).toBe(false);
  });

  it("rejects wrong type for store_id", () => {
    expect(storeAssignmentRequestRowSchema.safeParse({ ...validRow, store_id: "def" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listStoreAssignmentRequestsOutputSchema
// ---------------------------------------------------------------------------
describe("listStoreAssignmentRequestsOutputSchema", () => {
  const validOutput = {
    items: [
      {
        sar_uuid: "sar-001",
        candidate_id: null,
        candidate_name: null,
        store_id: null,
        store_name: null,
        currency_code: null,
        status: null,
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
    expect(listStoreAssignmentRequestsOutputSchema.safeParse(validOutput).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listStoreAssignmentRequestsOutputSchema.safeParse({ ...validOutput, items: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validOutput;
    expect(listStoreAssignmentRequestsOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listStoreAssignmentRequestsOutputSchema.safeParse({ ...validOutput, total: -1 }).success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(listStoreAssignmentRequestsOutputSchema.safeParse({ ...validOutput, totalPages: -1 }).success).toBe(false);
  });

  it("rejects invalid item in array", () => {
    expect(
      listStoreAssignmentRequestsOutputSchema.safeParse({
        ...validOutput,
        items: [{ status: 0 }], // missing sar_uuid
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getStoreAssignmentRequestOutputSchema
// ---------------------------------------------------------------------------
describe("getStoreAssignmentRequestOutputSchema", () => {
  it("accepts a valid request detail", () => {
    expect(
      getStoreAssignmentRequestOutputSchema.safeParse({
        request: {
          sar_uuid: "sar-001",
          candidate_id: 123,
          candidate_name: "Jane",
          store_id: 456,
          store_name: "Store",
          currency_code: "AED",
          status: 0,
          created_at: null,
          updated_at: null,
        },
      }).success,
    ).toBe(true);
  });

  it("accepts null request", () => {
    expect(getStoreAssignmentRequestOutputSchema.safeParse({ request: null }).success).toBe(true);
  });

  it("rejects missing request key", () => {
    expect(getStoreAssignmentRequestOutputSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateStoreAssignmentRequestStatusOutputSchema
// ---------------------------------------------------------------------------
describe("updateStoreAssignmentRequestStatusOutputSchema", () => {
  it("accepts success response", () => {
    expect(updateStoreAssignmentRequestStatusOutputSchema.safeParse({ operation: "success", message: "Updated" }).success).toBe(true);
  });

  it("accepts error response", () => {
    expect(updateStoreAssignmentRequestStatusOutputSchema.safeParse({ operation: "error", message: "Failed" }).success).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(updateStoreAssignmentRequestStatusOutputSchema.safeParse({ message: "No op" }).success).toBe(false);
  });

  it("rejects invalid operation", () => {
    expect(updateStoreAssignmentRequestStatusOutputSchema.safeParse({ operation: "maybe", message: "Bad" }).success).toBe(false);
  });

  it("rejects empty message", () => {
    expect(updateStoreAssignmentRequestStatusOutputSchema.safeParse({ operation: "success", message: "" }).success).toBe(false);
  });
});
