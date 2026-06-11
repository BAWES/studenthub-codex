import { describe, it, expect } from "vitest";
import {
  listBanksSchema,
  createBankSchema,
} from "./actions";
import { bankItemSchema, listBanksResultSchema } from "./schemas";
import type { BankItem, ListBanksResult } from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — listBanks
// ---------------------------------------------------------------------------

describe("listBanksSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listBanksSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("accepts full filter params", () => {
    const r = listBanksSchema.safeParse({
      page: 2,
      limit: 50,
      sortBy: "bank_name",
      sortDir: "asc",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(50);
      expect(r.data.sortBy).toBe("bank_name");
      expect(r.data.sortDir).toBe("asc");
    }
  });

  it("accepts default sort values", () => {
    const r = listBanksSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.sortBy).toBe("bank_name");
      expect(r.data.sortDir).toBe("asc");
    }
  });

  it("rejects limit over 100", () => {
    expect(listBanksSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listBanksSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects invalid sortBy field", () => {
    expect(listBanksSchema.safeParse({ sortBy: "invalid_field" }).success).toBe(false);
  });

  it("rejects invalid sortDir", () => {
    expect(listBanksSchema.safeParse({ sortDir: "sideways" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Schema tests — createBank
// ---------------------------------------------------------------------------

describe("createBankSchema", () => {
  it("accepts valid create params with all fields", () => {
    const r = createBankSchema.safeParse({
      name: "National Bank of Kuwait",
      swift_code: "NBOKKWKW",
      address: "Kuwait City, Abdullah Al-Mubarak St",
      bank_iban_code: "KW123456789012345678901",
      type: "LOC",
      bank_code_abk: 1234,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("National Bank of Kuwait");
      expect(r.data.swift_code).toBe("NBOKKWKW");
      expect(r.data.bank_iban_code).toBe("KW123456789012345678901");
      expect(r.data.bank_code_abk).toBe(1234);
    }
  });

  it("accepts minimal params (bank_iban_code only required field)", () => {
    const r = createBankSchema.safeParse({
      name: "Gulf Bank",
      bank_iban_code: "KW987654321098765432109",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Gulf Bank");
      expect(r.data.bank_iban_code).toBe("KW987654321098765432109");
    }
  });

  it("rejects missing bank_iban_code", () => {
    const r = createBankSchema.safeParse({
      name: "Test Bank",
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty name", () => {
    const r = createBankSchema.safeParse({
      name: "",
      bank_iban_code: "KW000000000000000000000",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests — BankItem
// ---------------------------------------------------------------------------

describe("BankItem type", () => {
  it("has the required shape", () => {
    const item: BankItem = {
      bank_id: 1,
      bank_name: "National Bank of Kuwait",
      bank_iban_code: "KW123456789012345678901",
      bank_swift_code: "NBOKKWKW",
      bank_code_abk: 1234,
      bank_address: "Kuwait City",
      bank_transfer_type: "LOC",
    };
    expect(item.bank_id).toBe(1);
    expect(item.bank_name).toBe("National Bank of Kuwait");
    expect(item.bank_iban_code).toBe("KW123456789012345678901");
  });

  it("accepts null optional fields", () => {
    const item: BankItem = {
      bank_id: 2,
      bank_name: null,
      bank_iban_code: "KW000000000000000000000",
      bank_swift_code: null,
      bank_code_abk: null,
      bank_address: null,
      bank_transfer_type: null,
    };
    expect(item.bank_id).toBe(2);
    expect(item.bank_name).toBeNull();
    expect(item.bank_swift_code).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Type shape tests — ListBanksResult
// ---------------------------------------------------------------------------

describe("ListBanksResult type", () => {
  it("has the correct shape", () => {
    const result: ListBanksResult = {
      banks: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.banks).toHaveLength(0);
    expect(result.totalPages).toBe(0);
  });
});
