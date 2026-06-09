import { describe, it, expect } from "vitest";
import {
  listTransfersSchema,
  getTransferSchema,
  approveTransferSchema,
  rejectTransferSchema,
} from "./actions";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("listTransfersSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listTransfersSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination and filter params", () => {
    const r = listTransfersSchema.safeParse({ page: 2, limit: 10, companyId: 5, status: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
      expect(r.data.companyId).toBe(5);
      expect(r.data.status).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    expect(listTransfersSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listTransfersSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects negative companyId", () => {
    expect(listTransfersSchema.safeParse({ companyId: -5 }).success).toBe(false);
  });

  it("coerces string values to numbers", () => {
    const r = listTransfersSchema.safeParse({ page: "2", limit: "15", companyId: "3" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(15);
      expect(r.data.companyId).toBe(3);
    }
  });
});

describe("getTransferSchema", () => {
  it("accepts a valid positive transfer ID", () => {
    const r = getTransferSchema.safeParse({ transferId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects zero ID", () => {
    expect(getTransferSchema.safeParse({ transferId: 0 }).success).toBe(false);
  });

  it("rejects negative ID", () => {
    expect(getTransferSchema.safeParse({ transferId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric ID", () => {
    expect(getTransferSchema.safeParse({ transferId: "abc" }).success).toBe(false);
  });

  it("coerces string transferId to number", () => {
    const r = getTransferSchema.safeParse({ transferId: "99" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.transferId).toBe(99);
    }
  });
});

describe("approveTransferSchema", () => {
  it("accepts a valid transfer ID", () => {
    const r = approveTransferSchema.safeParse({ transferId: 7 });
    expect(r.success).toBe(true);
  });

  it("rejects missing transferId", () => {
    expect(approveTransferSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero transferId", () => {
    expect(approveTransferSchema.safeParse({ transferId: 0 }).success).toBe(false);
  });
});

describe("rejectTransferSchema", () => {
  it("accepts valid transfer ID and reason", () => {
    const r = rejectTransferSchema.safeParse({ transferId: 7, reason: "Incorrect period dates" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.reason).toBe("Incorrect period dates");
    }
  });

  it("rejects missing reason", () => {
    expect(rejectTransferSchema.safeParse({ transferId: 7 }).success).toBe(false);
  });

  it("rejects empty reason", () => {
    expect(rejectTransferSchema.safeParse({ transferId: 7, reason: "" }).success).toBe(false);
  });

  it("rejects reason exceeding 500 chars", () => {
    const longReason = "x".repeat(501);
    expect(rejectTransferSchema.safeParse({ transferId: 7, reason: longReason }).success).toBe(false);
  });

  it("rejects missing transferId", () => {
    expect(rejectTransferSchema.safeParse({ reason: "No reason" }).success).toBe(false);
  });
});
