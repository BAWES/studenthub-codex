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
  it("accepts empty input with defaults", () => {
    const r = listTransferBankAdvicesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("coerces string values", () => {
    const r = listTransferBankAdvicesSchema.safeParse({ page: "2", limit: "10" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("rejects negative page", () => {
    expect(listTransferBankAdvicesSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listTransferBankAdvicesSchema.safeParse({ limit: 200 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getTransferBankAdviceSchema
// ---------------------------------------------------------------------------
describe("getTransferBankAdviceSchema", () => {
  it("accepts valid UUID", () => {
    expect(getTransferBankAdviceSchema.safeParse({ uuid: "abc-123" }).success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getTransferBankAdviceSchema.safeParse({ uuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getTransferBankAdviceSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createTransferBankAdviceSchema
// ---------------------------------------------------------------------------
describe("createTransferBankAdviceSchema", () => {
  it("accepts valid file_path", () => {
    const r = createTransferBankAdviceSchema.safeParse({
      file_path: "/uploads/advice.pdf",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty file_path", () => {
    expect(createTransferBankAdviceSchema.safeParse({ file_path: "" }).success).toBe(
      false
    );
  });

  it("rejects missing file_path", () => {
    expect(createTransferBankAdviceSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateTransferBankAdviceSchema
// ---------------------------------------------------------------------------
describe("updateTransferBankAdviceSchema", () => {
  const valid = { uuid: "abc-123", file_path: "/uploads/advice-v2.pdf" };

  it("accepts valid input", () => {
    expect(updateTransferBankAdviceSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(
      updateTransferBankAdviceSchema.safeParse({ file_path: "/test.pdf" }).success
    ).toBe(false);
  });

  it("rejects empty file_path", () => {
    expect(
      updateTransferBankAdviceSchema.safeParse({ uuid: "abc-123", file_path: "" })
        .success
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteTransferBankAdviceSchema
// ---------------------------------------------------------------------------
describe("deleteTransferBankAdviceSchema", () => {
  it("accepts valid UUID", () => {
    expect(deleteTransferBankAdviceSchema.safeParse({ uuid: "abc-123" }).success).toBe(
      true
    );
  });

  it("rejects empty UUID", () => {
    expect(deleteTransferBankAdviceSchema.safeParse({ uuid: "" }).success).toBe(false);
  });
});