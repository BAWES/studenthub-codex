import { describe, it, expect } from "vitest";

import {
  listStoreAssignmentRequestsSchema,
  getStoreAssignmentRequestSchema,
  updateStoreAssignmentRequestStatusSchema,
  storeAssignmentRequestRowSchema,
  listStoreAssignmentRequestsOutputSchema,
  getStoreAssignmentRequestOutputSchema,
  updateStoreAssignmentRequestStatusOutputSchema,
  type StoreAssignmentRequestRow,
  type ListStoreAssignmentRequestsOutput,
  type GetStoreAssignmentRequestOutput,
  type UpdateStoreAssignmentRequestStatusOutput,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema: listStoreAssignmentRequestsSchema
// ---------------------------------------------------------------------------

describe("listStoreAssignmentRequestsSchema", () => {
  it("accepts default values when no params provided", () => {
    const result = listStoreAssignmentRequestsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.candidateId).toBeUndefined();
      expect(result.data.storeId).toBeUndefined();
      expect(result.data.status).toBeUndefined();
    }
  });

  it("accepts all optional filters", () => {
    const result = listStoreAssignmentRequestsSchema.safeParse({
      page: "2",
      limit: "50",
      candidateId: "100",
      storeId: "5",
      status: "approved",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
      expect(result.data.candidateId).toBe(100);
      expect(result.data.storeId).toBe(5);
      expect(result.data.status).toBe("approved");
    }
  });

  it("accepts pending status filter", () => {
    const result = listStoreAssignmentRequestsSchema.safeParse({
      status: "pending",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe("pending");
  });

  it("rejects invalid status value", () => {
    expect(
      listStoreAssignmentRequestsSchema.safeParse({ status: "invalid" })
        .success,
    ).toBe(false);
  });

  it("rejects page less than 1", () => {
    expect(
      listStoreAssignmentRequestsSchema.safeParse({ page: "0" }).success,
    ).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    expect(
      listStoreAssignmentRequestsSchema.safeParse({ limit: "101" }).success,
    ).toBe(false);
  });

  it("rejects limit less than 1", () => {
    expect(
      listStoreAssignmentRequestsSchema.safeParse({ limit: "0" }).success,
    ).toBe(false);
  });

  it("rejects non-positive candidateId", () => {
    expect(
      listStoreAssignmentRequestsSchema.safeParse({
        candidateId: "0",
      }).success,
    ).toBe(false);
  });

  it("rejects non-positive storeId", () => {
    expect(
      listStoreAssignmentRequestsSchema.safeParse({ storeId: "0" }).success,
    ).toBe(false);
  });

  it("coerces string numbers to integers", () => {
    const result = listStoreAssignmentRequestsSchema.safeParse({
      page: "3",
      candidateId: "42",
      storeId: "7",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.candidateId).toBe(42);
      expect(result.data.storeId).toBe(7);
    }
  });
});

// ---------------------------------------------------------------------------
// Input schema: getStoreAssignmentRequestSchema
// ---------------------------------------------------------------------------

describe("getStoreAssignmentRequestSchema", () => {
  it("accepts valid UUID", () => {
    const result = getStoreAssignmentRequestSchema.safeParse({
      sarUuid: "sar-123",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.sarUuid).toBe("sar-123");
  });

  it("rejects empty UUID", () => {
    expect(
      getStoreAssignmentRequestSchema.safeParse({ sarUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects missing sarUuid", () => {
    expect(getStoreAssignmentRequestSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: updateStoreAssignmentRequestStatusSchema
// ---------------------------------------------------------------------------

describe("updateStoreAssignmentRequestStatusSchema", () => {
  it("accepts valid approved status", () => {
    const result = updateStoreAssignmentRequestStatusSchema.safeParse({
      sarUuid: "sar-123",
      status: "approved",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sarUuid).toBe("sar-123");
      expect(result.data.status).toBe("approved");
    }
  });

  it("accepts pending status", () => {
    const result = updateStoreAssignmentRequestStatusSchema.safeParse({
      sarUuid: "sar-123",
      status: "pending",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status value", () => {
    expect(
      updateStoreAssignmentRequestStatusSchema.safeParse({
        sarUuid: "sar-123",
        status: "rejected",
      }).success,
    ).toBe(false);
  });

  it("rejects empty sarUuid", () => {
    expect(
      updateStoreAssignmentRequestStatusSchema.safeParse({
        sarUuid: "",
        status: "approved",
      }).success,
    ).toBe(false);
  });

  it("rejects missing sarUuid", () => {
    expect(
      updateStoreAssignmentRequestStatusSchema.safeParse({
        status: "approved",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: storeAssignmentRequestRowSchema
// ---------------------------------------------------------------------------

describe("storeAssignmentRequestRowSchema", () => {
  it("accepts a valid row with all fields", () => {
    const result = storeAssignmentRequestRowSchema.safeParse({
      sar_uuid: "sar-001",
      candidate_id: 123,
      candidate_name: "John Doe",
      store_id: 5,
      store_name: "Store A",
      currency_code: "KWD",
      status: 0,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a row with null fields", () => {
    const result = storeAssignmentRequestRowSchema.safeParse({
      sar_uuid: "sar-002",
      candidate_id: null,
      candidate_name: null,
      store_id: null,
      store_name: null,
      currency_code: null,
      status: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing sar_uuid", () => {
    expect(storeAssignmentRequestRowSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty sar_uuid", () => {
    expect(
      storeAssignmentRequestRowSchema.safeParse({
        sar_uuid: "",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: listStoreAssignmentRequestsOutputSchema
// ---------------------------------------------------------------------------

describe("listStoreAssignmentRequestsOutputSchema", () => {
  const validRow = {
    sar_uuid: "sar-001",
    candidate_id: null,
    candidate_name: null,
    store_id: null,
    store_name: null,
    currency_code: null,
    status: 0,
    created_at: null,
    updated_at: null,
  };

  it("accepts a valid list result", () => {
    const result = listStoreAssignmentRequestsOutputSchema.safeParse({
      items: [validRow],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.items).toHaveLength(1);
  });

  it("accepts empty results", () => {
    const result = listStoreAssignmentRequestsOutputSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listStoreAssignmentRequestsOutputSchema.safeParse({
        items: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects missing items array", () => {
    expect(
      listStoreAssignmentRequestsOutputSchema.safeParse({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects non-positive page", () => {
    expect(
      listStoreAssignmentRequestsOutputSchema.safeParse({
        items: [],
        total: 0,
        page: 0,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: getStoreAssignmentRequestOutputSchema
// ---------------------------------------------------------------------------

describe("getStoreAssignmentRequestOutputSchema", () => {
  it("accepts a valid request", () => {
    const result = getStoreAssignmentRequestOutputSchema.safeParse({
      request: {
        sar_uuid: "sar-001",
        candidate_id: null,
        candidate_name: null,
        store_id: null,
        store_name: null,
        currency_code: null,
        status: 0,
        created_at: null,
        updated_at: null,
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts null request (not found)", () => {
    const result = getStoreAssignmentRequestOutputSchema.safeParse({
      request: null,
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output schema: updateStoreAssignmentRequestStatusOutputSchema
// ---------------------------------------------------------------------------

describe("updateStoreAssignmentRequestStatusOutputSchema", () => {
  it("accepts a success response", () => {
    const result = updateStoreAssignmentRequestStatusOutputSchema.safeParse({
      operation: "success",
      message: "Status updated",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an error response", () => {
    const result = updateStoreAssignmentRequestStatusOutputSchema.safeParse({
      operation: "error",
      message: "Failed to update",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid operation", () => {
    expect(
      updateStoreAssignmentRequestStatusOutputSchema.safeParse({
        operation: "invalid",
        message: "test",
      }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      updateStoreAssignmentRequestStatusOutputSchema.safeParse({
        operation: "success",
      }).success,
    ).toBe(false);
  });

  it("rejects empty message", () => {
    expect(
      updateStoreAssignmentRequestStatusOutputSchema.safeParse({
        operation: "error",
        message: "",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape verification
// ---------------------------------------------------------------------------

describe("StoreAssignmentRequestRow type shape", () => {
  it("conforms to expected structure", () => {
    const row: StoreAssignmentRequestRow = {
      sar_uuid: "sar-001",
      candidate_id: 123,
      candidate_name: "John Doe",
      store_id: 5,
      store_name: "Store A",
      currency_code: "KWD",
      status: 0,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    expect(row.sar_uuid).toBe("sar-001");
    expect(row.status).toBe(0);
  });

  it("supports null fields", () => {
    const row: StoreAssignmentRequestRow = {
      sar_uuid: "sar-002",
      candidate_id: null,
      candidate_name: null,
      store_id: null,
      store_name: null,
      currency_code: null,
      status: null,
      created_at: null,
      updated_at: null,
    };
    expect(row.candidate_id).toBeNull();
  });
});

describe("ListStoreAssignmentRequestsOutput type shape", () => {
  it("conforms to expected structure", () => {
    const result: ListStoreAssignmentRequestsOutput = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
  });
});

describe("GetStoreAssignmentRequestOutput type shape", () => {
  it("supports found request", () => {
    const row: StoreAssignmentRequestRow = {
      sar_uuid: "sar-001",
      candidate_id: null,
      candidate_name: null,
      store_id: null,
      store_name: null,
      currency_code: null,
      status: null,
      created_at: null,
      updated_at: null,
    };
    const r: GetStoreAssignmentRequestOutput = { request: row };
    expect(r.request).not.toBeNull();
  });

  it("supports null request", () => {
    const r: GetStoreAssignmentRequestOutput = { request: null };
    expect(r.request).toBeNull();
  });
});

describe("UpdateStoreAssignmentRequestStatusOutput type shape", () => {
  it("supports success", () => {
    const r: UpdateStoreAssignmentRequestStatusOutput = {
      operation: "success",
      message: "Updated",
    };
    expect(r.operation).toBe("success");
  });

  it("supports error", () => {
    const r: UpdateStoreAssignmentRequestStatusOutput = {
      operation: "error",
      message: "Failed",
    };
    expect(r.operation).toBe("error");
  });
});
