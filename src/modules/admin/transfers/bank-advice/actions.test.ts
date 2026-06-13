import { describe, it, expect } from "vitest";
import {
  listTransferBankAdvicesSchema,
  getTransferBankAdviceSchema,
  createTransferBankAdviceSchema,
  updateTransferBankAdviceSchema,
  deleteTransferBankAdviceSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests (pure unit tests — no DB required)
// ---------------------------------------------------------------------------

describe("listTransferBankAdvicesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listTransferBankAdvicesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const r = listTransferBankAdvicesSchema.safeParse({ page: 2, limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    expect(listTransferBankAdvicesSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects limit under 1", () => {
    expect(listTransferBankAdvicesSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listTransferBankAdvicesSchema.safeParse({ page: -1 }).success).toBe(false);
  });
});

describe("getTransferBankAdviceSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      getTransferBankAdviceSchema.safeParse({ uuid: "abc-123-def" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getTransferBankAdviceSchema.safeParse({ uuid: "" }).success).toBe(false);
  });
});

describe("createTransferBankAdviceSchema", () => {
  it("accepts valid data", () => {
    const r = createTransferBankAdviceSchema.safeParse({
      file_path: "/uploads/advices/batch-2026-01.pdf",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.file_path).toBe("/uploads/advices/batch-2026-01.pdf");
    }
  });

  it("rejects empty file_path", () => {
    expect(
      createTransferBankAdviceSchema.safeParse({ file_path: "" }).success,
    ).toBe(false);
  });

  it("rejects missing file_path", () => {
    expect(createTransferBankAdviceSchema.safeParse({}).success).toBe(false);
  });
});

describe("updateTransferBankAdviceSchema", () => {
  it("accepts valid update data", () => {
    const r = updateTransferBankAdviceSchema.safeParse({
      uuid: "abc-123-def",
      file_path: "/uploads/advices/updated.pdf",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.uuid).toBe("abc-123-def");
      expect(r.data.file_path).toBe("/uploads/advices/updated.pdf");
    }
  });

  it("rejects empty UUID", () => {
    expect(
      updateTransferBankAdviceSchema.safeParse({
        uuid: "",
        file_path: "/uploads/test.pdf",
      }).success,
    ).toBe(false);
  });

  it("rejects empty file_path", () => {
    expect(
      updateTransferBankAdviceSchema.safeParse({
        uuid: "abc-123",
        file_path: "",
      }).success,
    ).toBe(false);
  });
});

describe("deleteTransferBankAdviceSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      deleteTransferBankAdviceSchema.safeParse({ uuid: "abc-123-def" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(deleteTransferBankAdviceSchema.safeParse({ uuid: "" }).success).toBe(false);
  });
});
