import { describe, it, expect } from "vitest";
import {
  getRequestDetailSchema,
  approveRequestSchema,
  rejectRequestSchema,
  addCommentSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("getRequestDetailSchema", () => {
  it("accepts a valid request UUID", () => {
    const r = getRequestDetailSchema.safeParse({
      requestUuid: "req_12345678-90ab-cdef-1234-567890abcdef",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.requestUuid).toBe("req_12345678-90ab-cdef-1234-567890abcdef");
    }
  });

  it("rejects empty UUID", () => {
    expect(getRequestDetailSchema.safeParse({ requestUuid: "" }).success).toBe(false);
  });

  it("rejects missing requestUuid", () => {
    expect(getRequestDetailSchema.safeParse({}).success).toBe(false);
  });
});

describe("approveRequestSchema", () => {
  it("accepts valid UUID and reason", () => {
    const r = approveRequestSchema.safeParse({
      requestUuid: "req_uuid_12345",
      reason: "Request approved by management",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.reason).toBe("Request approved by management");
    }
  });

  it("rejects missing UUID", () => {
    expect(approveRequestSchema.safeParse({ reason: "Approved" }).success).toBe(false);
  });

  it("rejects missing reason", () => {
    expect(approveRequestSchema.safeParse({ requestUuid: "abc" }).success).toBe(false);
  });

  it("rejects empty reason", () => {
    expect(
      approveRequestSchema.safeParse({ requestUuid: "abc", reason: "" }).success,
    ).toBe(false);
  });

  it("rejects reason over 500 chars", () => {
    const longReason = "x".repeat(501);
    expect(
      approveRequestSchema.safeParse({ requestUuid: "abc", reason: longReason }).success,
    ).toBe(false);
  });
});

describe("rejectRequestSchema", () => {
  it("accepts valid UUID and reason", () => {
    const r = rejectRequestSchema.safeParse({
      requestUuid: "req_uuid_12345",
      reason: "Request rejected due to budget constraints",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.reason).toBe("Request rejected due to budget constraints");
    }
  });

  it("rejects missing UUID", () => {
    expect(rejectRequestSchema.safeParse({ reason: "Rejected" }).success).toBe(false);
  });

  it("rejects missing reason", () => {
    expect(rejectRequestSchema.safeParse({ requestUuid: "abc" }).success).toBe(false);
  });

  it("rejects empty reason", () => {
    expect(
      rejectRequestSchema.safeParse({ requestUuid: "abc", reason: "" }).success,
    ).toBe(false);
  });

  it("rejects reason over 500 chars", () => {
    const longReason = "x".repeat(501);
    expect(
      rejectRequestSchema.safeParse({ requestUuid: "abc", reason: longReason }).success,
    ).toBe(false);
  });
});

describe("addCommentSchema", () => {
  it("accepts valid UUID and comment text", () => {
    const r = addCommentSchema.safeParse({
      requestUuid: "req_uuid_12345",
      comment: "Following up on this request",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.comment).toBe("Following up on this request");
    }
  });

  it("rejects missing UUID", () => {
    expect(addCommentSchema.safeParse({ comment: "A comment" }).success).toBe(false);
  });

  it("rejects missing comment", () => {
    expect(addCommentSchema.safeParse({ requestUuid: "abc" }).success).toBe(false);
  });

  it("rejects empty comment", () => {
    expect(
      addCommentSchema.safeParse({ requestUuid: "abc", comment: "" }).success,
    ).toBe(false);
  });

  it("rejects comment over 2000 chars", () => {
    const longComment = "x".repeat(2001);
    expect(
      addCommentSchema.safeParse({ requestUuid: "abc", comment: longComment }).success,
    ).toBe(false);
  });

  it("accepts comment at exactly 2000 chars", () => {
    const longComment = "x".repeat(2000);
    expect(
      addCommentSchema.safeParse({ requestUuid: "abc", comment: longComment }).success,
    ).toBe(true);
  });
});
