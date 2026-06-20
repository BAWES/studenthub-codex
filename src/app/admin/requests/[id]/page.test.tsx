import { describe, it, expect } from "vitest";
import {
  getRequestDetailSchema,
  approveRequestSchema,
  rejectRequestSchema,
  addCommentSchema,
  requestExistenceSchema,
  addCommentResultSchema,
} from "./schemas";

/**
 * Page migration test for admin/requests/[id].
 *
 * Verifies the data contract between page and action.
 * The admin request detail page calls getRequestDetail, approveRequest,
 * rejectRequest, and addComment actions.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin request detail page — data contract", () => {
  // -----------------------------------------------------------------------
  // getRequestDetailSchema
  // -----------------------------------------------------------------------
  it("getRequestDetailSchema accepts valid requestUuid", () => {
    const r = getRequestDetailSchema.safeParse({ requestUuid: "abc-123" });
    expect(r.success).toBe(true);
  });

  it("getRequestDetailSchema rejects empty requestUuid", () => {
    const r = getRequestDetailSchema.safeParse({ requestUuid: "" });
    expect(r.success).toBe(false);
  });

  it("getRequestDetailSchema rejects missing requestUuid", () => {
    const r = getRequestDetailSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  // -----------------------------------------------------------------------
  // approveRequestSchema
  // -----------------------------------------------------------------------
  it("approveRequestSchema accepts valid input", () => {
    const r = approveRequestSchema.safeParse({
      requestUuid: "abc-123",
      reason: "Request meets all requirements",
    });
    expect(r.success).toBe(true);
  });

  it("approveRequestSchema rejects missing reason", () => {
    const r = approveRequestSchema.safeParse({ requestUuid: "abc-123" });
    expect(r.success).toBe(false);
  });

  it("approveRequestSchema rejects empty reason", () => {
    const r = approveRequestSchema.safeParse({
      requestUuid: "abc-123",
      reason: "",
    });
    expect(r.success).toBe(false);
  });

  it("approveRequestSchema rejects reason exceeding 500 chars", () => {
    const r = approveRequestSchema.safeParse({
      requestUuid: "abc-123",
      reason: "x".repeat(501),
    });
    expect(r.success).toBe(false);
  });

  it("approveRequestSchema rejects missing requestUuid", () => {
    const r = approveRequestSchema.safeParse({ reason: "Approved" });
    expect(r.success).toBe(false);
  });

  // -----------------------------------------------------------------------
  // rejectRequestSchema
  // -----------------------------------------------------------------------
  it("rejectRequestSchema accepts valid input", () => {
    const r = rejectRequestSchema.safeParse({
      requestUuid: "abc-123",
      reason: "Incomplete documentation",
    });
    expect(r.success).toBe(true);
  });

  it("rejectRequestSchema rejects empty reason", () => {
    const r = rejectRequestSchema.safeParse({
      requestUuid: "abc-123",
      reason: "",
    });
    expect(r.success).toBe(false);
  });

  // -----------------------------------------------------------------------
  // addCommentSchema
  // -----------------------------------------------------------------------
  it("addCommentSchema accepts valid input", () => {
    const r = addCommentSchema.safeParse({
      requestUuid: "abc-123",
      comment: "Please upload the missing document",
    });
    expect(r.success).toBe(true);
  });

  it("addCommentSchema rejects empty comment", () => {
    const r = addCommentSchema.safeParse({
      requestUuid: "abc-123",
      comment: "",
    });
    expect(r.success).toBe(false);
  });

  it("addCommentSchema rejects comment exceeding 2000 chars", () => {
    const r = addCommentSchema.safeParse({
      requestUuid: "abc-123",
      comment: "x".repeat(2001),
    });
    expect(r.success).toBe(false);
  });

  it("addCommentSchema rejects missing requestUuid", () => {
    const r = addCommentSchema.safeParse({ comment: "Comment" });
    expect(r.success).toBe(false);
  });

  // -----------------------------------------------------------------------
  // requestExistenceSchema (output)
  // -----------------------------------------------------------------------
  it("requestExistenceSchema accepts valid request object", () => {
    const r = requestExistenceSchema.safeParse({
      request_uuid: "abc-123",
    });
    expect(r.success).toBe(true);
  });

  it("requestExistenceSchema accepts null (request not found)", () => {
    const r = requestExistenceSchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("requestExistenceSchema rejects missing request_uuid", () => {
    const r = requestExistenceSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("requestExistenceSchema rejects empty request_uuid", () => {
    const r = requestExistenceSchema.safeParse({ request_uuid: "" });
    expect(r.success).toBe(false);
  });

  // -----------------------------------------------------------------------
  // addCommentResultSchema (output)
  // -----------------------------------------------------------------------
  it("addCommentResultSchema accepts success result", () => {
    const r = addCommentResultSchema.safeParse({
      operation: "success",
      message: "Comment added",
    });
    expect(r.success).toBe(true);
  });

  it("addCommentResultSchema accepts error result", () => {
    const r = addCommentResultSchema.safeParse({
      operation: "error",
      message: "Request not found",
    });
    expect(r.success).toBe(true);
  });

  it("addCommentResultSchema rejects invalid operation", () => {
    const r = addCommentResultSchema.safeParse({
      operation: "invalid",
      message: "Something",
    });
    expect(r.success).toBe(false);
  });

  it("addCommentResultSchema rejects missing message", () => {
    const r = addCommentResultSchema.safeParse({ operation: "success" });
    expect(r.success).toBe(false);
  });
});
