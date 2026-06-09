import { describe, it, expect } from "vitest";
import {
  listRequestsSchema,
  getRequestSchema,
  updateRequestStatusSchema,
} from "./actions";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("listRequestsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listRequestsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination and filter params", () => {
    const r = listRequestsSchema.safeParse({
      page: 2,
      limit: 10,
      companyId: 5,
      status: "started",
      q: "developer",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
      expect(r.data.companyId).toBe(5);
      expect(r.data.status).toBe("started");
      expect(r.data.q).toBe("developer");
    }
  });

  it("rejects limit over 100", () => {
    expect(listRequestsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listRequestsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects invalid status enum value", () => {
    const r = listRequestsSchema.safeParse({ status: "invalid_status" });
    expect(r.success).toBe(false);
  });

  it("accepts all valid status values", () => {
    const valid = ["pending", "started", "delivered", "cancelled", "finished_by_recruitment", "re_work"];
    for (const s of valid) {
      expect(listRequestsSchema.safeParse({ status: s }).success).toBe(true);
    }
  });

  it("coerces string page/limit to numbers", () => {
    const r = listRequestsSchema.safeParse({ page: "3", limit: "25" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(25);
    }
  });
});

describe("getRequestSchema", () => {
  it("accepts a valid UUID", () => {
    const r = getRequestSchema.safeParse({
      requestUuid: "req_12345678-90ab-cdef-1234-567890abcdef",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getRequestSchema.safeParse({ requestUuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getRequestSchema.safeParse({}).success).toBe(false);
  });
});

describe("updateRequestStatusSchema", () => {
  it("accepts valid UUID and status", () => {
    const r = updateRequestStatusSchema.safeParse({
      requestUuid: "req_uuid_12345",
      status: "delivered",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe("delivered");
    }
  });

  it("accepts optional feedback with delivered", () => {
    const r = updateRequestStatusSchema.safeParse({
      requestUuid: "req_uuid_12345",
      status: "delivered",
      feedback: "Candidate accepted terms",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.feedback).toBe("Candidate accepted terms");
    }
  });

  it("rejects missing UUID", () => {
    expect(updateRequestStatusSchema.safeParse({ status: "pending" }).success).toBe(false);
  });

  it("rejects missing status", () => {
    expect(updateRequestStatusSchema.safeParse({ requestUuid: "abc" }).success).toBe(false);
  });

  it("rejects invalid status value", () => {
    expect(
      updateRequestStatusSchema.safeParse({
        requestUuid: "abc",
        status: "completed",
      }).success,
    ).toBe(false);
  });

  it("rejects feedback over 255 chars", () => {
    const longFeedback = "x".repeat(256);
    expect(
      updateRequestStatusSchema.safeParse({
        requestUuid: "abc",
        status: "delivered",
        feedback: longFeedback,
      }).success,
    ).toBe(false);
  });

  it("accepts all valid status values", () => {
    const valid = ["pending", "started", "delivered", "cancelled", "finished_by_recruitment", "re_work"];
    for (const s of valid) {
      expect(
        updateRequestStatusSchema.safeParse({ requestUuid: "abc", status: s })
          .success,
      ).toBe(true);
    }
  });
});
