import { describe, it, expect } from "vitest";

import {
  listCandidateIdRequestsSchema,
  getCandidateIdRequestSchema,
  updateCandidateIdRequestStatusSchema,
  candidateIdRequestRowSchema,
  listCandidateIdRequestsOutputSchema,
  getCandidateIdRequestOutputSchema,
  updateCandidateIdRequestStatusOutputSchema,
  type CandidateIdRequestRow,
  type ListCandidateIdRequestsOutput,
  type GetCandidateIdRequestOutput,
  type UpdateCandidateIdRequestStatusOutput,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema: listCandidateIdRequestsSchema
// ---------------------------------------------------------------------------

describe("listCandidateIdRequestsSchema", () => {
  it("accepts default values when no params provided", () => {
    const result = listCandidateIdRequestsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.status).toBeUndefined();
    }
  });

  it("accepts explicit page, limit, and status filter", () => {
    const result = listCandidateIdRequestsSchema.safeParse({
      page: "2",
      limit: "50",
      status: "pending",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
      expect(result.data.status).toBe("pending");
    }
  });

  it("accepts approved status filter", () => {
    const result = listCandidateIdRequestsSchema.safeParse({
      status: "approved",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe("approved");
  });

  it("accepts rejected status filter", () => {
    const result = listCandidateIdRequestsSchema.safeParse({
      status: "rejected",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe("rejected");
  });

  it("rejects invalid status value", () => {
    expect(
      listCandidateIdRequestsSchema.safeParse({ status: "invalid" }).success,
    ).toBe(false);
  });

  it("rejects page less than 1", () => {
    expect(
      listCandidateIdRequestsSchema.safeParse({ page: "0" }).success,
    ).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    expect(
      listCandidateIdRequestsSchema.safeParse({ limit: "101" }).success,
    ).toBe(false);
  });

  it("rejects limit less than 1", () => {
    expect(
      listCandidateIdRequestsSchema.safeParse({ limit: "0" }).success,
    ).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listCandidateIdRequestsSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.page).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Input schema: getCandidateIdRequestSchema
// ---------------------------------------------------------------------------

describe("getCandidateIdRequestSchema", () => {
  it("accepts valid UUID", () => {
    const result = getCandidateIdRequestSchema.safeParse({
      cirUuid: "abc-123-def",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.cirUuid).toBe("abc-123-def");
  });

  it("rejects empty UUID", () => {
    expect(
      getCandidateIdRequestSchema.safeParse({ cirUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects missing cirUuid", () => {
    expect(getCandidateIdRequestSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: updateCandidateIdRequestStatusSchema
// ---------------------------------------------------------------------------

describe("updateCandidateIdRequestStatusSchema", () => {
  it("accepts valid approved status", () => {
    const result = updateCandidateIdRequestStatusSchema.safeParse({
      cirUuid: "abc-123",
      status: "approved",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cirUuid).toBe("abc-123");
      expect(result.data.status).toBe("approved");
      expect(result.data.rejectionReason).toBeUndefined();
    }
  });

  it("accepts rejected status with rejection reason", () => {
    const result = updateCandidateIdRequestStatusSchema.safeParse({
      cirUuid: "abc-123",
      status: "rejected",
      rejectionReason: "Invalid documentation provided",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("rejected");
      expect(result.data.rejectionReason).toBe(
        "Invalid documentation provided",
      );
    }
  });

  it("accepts pending status", () => {
    const result = updateCandidateIdRequestStatusSchema.safeParse({
      cirUuid: "abc-123",
      status: "pending",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status value", () => {
    expect(
      updateCandidateIdRequestStatusSchema.safeParse({
        cirUuid: "abc-123",
        status: "invalid",
      }).success,
    ).toBe(false);
  });

  it("rejects empty cirUuid", () => {
    expect(
      updateCandidateIdRequestStatusSchema.safeParse({
        cirUuid: "",
        status: "approved",
      }).success,
    ).toBe(false);
  });

  it("rejects missing cirUuid", () => {
    expect(
      updateCandidateIdRequestStatusSchema.safeParse({
        status: "approved",
      }).success,
    ).toBe(false);
  });

  it("rejects rejectionReason exceeding 1000 chars", () => {
    expect(
      updateCandidateIdRequestStatusSchema.safeParse({
        cirUuid: "abc-123",
        status: "rejected",
        rejectionReason: "X".repeat(1001),
      }).success,
    ).toBe(false);
  });

  it("accepts rejectionReason at exactly 1000 chars", () => {
    const result = updateCandidateIdRequestStatusSchema.safeParse({
      cirUuid: "abc-123",
      status: "rejected",
      rejectionReason: "X".repeat(1000),
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output schema: candidateIdRequestRowSchema
// ---------------------------------------------------------------------------

describe("candidateIdRequestRowSchema", () => {
  it("accepts a valid row with all fields", () => {
    const result = candidateIdRequestRowSchema.safeParse({
      cir_uuid: "cir-001",
      candidate_ids: "123,456",
      status: "pending",
      rejection_reason: null,
      created_by_name: "Admin User",
      updated_by_name: "Admin User",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a row with null fields", () => {
    const result = candidateIdRequestRowSchema.safeParse({
      cir_uuid: "cir-002",
      candidate_ids: null,
      status: null,
      rejection_reason: null,
      created_by_name: null,
      updated_by_name: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing cir_uuid", () => {
    expect(
      candidateIdRequestRowSchema.safeParse({
        candidate_ids: null,
        status: null,
        rejection_reason: null,
        created_by_name: null,
        updated_by_name: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(false);
  });

  it("rejects empty cir_uuid", () => {
    expect(
      candidateIdRequestRowSchema.safeParse({
        cir_uuid: "",
        candidate_ids: null,
        status: null,
        rejection_reason: null,
        created_by_name: null,
        updated_by_name: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: listCandidateIdRequestsOutputSchema
// ---------------------------------------------------------------------------

describe("listCandidateIdRequestsOutputSchema", () => {
  const validRow = {
    cir_uuid: "cir-001",
    candidate_ids: "123",
    status: "pending",
    rejection_reason: null,
    created_by_name: "Admin",
    updated_by_name: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: null,
  };

  it("accepts a valid list result", () => {
    const result = listCandidateIdRequestsOutputSchema.safeParse({
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
    const result = listCandidateIdRequestsOutputSchema.safeParse({
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
      listCandidateIdRequestsOutputSchema.safeParse({
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
      listCandidateIdRequestsOutputSchema.safeParse({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects non-positive page", () => {
    expect(
      listCandidateIdRequestsOutputSchema.safeParse({
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
// Output schema: getCandidateIdRequestOutputSchema
// ---------------------------------------------------------------------------

describe("getCandidateIdRequestOutputSchema", () => {
  it("accepts a valid request", () => {
    const result = getCandidateIdRequestOutputSchema.safeParse({
      request: {
        cir_uuid: "cir-001",
        candidate_ids: "123",
        status: "pending",
        rejection_reason: null,
        created_by_name: "Admin",
        updated_by_name: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: null,
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts null request (not found)", () => {
    const result = getCandidateIdRequestOutputSchema.safeParse({
      request: null,
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output schema: updateCandidateIdRequestStatusOutputSchema
// ---------------------------------------------------------------------------

describe("updateCandidateIdRequestStatusOutputSchema", () => {
  it("accepts a success response", () => {
    const result = updateCandidateIdRequestStatusOutputSchema.safeParse({
      operation: "success",
      message: "Status updated",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an error response", () => {
    const result = updateCandidateIdRequestStatusOutputSchema.safeParse({
      operation: "error",
      message: "Failed to update",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid operation", () => {
    expect(
      updateCandidateIdRequestStatusOutputSchema.safeParse({
        operation: "invalid",
        message: "test",
      }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      updateCandidateIdRequestStatusOutputSchema.safeParse({
        operation: "success",
      }).success,
    ).toBe(false);
  });

  it("rejects empty message", () => {
    expect(
      updateCandidateIdRequestStatusOutputSchema.safeParse({
        operation: "error",
        message: "",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape verification
// ---------------------------------------------------------------------------

describe("CandidateIdRequestRow type shape", () => {
  it("conforms to expected structure", () => {
    const row: CandidateIdRequestRow = {
      cir_uuid: "cir-001",
      candidate_ids: "123",
      status: "pending",
      rejection_reason: null,
      created_by_name: "Admin",
      updated_by_name: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: null,
    };
    expect(row.cir_uuid).toBe("cir-001");
    expect(row.status).toBe("pending");
  });

  it("supports null fields", () => {
    const row: CandidateIdRequestRow = {
      cir_uuid: "cir-002",
      candidate_ids: null,
      status: null,
      rejection_reason: null,
      created_by_name: null,
      updated_by_name: null,
      created_at: null,
      updated_at: null,
    };
    expect(row.candidate_ids).toBeNull();
  });
});

describe("ListCandidateIdRequestsOutput type shape", () => {
  it("conforms to expected structure", () => {
    const result: ListCandidateIdRequestsOutput = {
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

describe("GetCandidateIdRequestOutput type shape", () => {
  it("supports found request", () => {
    const r: GetCandidateIdRequestOutput = {
      request: {
        cir_uuid: "cir-001",
        candidate_ids: null,
        status: null,
        rejection_reason: null,
        created_by_name: null,
        updated_by_name: null,
        created_at: null,
        updated_at: null,
      },
    };
    expect(r.request).not.toBeNull();
  });

  it("supports null request", () => {
    const r: GetCandidateIdRequestOutput = { request: null };
    expect(r.request).toBeNull();
  });
});

describe("UpdateCandidateIdRequestStatusOutput type shape", () => {
  it("supports success", () => {
    const r: UpdateCandidateIdRequestStatusOutput = {
      operation: "success",
      message: "Updated",
    };
    expect(r.operation).toBe("success");
  });

  it("supports error", () => {
    const r: UpdateCandidateIdRequestStatusOutput = {
      operation: "error",
      message: "Failed",
    };
    expect(r.operation).toBe("error");
  });
});
