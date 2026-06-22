import { describe, it, expect } from "vitest";
import {
  toggleCandidatePaidSchema,
  toggleTransferStatusSchema,
  markPaymentReceivedSchema,
  deleteTransferSchema,
  financeNoticeSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests — toggleCandidatePaidSchema
// ---------------------------------------------------------------------------

describe("toggleCandidatePaidSchema", () => {
  it("accepts valid tc_id and transfer_id", () => {
    const r = toggleCandidatePaidSchema.safeParse({ tc_id: 42, transfer_id: 99 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.tc_id).toBe(42);
      expect(r.data.transfer_id).toBe(99);
    }
  });

  it("rejects zero tc_id", () => {
    expect(toggleCandidatePaidSchema.safeParse({ tc_id: 0, transfer_id: 99 }).success).toBe(false);
  });

  it("rejects negative tc_id", () => {
    expect(toggleCandidatePaidSchema.safeParse({ tc_id: -1, transfer_id: 99 }).success).toBe(false);
  });

  it("rejects non-integer tc_id", () => {
    expect(toggleCandidatePaidSchema.safeParse({ tc_id: 1.5, transfer_id: 99 }).success).toBe(false);
  });

  it("rejects NaN tc_id", () => {
    expect(toggleCandidatePaidSchema.safeParse({ tc_id: NaN, transfer_id: 99 }).success).toBe(false);
  });

  it("rejects zero transfer_id", () => {
    expect(toggleCandidatePaidSchema.safeParse({ tc_id: 42, transfer_id: 0 }).success).toBe(false);
  });

  it("rejects negative transfer_id", () => {
    expect(toggleCandidatePaidSchema.safeParse({ tc_id: 42, transfer_id: -5 }).success).toBe(false);
  });

  it("rejects non-integer transfer_id", () => {
    expect(toggleCandidatePaidSchema.safeParse({ tc_id: 42, transfer_id: 3.14 }).success).toBe(false);
  });

  it("coerces string tc_id to number", () => {
    const r = toggleCandidatePaidSchema.safeParse({ tc_id: "42", transfer_id: "99" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.tc_id).toBe(42);
      expect(r.data.transfer_id).toBe(99);
    }
  });

  it("rejects empty string tc_id", () => {
    expect(toggleCandidatePaidSchema.safeParse({ tc_id: "", transfer_id: 99 }).success).toBe(false);
  });

  it("rejects missing tc_id", () => {
    expect(toggleCandidatePaidSchema.safeParse({ transfer_id: 99 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema tests — toggleTransferStatusSchema
// ---------------------------------------------------------------------------

describe("toggleTransferStatusSchema", () => {
  it("accepts valid transfer_id", () => {
    expect(toggleTransferStatusSchema.safeParse({ transfer_id: 1 }).success).toBe(true);
  });

  it("rejects zero transfer_id", () => {
    expect(toggleTransferStatusSchema.safeParse({ transfer_id: 0 }).success).toBe(false);
  });

  it("rejects negative transfer_id", () => {
    expect(toggleTransferStatusSchema.safeParse({ transfer_id: -10 }).success).toBe(false);
  });

  it("rejects non-integer transfer_id", () => {
    expect(toggleTransferStatusSchema.safeParse({ transfer_id: 2.5 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema tests — markPaymentReceivedSchema
// ---------------------------------------------------------------------------

describe("markPaymentReceivedSchema", () => {
  it("accepts valid transfer_id", () => {
    expect(markPaymentReceivedSchema.safeParse({ transfer_id: 42 }).success).toBe(true);
  });

  it("rejects invalid transfer_id", () => {
    expect(markPaymentReceivedSchema.safeParse({ transfer_id: 0 }).success).toBe(false);
  });

  it("accepts valid received date string", () => {
    const r = markPaymentReceivedSchema.safeParse({ transfer_id: 42, received_on: "2026-06-01" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.received_on).toBe("2026-06-01");
  });

  it("accepts empty received date (defaults to today)", () => {
    const r = markPaymentReceivedSchema.safeParse({ transfer_id: 42, received_on: "" });
    expect(r.success).toBe(true);
  });

  it("accepts undefined received date", () => {
    const r = markPaymentReceivedSchema.safeParse({ transfer_id: 42 });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Input schema tests — deleteTransferSchema
// ---------------------------------------------------------------------------

describe("deleteTransferSchema", () => {
  it("accepts valid transfer_id", () => {
    expect(deleteTransferSchema.safeParse({ transfer_id: 77 }).success).toBe(true);
  });

  it("rejects zero transfer_id", () => {
    expect(deleteTransferSchema.safeParse({ transfer_id: 0 }).success).toBe(false);
  });

  it("rejects negative transfer_id", () => {
    expect(deleteTransferSchema.safeParse({ transfer_id: -1 }).success).toBe(false);
  });

  it("rejects non-integer transfer_id", () => {
    expect(deleteTransferSchema.safeParse({ transfer_id: 1.1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — financeNoticeSchema
// ---------------------------------------------------------------------------

describe("financeNoticeSchema", () => {
  it("accepts all valid notice values", () => {
    const valid = ["paid-toggled", "status-toggled", "payment-received", "transfer-deleted", "invalid-params", "invalid-date", "not-found"];
    for (const v of valid) {
      const r = financeNoticeSchema.safeParse(v);
      expect(r.success).toBe(true);
    }
  });

  it("rejects invalid notice value", () => {
    expect(financeNoticeSchema.safeParse("unknown").success).toBe(false);
    expect(financeNoticeSchema.safeParse("success").success).toBe(false);
  });
});
