import { describe, it, expect } from "vitest";
import {
  listRequestsSchema,
  verifyRequestSchema,
  rejectRequestSchema,
} from "./actions";
import type {
  IdRequestListItem,
  IdRequestDetail,
  ListRequestsResult,
  VerifyRequestInput,
  RejectRequestInput,
} from "./actions";

// ---------------------------------------------------------------------------
// Schema tests
// ---------------------------------------------------------------------------

describe("listRequestsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    expect(listRequestsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts pagination params", () => {
    const r = listRequestsSchema.safeParse({ page: 2, limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    expect(listRequestsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listRequestsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("accepts status filter", () => {
    const r = listRequestsSchema.safeParse({ status: "pending" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe("pending");
    }
  });

  it("accepts date range filter", () => {
    const r = listRequestsSchema.safeParse({
      dateFrom: "2024-01-01",
      dateTo: "2024-12-31",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.dateFrom).toBe("2024-01-01");
      expect(r.data.dateTo).toBe("2024-12-31");
    }
  });

  it("defaults page to 1 and limit to 20", () => {
    const defaults = { page: 1, limit: 20 };
    expect(listRequestsSchema.safeParse(defaults).success).toBe(true);
  });
});

describe("verifyRequestSchema", () => {
  it("requires id (cir_uuid)", () => {
    expect(verifyRequestSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty id", () => {
    expect(verifyRequestSchema.safeParse({ id: "" }).success).toBe(false);
  });

  it("accepts valid id", () => {
    const r = verifyRequestSchema.safeParse({ id: "cir_abc123" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.id).toBe("cir_abc123");
    }
  });

  it("accepts optional verification notes", () => {
    const r = verifyRequestSchema.safeParse({
      id: "cir_abc123",
      notes: "All IDs match civil records",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.notes).toBe("All IDs match civil records");
    }
  });
});

describe("rejectRequestSchema", () => {
  it("requires id", () => {
    expect(rejectRequestSchema.safeParse({}).success).toBe(false);
  });

  it("requires reason", () => {
    expect(
      rejectRequestSchema.safeParse({ id: "cir_abc123" }).success,
    ).toBe(false);
  });

  it("rejects empty reason", () => {
    expect(
      rejectRequestSchema.safeParse({
        id: "cir_abc123",
        reason: "",
      }).success,
    ).toBe(false);
  });

  it("accepts valid id + reason", () => {
    const r = rejectRequestSchema.safeParse({
      id: "cir_abc123",
      reason: "Documents do not match civil ID records",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.id).toBe("cir_abc123");
      expect(r.data.reason).toBe(
        "Documents do not match civil ID records",
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

describe("IdRequestListItem type", () => {
  it("has the required shape", () => {
    const item: IdRequestListItem = {
      cir_uuid: "cir_abc123",
      candidate_count: 3,
      status: "pending",
      rejection_reason: null,
      created_at: new Date("2024-06-01T10:00:00.000Z"),
      updated_at: new Date("2024-06-01T12:00:00.000Z"),
      created_by_name: "Staff 1",
    };
    expect(item.cir_uuid).toBe("cir_abc123");
    expect(item.candidate_count).toBe(3);
    expect(item.status).toBe("pending");
    expect(item.rejection_reason).toBeNull();
  });

  it("accepts null values for optional fields", () => {
    const item: IdRequestListItem = {
      cir_uuid: "cir_def456",
      candidate_count: 0,
      status: "rejected",
      rejection_reason: "Invalid docs",
      created_at: null,
      updated_at: null,
      created_by_name: null,
    };
    expect(item.rejection_reason).toBe("Invalid docs");
    expect(item.created_at).toBeNull();
    expect(item.created_by_name).toBeNull();
  });
});

describe("IdRequestDetail type", () => {
  it("has the correct shape", () => {
    const detail: IdRequestDetail = {
      cir_uuid: "cir_abc123",
      status: "pending",
      rejection_reason: null,
      created_at: new Date("2024-06-01T10:00:00.000Z"),
      updated_at: null,
      created_by_name: "Admin User",
      updated_by_name: null,
    };
    expect(detail.cir_uuid).toBe("cir_abc123");
    expect(detail.created_by_name).toBe("Admin User");
  });
});

describe("ListRequestsResult type", () => {
  it("has the correct shape", () => {
    const result: ListRequestsResult = {
      requests: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.requests).toHaveLength(0);
    expect(result.totalPages).toBe(0);
    expect(result.page).toBe(1);
  });
});

describe("VerifyRequestInput type", () => {
  it("accepts the shape", () => {
    const input: VerifyRequestInput = { id: "cir_abc123", notes: "OK" };
    expect(input.id).toBe("cir_abc123");
  });
});

describe("RejectRequestInput type", () => {
  it("accepts the shape", () => {
    const input: RejectRequestInput = { id: "cir_abc123", reason: "Bad docs" };
    expect(input.id).toBe("cir_abc123");
    expect(input.reason).toBe("Bad docs");
  });
});
