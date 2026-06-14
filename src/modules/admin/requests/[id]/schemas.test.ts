import { describe, it, expect } from "vitest";
import {
  requestExistenceSchema,
  addCommentResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// requestExistenceSchema  (.nullable())
// ---------------------------------------------------------------------------

describe("requestExistenceSchema", () => {
  it("accepts a valid existence result", () => {
    const r = requestExistenceSchema.safeParse({ request_uuid: "req-001" });
    expect(r.success).toBe(true);
  });

  it("accepts null (request not found)", () => {
    const r = requestExistenceSchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("rejects empty request_uuid", () => {
    const r = requestExistenceSchema.safeParse({ request_uuid: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing request_uuid", () => {
    const r = requestExistenceSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-string request_uuid", () => {
    const r = requestExistenceSchema.safeParse({ request_uuid: 123 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// addCommentResultSchema  (discriminatedUnion)
// ---------------------------------------------------------------------------

describe("addCommentResultSchema", () => {
  it("accepts success operation", () => {
    const r = addCommentResultSchema.safeParse({ operation: "success", message: "Comment added" });
    expect(r.success).toBe(true);
  });

  it("accepts error operation", () => {
    const r = addCommentResultSchema.safeParse({ operation: "error", message: "Failed" });
    expect(r.success).toBe(true);
  });

  it("rejects invalid operation", () => {
    const r = addCommentResultSchema.safeParse({ operation: "unknown", message: "Bad" });
    expect(r.success).toBe(false);
  });

  it("rejects missing message", () => {
    const r = addCommentResultSchema.safeParse({ operation: "success" });
    expect(r.success).toBe(false);
  });

  it("rejects non-string message", () => {
    const r = addCommentResultSchema.safeParse({ operation: "error", message: 42 });
    expect(r.success).toBe(false);
  });
});
