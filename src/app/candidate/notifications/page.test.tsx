import { describe, it, expect } from "vitest";
import {
  notificationRowSchema,
  notificationRowArraySchema,
  dismissResultSchema,
  updateResultSchema,
  actionResponseSchema,
} from "./schemas";

describe("candidate notifications page — data contract", () => {
  it("notificationRowSchema validates a valid row", () => {
    const r = notificationRowSchema.safeParse({
      id: "n1", type: "invitation", typeCode: 1, message: "New invitation",
      isNew: "true", created: "2024-06-01",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.id).toBe("n1");
  });

  it("notificationRowSchema rejects missing id", () => {
    const r = notificationRowSchema.safeParse({ type: "invitation", typeCode: 1, message: "msg" });
    expect(r.success).toBe(false);
  });

  it("notificationRowArraySchema validates array of rows", () => {
    const r = notificationRowArraySchema.safeParse([
      { id: "n1", type: "invitation", typeCode: 1, message: "m1", isNew: "true", created: "d1" },
    ]);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.length).toBe(1);
  });

  it("notificationRowArraySchema rejects non-array", () => {
    const r = notificationRowArraySchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("dismissResultSchema validates success", () => {
    const r = dismissResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("dismissResultSchema validates failure with error", () => {
    const r = dismissResultSchema.safeParse({ success: false, error: "Not found" });
    expect(r.success).toBe(true);
  });

  it("updateResultSchema validates success", () => {
    const r = updateResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("actionResponseSchema validates success", () => {
    const r = actionResponseSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("actionResponseSchema validates error", () => {
    const r = actionResponseSchema.safeParse({ success: false, error: "Failed" });
    expect(r.success).toBe(true);
  });

  it("actionResponseSchema rejects missing error on failure", () => {
    const r = actionResponseSchema.safeParse({ success: false });
    expect(r.success).toBe(false);
  });
});
