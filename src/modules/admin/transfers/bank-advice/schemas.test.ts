import { describe, it, expect } from "vitest";
import {
  listTransferBankAdvicesSchema,
  getTransferBankAdviceSchema,
  createTransferBankAdviceSchema,
  updateTransferBankAdviceSchema,
  deleteTransferBankAdviceSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listTransferBankAdvicesSchema
// ---------------------------------------------------------------------------

describe("listTransferBankAdvicesSchema", () => {
  it("parses with defaults when empty", () => {
    const r = listTransferBankAdvicesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts explicit page and limit", () => {
    const r = listTransferBankAdvicesSchema.safeParse({ page: 2, limit: 50 });
    expect(r.success).toBe(true);
  });

  it("rejects negative page", () => {
    const r = listTransferBankAdvicesSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const r = listTransferBankAdvicesSchema.safeParse({ limit: 200 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getTransferBankAdviceSchema
// ---------------------------------------------------------------------------

describe("getTransferBankAdviceSchema", () => {
  it("accepts valid uuid", () => {
    const r = getTransferBankAdviceSchema.safeParse({ uuid: "ba-001" });
    expect(r.success).toBe(true);
  });

  it("rejects empty uuid", () => {
    const r = getTransferBankAdviceSchema.safeParse({ uuid: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing uuid", () => {
    const r = getTransferBankAdviceSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createTransferBankAdviceSchema
// ---------------------------------------------------------------------------

describe("createTransferBankAdviceSchema", () => {
  it("accepts valid file_path", () => {
    const r = createTransferBankAdviceSchema.safeParse({ file_path: "/path/to/advice.pdf" });
    expect(r.success).toBe(true);
  });

  it("rejects empty file_path", () => {
    const r = createTransferBankAdviceSchema.safeParse({ file_path: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing file_path", () => {
    const r = createTransferBankAdviceSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects file_path exceeding 255 chars", () => {
    const r = createTransferBankAdviceSchema.safeParse({ file_path: "a".repeat(256) });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateTransferBankAdviceSchema
// ---------------------------------------------------------------------------

describe("updateTransferBankAdviceSchema", () => {
  it("accepts valid uuid and file_path", () => {
    const r = updateTransferBankAdviceSchema.safeParse({ uuid: "ba-001", file_path: "/new/path.pdf" });
    expect(r.success).toBe(true);
  });

  it("rejects empty uuid", () => {
    const r = updateTransferBankAdviceSchema.safeParse({ uuid: "", file_path: "/path.pdf" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteTransferBankAdviceSchema
// ---------------------------------------------------------------------------

describe("deleteTransferBankAdviceSchema", () => {
  it("accepts valid uuid", () => {
    const r = deleteTransferBankAdviceSchema.safeParse({ uuid: "ba-001" });
    expect(r.success).toBe(true);
  });

  it("rejects empty uuid", () => {
    const r = deleteTransferBankAdviceSchema.safeParse({ uuid: "" });
    expect(r.success).toBe(false);
  });
});
