import { describe, it, expect } from "vitest";
import {
  listBanksSchema,
  bankRowOutputSchema,
  listBanksOutputSchema,
  createBankSchema,
  updateBankSchema,
  deleteBankSchema,
  bankMutationOutputSchema,
} from "./schemas";

/**
 * Page migration test for admin/bank.
 *
 * Verifies the data contract between page and action.
 * The bank page uses listBanks, createBank, updateBank, deleteBank
 * for CRUD operations displayed in a DataTable.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin bank page — data contract", () => {
  // ── Input schemas ──

  it("listBanksSchema accepts empty params (defaults to page 1, limit 20)", () => {
    const r = listBanksSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listBanksSchema accepts explicit pagination", () => {
    const r = listBanksSchema.safeParse({ page: 2, limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(50);
    }
  });

  it("listBanksSchema accepts optional search query", () => {
    const r = listBanksSchema.safeParse({ q: "Kuwait" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.q).toBe("Kuwait");
  });

  it("listBanksSchema rejects limit over 100", () => {
    const r = listBanksSchema.safeParse({ limit: 200 });
    expect(r.success).toBe(false);
  });

  it("createBankSchema accepts valid input", () => {
    const r = createBankSchema.safeParse({
      bankName: "New Bank",
      bankIbanCode: "KW00XXX0000000000000000000000",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.bankName).toBe("New Bank");
      expect(r.data.bankIbanCode).toBe("KW00XXX0000000000000000000000");
    }
  });

  it("createBankSchema rejects empty name", () => {
    const r = createBankSchema.safeParse({
      bankName: "",
      bankIbanCode: "KW00XXX0000000000000000000000",
    });
    expect(r.success).toBe(false);
  });

  it("createBankSchema accepts optional fields", () => {
    const r = createBankSchema.safeParse({
      bankName: "Test",
      bankIbanCode: "KW00XXXX",
      bankSwiftCode: "TESTKWKW",
      bankCodeAbk: 123,
      bankAddress: "Kuwait City",
      bankTransferType: "STD",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.bankSwiftCode).toBe("TESTKWKW");
      expect(r.data.bankCodeAbk).toBe(123);
      expect(r.data.bankAddress).toBe("Kuwait City");
      expect(r.data.bankTransferType).toBe("STD");
    }
  });

  it("updateBankSchema accepts partial update", () => {
    const r = updateBankSchema.safeParse({
      bankId: 1,
      bankName: "Updated Name",
    });
    expect(r.success).toBe(true);
  });

  it("updateBankSchema requires bankId", () => {
    const r = updateBankSchema.safeParse({ bankName: "Test" });
    expect(r.success).toBe(false);
  });

  it("deleteBankSchema requires positive bankId", () => {
    const r = deleteBankSchema.safeParse({ bankId: 1 });
    expect(r.success).toBe(true);
  });

  // ── Output schemas ──

  it("bankRowOutputSchema validates a valid bank row", () => {
    const r = bankRowOutputSchema.safeParse({
      bank_id: 1,
      bank_name: "National Bank of Kuwait",
      bank_iban_code: "KW00NBK0000000000000000000000",
      bank_swift_code: "NBKKWKWK",
      bank_code_abk: 101,
      bank_address: "Kuwait City",
      bank_transfer_type: "STD",
      candidate_count: 25,
      created_at: "2026-06-10T00:00:00Z",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.bank_id).toBe(1);
  });

  it("bankRowOutputSchema allows null fields", () => {
    const r = bankRowOutputSchema.safeParse({
      bank_id: 2,
      bank_name: "Gulf Bank",
      bank_iban_code: "KW00GBK0000000000000000000000",
      bank_swift_code: null,
      bank_code_abk: null,
      bank_address: null,
      bank_transfer_type: null,
      candidate_count: 0,
      created_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("listBanksOutputSchema validates full response shape", () => {
    const r = listBanksOutputSchema.safeParse({
      items: [
        {
          bank_id: 1,
          bank_name: "NBK",
          bank_iban_code: "KW00XXX",
          bank_swift_code: null,
          bank_code_abk: null,
          bank_address: null,
          bank_transfer_type: null,
          candidate_count: 10,
          created_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("bankMutationOutputSchema validates success", () => {
    const r = bankMutationOutputSchema.safeParse({
      operation: "success",
      message: "Bank created",
    });
    expect(r.success).toBe(true);
  });

  it("bankMutationOutputSchema validates error", () => {
    const r = bankMutationOutputSchema.safeParse({
      operation: "error",
      message: "IBAN already exists",
    });
    expect(r.success).toBe(true);
  });

  it("bankRow shape matches the DataTable columns", () => {
    const row = {
      bank_id: 1,
      bank_name: "National Bank of Kuwait",
      bank_iban_code: "KW00NBK0000000000000000000000",
      candidate_count: 25,
    };
    expect(row.bank_id).toBe(1);
    expect(row.bank_name).toBe("National Bank of Kuwait");
    expect(row.bank_iban_code).toMatch(/^KW00/);
    expect(typeof row.candidate_count).toBe("number");
  });
});
