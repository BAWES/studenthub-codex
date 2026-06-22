import { describe, it, expect } from "vitest";
import {
  listTransferBankAdvicesSchema,
  getTransferBankAdviceSchema,
  createTransferBankAdviceSchema,
  updateTransferBankAdviceSchema,
  deleteTransferBankAdviceSchema,
} from "./schemas";

/**
 * Page migration test for admin/transfers/bank-advice.
 *
 * Verifies the data contract between page and action.
 * The bank advice page manages CRUD operations for transfer bank advice documents.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin transfers bank advice page — data contract", () => {
  // -----------------------------------------------------------------------
  // listTransferBankAdvicesSchema
  // -----------------------------------------------------------------------
  it("accepts empty input (uses defaults)", () => {
    const r = listTransferBankAdvicesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts explicit page and limit", () => {
    const r = listTransferBankAdvicesSchema.safeParse({
      page: 3,
      limit: 50,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(50);
    }
  });

  it("coerces string values to numbers", () => {
    const r = listTransferBankAdvicesSchema.safeParse({
      page: "2",
      limit: "10",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("rejects page of zero", () => {
    const r = listTransferBankAdvicesSchema.safeParse({ page: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects limit of zero", () => {
    const r = listTransferBankAdvicesSchema.safeParse({ limit: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects limit exceeding 100", () => {
    const r = listTransferBankAdvicesSchema.safeParse({ limit: 101 });
    expect(r.success).toBe(false);
  });

  // -----------------------------------------------------------------------
  // getTransferBankAdviceSchema
  // -----------------------------------------------------------------------
  it("getTransferBankAdviceSchema accepts valid uuid", () => {
    const r = getTransferBankAdviceSchema.safeParse({
      uuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(r.success).toBe(true);
  });

  it("getTransferBankAdviceSchema rejects empty uuid", () => {
    const r = getTransferBankAdviceSchema.safeParse({ uuid: "" });
    expect(r.success).toBe(false);
  });

  it("getTransferBankAdviceSchema rejects missing uuid", () => {
    const r = getTransferBankAdviceSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  // -----------------------------------------------------------------------
  // createTransferBankAdviceSchema
  // -----------------------------------------------------------------------
  it("createTransferBankAdviceSchema accepts valid file_path", () => {
    const r = createTransferBankAdviceSchema.safeParse({
      file_path: "/tmp/bank-advice.pdf",
    });
    expect(r.success).toBe(true);
  });

  it("createTransferBankAdviceSchema rejects empty file_path", () => {
    const r = createTransferBankAdviceSchema.safeParse({ file_path: "" });
    expect(r.success).toBe(false);
  });

  it("createTransferBankAdviceSchema rejects missing file_path", () => {
    const r = createTransferBankAdviceSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("createTransferBankAdviceSchema rejects file_path exceeding 255 chars", () => {
    const r = createTransferBankAdviceSchema.safeParse({
      file_path: "x".repeat(256),
    });
    expect(r.success).toBe(false);
  });

  // -----------------------------------------------------------------------
  // updateTransferBankAdviceSchema
  // -----------------------------------------------------------------------
  it("updateTransferBankAdviceSchema accepts valid input", () => {
    const r = updateTransferBankAdviceSchema.safeParse({
      uuid: "550e8400-e29b-41d4-a716-446655440000",
      file_path: "/uploads/advice.pdf",
    });
    expect(r.success).toBe(true);
  });

  it("updateTransferBankAdviceSchema rejects empty uuid", () => {
    const r = updateTransferBankAdviceSchema.safeParse({
      uuid: "",
      file_path: "/path",
    });
    expect(r.success).toBe(false);
  });

  it("updateTransferBankAdviceSchema rejects missing uuid", () => {
    const r = updateTransferBankAdviceSchema.safeParse({
      file_path: "/path",
    });
    expect(r.success).toBe(false);
  });

  it("updateTransferBankAdviceSchema rejects empty file_path", () => {
    const r = updateTransferBankAdviceSchema.safeParse({
      uuid: "abc",
      file_path: "",
    });
    expect(r.success).toBe(false);
  });

  it("updateTransferBankAdviceSchema rejects file_path exceeding 255 chars", () => {
    const r = updateTransferBankAdviceSchema.safeParse({
      uuid: "abc",
      file_path: "x".repeat(256),
    });
    expect(r.success).toBe(false);
  });

  // -----------------------------------------------------------------------
  // deleteTransferBankAdviceSchema
  // -----------------------------------------------------------------------
  it("deleteTransferBankAdviceSchema accepts valid uuid", () => {
    const r = deleteTransferBankAdviceSchema.safeParse({
      uuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(r.success).toBe(true);
  });

  it("deleteTransferBankAdviceSchema rejects empty uuid", () => {
    const r = deleteTransferBankAdviceSchema.safeParse({ uuid: "" });
    expect(r.success).toBe(false);
  });

  it("deleteTransferBankAdviceSchema rejects missing uuid", () => {
    const r = deleteTransferBankAdviceSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});
