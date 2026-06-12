import { describe, it, expect } from "vitest";
import { listBanksSchema, bankRowOutputSchema, bankDetailOutputSchema, bankMutationOutputSchema } from "./schemas";

describe("admin bank — data contracts", () => {
  it("listBanksSchema defaults page and limit", () => {
    const r = listBanksSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listBanksSchema accepts search query", () => {
    const r = listBanksSchema.safeParse({ q: "NBK", page: 2, limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("NBK");
    }
  });

  it("listBanksSchema rejects over-limit", () => {
    const r = listBanksSchema.safeParse({ limit: 200 });
    expect(r.success).toBe(false);
  });

  it("bankRowOutputSchema validates a bank row", () => {
    const r = bankRowOutputSchema.safeParse({
      bank_id: 1,
      bank_name: "National Bank of Kuwait",
      bank_iban_code: "KW81NBK000000000000123456",
      bank_swift_code: "NBOKKWKW",
      bank_code_abk: 123,
      bank_address: "Kuwait City",
      bank_transfer_type: "W",
      candidate_count: 42,
      created_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("bankDetailOutputSchema validates bank detail", () => {
    const r = bankDetailOutputSchema.safeParse({
      bank: {
        bank_id: 1,
        bank_name: "National Bank of Kuwait",
        bank_iban_code: "KW81NBK000000000000123456",
        bank_swift_code: "NBOKKWKW",
        bank_code_abk: 123,
        bank_address: "Kuwait City",
        bank_transfer_type: "W",
      },
      candidate_count: 42,
    });
    expect(r.success).toBe(true);
  });

  it("bankMutationOutputSchema validates success response", () => {
    const r = bankMutationOutputSchema.safeParse({
      operation: "success",
      message: "Bank created",
      data: {
        bank_id: 1,
        bank_name: "Test Bank",
        bank_iban_code: "KW81NBK000000000000123456",
        bank_swift_code: null,
        bank_code_abk: null,
        bank_address: null,
        bank_transfer_type: null,
      },
    });
    expect(r.success).toBe(true);
  });

  it("bankMutationOutputSchema validates error response", () => {
    const r = bankMutationOutputSchema.safeParse({
      operation: "error",
      message: "Bank not found",
    });
    expect(r.success).toBe(true);
  });
});
