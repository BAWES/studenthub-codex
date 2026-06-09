import { describe, it, expect } from "vitest";
import {
  listTransfersSchema,
  getTransferSchema,
  approveTransferSchema,
  rejectTransferSchema,
} from "./actions";

// ---------------------------------------------------------------------------
// Schema validation tests for admin/transfers server actions
//
// Testing schemas separately avoids mocking "use server" dependencies
// (prisma, session), following the existing pattern.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// listTransfersSchema tests
// ---------------------------------------------------------------------------

describe("listTransfersSchema", () => {
  it("accepts empty params", () => {
    const result = listTransfersSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listTransfersSchema.safeParse({ page: 2, limit: 50 });
    expect(result.success).toBe(true);
  });

  it("accepts search query", () => {
    const result = listTransfersSchema.safeParse({ q: "Acme Corp" });
    expect(result.success).toBe(true);
  });

  it("accepts status filter", () => {
    const result = listTransfersSchema.safeParse({ status: 10 });
    expect(result.success).toBe(true);
  });

  it("accepts all params combined", () => {
    const result = listTransfersSchema.safeParse({
      page: 1,
      limit: 20,
      q: "test",
      status: 10,
    });
    expect(result.success).toBe(true);
  });

  it("defaults page to 1 when omitted", () => {
    const result = listTransfersSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
    }
  });

  it("defaults limit to 60 when omitted", () => {
    const result = listTransfersSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(60);
    }
  });

  it("rejects negative page", () => {
    const result = listTransfersSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listTransfersSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects negative limit", () => {
    const result = listTransfersSchema.safeParse({ limit: -1 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getTransferSchema tests
// ---------------------------------------------------------------------------

describe("getTransferSchema", () => {
  it("accepts valid transfer ID", () => {
    const result = getTransferSchema.safeParse({ transferId: 42 });
    expect(result.success).toBe(true);
  });

  it("rejects missing transferId", () => {
    const result = getTransferSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero transfer ID", () => {
    const result = getTransferSchema.safeParse({ transferId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative transfer ID", () => {
    const result = getTransferSchema.safeParse({ transferId: -5 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// approveTransferSchema tests
// ---------------------------------------------------------------------------

describe("approveTransferSchema", () => {
  it("accepts valid transfer ID", () => {
    const result = approveTransferSchema.safeParse({ transferId: 42 });
    expect(result.success).toBe(true);
  });

  it("rejects missing transferId", () => {
    const result = approveTransferSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero transfer ID", () => {
    const result = approveTransferSchema.safeParse({ transferId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative transfer ID", () => {
    const result = approveTransferSchema.safeParse({ transferId: -5 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// rejectTransferSchema tests
// ---------------------------------------------------------------------------

describe("rejectTransferSchema", () => {
  it("accepts valid transfer ID with reason", () => {
    const result = rejectTransferSchema.safeParse({
      transferId: 42,
      reason: "Incorrect amounts — does not match timesheet totals.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing transferId", () => {
    const result = rejectTransferSchema.safeParse({
      reason: "Incorrect amounts.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero transfer ID", () => {
    const result = rejectTransferSchema.safeParse({
      transferId: 0,
      reason: "Incorrect amounts.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing reason", () => {
    const result = rejectTransferSchema.safeParse({ transferId: 42 });
    expect(result.success).toBe(false);
  });

  it("rejects empty reason", () => {
    const result = rejectTransferSchema.safeParse({
      transferId: 42,
      reason: "",
    });
    expect(result.success).toBe(false);
  });
});
