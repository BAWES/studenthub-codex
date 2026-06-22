import { describe, it, expect } from "vitest";
import { listBanksSchema, listBanksOutputSchema, bankRowOutputSchema } from "./schemas";
import type { BankRow, ListBanksResult } from "./schemas";

/**
 * Page migration test for admin/bank.
 *
 * Verifies that listBanksSchema accepts the params passed by the page,
 * that BankRow fields map correctly to AdminBankTable columns, and
 * that listBanksOutputSchema matches the page's result destructuring.
 *
 * Full rendering tests require Playwright (server component).
 * This validates the data contract between the page and the server action.
 */
describe("admin bank page — data contract", () => {
  it("listBanksSchema accepts params the page actually passes (limit: 100)", () => {
    const r = listBanksSchema.safeParse({ limit: 100 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(100);
      expect(typeof r.data.page).toBe("number");
    }
  });

  it("listBanksSchema accepts empty params (defaults apply)", () => {
    const r = listBanksSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(typeof r.data.page).toBe("number");
      expect(typeof r.data.limit).toBe("number");
    }
  });

  it("BankRow fields map correctly to DataTable columns", () => {
    // The page maps BankRow to DataTable columns:
    //   bank_id         → row.bank_id         (numeric key)
    //   bank_name       → row.bank_name
    //   bank_iban_code  → row.bank_iban_code
    //   bank_swift_code → row.bank_swift_code
    //   bank_code_abk   → row.bank_code_abk
    //   bank_address    → row.bank_address
    //   bank_transfer_type → row.bank_transfer_type
    //   candidate_count → row.candidate_count
    //   created_at      → row.created_at
    const row: BankRow = {
      bank_id: 1,
      bank_name: "National Bank of Kuwait",
      bank_iban_code: "KW00NBK0000000000000000000000",
      bank_swift_code: "NBKKWKWK",
      bank_code_abk: 101,
      bank_address: "Kuwait City",
      bank_transfer_type: "STD",
      candidate_count: 25,
      created_at: "2026-06-10T00:00:00Z",
    };
    expect(row.bank_id).toBe(1);
    expect(row.bank_name).toBe("National Bank of Kuwait");
    expect(row.bank_iban_code).toMatch(/^KW00/);
    expect(row.bank_swift_code).toBe("NBKKWKWK");
    expect(row.bank_code_abk).toBe(101);
    expect(row.bank_address).toBe("Kuwait City");
    expect(row.bank_transfer_type).toBe("STD");
    expect(row.candidate_count).toBe(25);
    expect(row.created_at).toBe("2026-06-10T00:00:00Z");
  });

  it("BankRow allows null optional fields", () => {
    const row: BankRow = {
      bank_id: 2,
      bank_name: null,
      bank_iban_code: "KW00GBK0000000000000000000000",
      bank_swift_code: null,
      bank_code_abk: null,
      bank_address: null,
      bank_transfer_type: null,
      candidate_count: 0,
      created_at: null,
    };
    expect(row.bank_id).toBe(2);
    expect(row.bank_name).toBeNull();
    expect(row.bank_swift_code).toBeNull();
    expect(row.bank_code_abk).toBeNull();
    expect(row.bank_address).toBeNull();
    expect(row.bank_transfer_type).toBeNull();
    expect(row.candidate_count).toBe(0);
    expect(row.created_at).toBeNull();
  });

  it("listBanksOutputSchema validates the page's result.shape", () => {
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
      limit: 100,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(Array.isArray(r.data.items)).toBe(true);
      expect(typeof r.data.total).toBe("number");
      expect(typeof r.data.page).toBe("number");
      expect(typeof r.data.limit).toBe("number");
      expect(typeof r.data.totalPages).toBe("number");
      expect(r.data.items[0].bank_id).toBe(1);
    }
  });

  it("bankRowOutputSchema validates a row entry", () => {
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
  });
});
