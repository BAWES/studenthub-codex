import { describe, it, expect } from "vitest";
import {
  financeNoticeSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// financeNoticeSchema (enum)
// ---------------------------------------------------------------------------

describe("financeNoticeSchema", () => {
  it("accepts 'paid-toggled'", () => {
    const r = financeNoticeSchema.safeParse("paid-toggled");
    expect(r.success).toBe(true);
  });

  it("accepts 'status-toggled'", () => {
    const r = financeNoticeSchema.safeParse("status-toggled");
    expect(r.success).toBe(true);
  });

  it("accepts 'payment-received'", () => {
    const r = financeNoticeSchema.safeParse("payment-received");
    expect(r.success).toBe(true);
  });

  it("accepts 'transfer-deleted'", () => {
    const r = financeNoticeSchema.safeParse("transfer-deleted");
    expect(r.success).toBe(true);
  });

  it("accepts 'invalid-params'", () => {
    const r = financeNoticeSchema.safeParse("invalid-params");
    expect(r.success).toBe(true);
  });

  it("accepts 'invalid-date'", () => {
    const r = financeNoticeSchema.safeParse("invalid-date");
    expect(r.success).toBe(true);
  });

  it("accepts 'not-found'", () => {
    const r = financeNoticeSchema.safeParse("not-found");
    expect(r.success).toBe(true);
  });

  it("rejects an unknown notice value", () => {
    const r = financeNoticeSchema.safeParse("unknown-notice");
    expect(r.success).toBe(false);
  });

  it("rejects empty string", () => {
    const r = financeNoticeSchema.safeParse("");
    expect(r.success).toBe(false);
  });

  it("rejects non-string value", () => {
    const r = financeNoticeSchema.safeParse(123);
    expect(r.success).toBe(false);
  });
});
