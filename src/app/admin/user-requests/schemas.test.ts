import { describe, it, expect } from "vitest";
import {
  listStoreAssignmentRequestsSchema,
  getStoreAssignmentRequestSchema,
  updateStoreAssignmentRequestStatusSchema,
  storeAssignmentRequestRowSchema,
  listStoreAssignmentRequestsOutputSchema,
  getStoreAssignmentRequestOutputSchema,
  updateStoreAssignmentRequestStatusOutputSchema,
} from "./schemas";

describe("listStoreAssignmentRequestsSchema", () => {
  it("accepts empty input with defaults", () => {
    const r = listStoreAssignmentRequestsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts explicit values", () => {
    const r = listStoreAssignmentRequestsSchema.safeParse({
      page: 2,
      limit: 50,
      status: "approved",
    });
    expect(r.success).toBe(true);
  });

  it("accepts candidateId and storeId filters", () => {
    expect(
      listStoreAssignmentRequestsSchema.safeParse({ candidateId: 123, storeId: 456 }).success,
    ).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(listStoreAssignmentRequestsSchema.safeParse({ status: "invalid" }).success).toBe(false);
  });

  it("rejects rejected status (only pending/approved)", () => {
    expect(listStoreAssignmentRequestsSchema.safeParse({ status: "rejected" }).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(listStoreAssignmentRequestsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listStoreAssignmentRequestsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listStoreAssignmentRequestsSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

describe("getStoreAssignmentRequestSchema", () => {
  it("accepts valid UUID", () => {
    expect(getStoreAssignmentRequestSchema.safeParse({ sarUuid: "sar-001" }).success).toBe(true);
  });

  it("rejects missing sarUuid", () => {
    expect(getStoreAssignmentRequestSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty sarUuid", () => {
    expect(getStoreAssignmentRequestSchema.safeParse({ sarUuid: "" }).success).toBe(false);
  });
});

describe("updateStoreAssignmentRequestStatusSchema", () => {
  it("accepts valid input", () => {
    const r = updateStoreAssignmentRequestStatusSchema.safeParse({
      sarUuid: "sar-001",
      status: "approved",
    });
    expect(r.success).toBe(true);
  });

  it("accepts pending status", () => {
    const r = updateStoreAssignmentRequestStatusSchema.safeParse({
      sarUuid: "sar-001",
      status: "pending",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing sarUuid", () => {
    expect(updateStoreAssignmentRequestStatusSchema.safeParse({ status: "approved" }).success).toBe(false);
  });

  it("rejects empty sarUuid", () => {
    expect(
      updateStoreAssignmentRequestStatusSchema.safeParse({ sarUuid: "", status: "approved" }).success,
    ).toBe(false);
  });

  it("rejects invalid status", () => {
    expect(
      updateStoreAssignmentRequestStatusSchema.safeParse({ sarUuid: "sar-001", status: "invalid" }).success,
    ).toBe(false);
  });
});

describe("storeAssignmentRequestRowSchema", () => {
  const validRow = {
    sar_uuid: "sar-001",
    candidate_id: 101,
    candidate_name: "Candidate One",
    store_id: 201,
    store_name: "Main Branch",
    currency_code: "KWD",
    status: 0,
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:00:00.000Z",
  };

  it("accepts a valid row", () => {
    expect(storeAssignmentRequestRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts null fields", () => {
    expect(
      storeAssignmentRequestRowSchema.safeParse({
        ...validRow,
        candidate_id: null,
        candidate_name: null,
        store_id: null,
        store_name: null,
        currency_code: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing sar_uuid", () => {
    const { sar_uuid: _, ...rest } = validRow;
    expect(storeAssignmentRequestRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty sar_uuid", () => {
    expect(storeAssignmentRequestRowSchema.safeParse({ ...validRow, sar_uuid: "" }).success).toBe(false);
  });
});

describe("listStoreAssignmentRequestsOutputSchema", () => {
  it("accepts valid output", () => {
    const r = listStoreAssignmentRequestsOutputSchema.safeParse({
      items: [
        {
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
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty items", () => {
    expect(
      listStoreAssignmentRequestsOutputSchema.safeParse({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(true);
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

  it("rejects zero page", () => {
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

describe("getStoreAssignmentRequestOutputSchema", () => {
  it("accepts a valid request", () => {
    const r = getStoreAssignmentRequestOutputSchema.safeParse({
      request: {
        sar_uuid: "sar-001",
        candidate_id: null,
        candidate_name: "Candidate One",
        store_id: null,
        store_name: "Main Branch",
        currency_code: "KWD",
        status: 0,
        created_at: null,
        updated_at: null,
      },
    });
    expect(r.success).toBe(true);
  });

  it("accepts null request", () => {
    expect(getStoreAssignmentRequestOutputSchema.safeParse({ request: null }).success).toBe(true);
  });
});

describe("updateStoreAssignmentRequestStatusOutputSchema", () => {
  it("accepts success response", () => {
    expect(
      updateStoreAssignmentRequestStatusOutputSchema.safeParse({ operation: "success", message: "Updated" })
        .success,
    ).toBe(true);
  });

  it("accepts error response", () => {
    expect(
      updateStoreAssignmentRequestStatusOutputSchema.safeParse({ operation: "error", message: "Failed" })
        .success,
    ).toBe(true);
  });

  it("rejects unknown operation", () => {
    expect(
      updateStoreAssignmentRequestStatusOutputSchema.safeParse({ operation: "invalid", message: "Oops" })
        .success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(updateStoreAssignmentRequestStatusOutputSchema.safeParse({ operation: "success" }).success).toBe(
      false,
    );
  });
});
