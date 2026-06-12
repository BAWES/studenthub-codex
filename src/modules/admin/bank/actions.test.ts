import { describe, it, expect } from "vitest";
import {
  listBanksSchema,
  createBankSchema,
} from "./schemas";
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
      q: "test",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(50);
      expect(r.data.q).toBe("test");
    }
  });

  it("accepts empty search query", () => {
    const r = listBanksSchema.safeParse({ q: "" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("");
    }
  });

  it("rejects limit over 100", () => {
    expect(listBanksSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listBanksSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("coerces string page number", () => {
    const r = listBanksSchema.safeParse({ page: "3" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
    }
  });
});

// ---------------------------------------------------------------------------
// Schema tests — createBank
// ---------------------------------------------------------------------------

describe("createBankSchema", () => {
  it("accepts valid create params with all fields", () => {
    const r = createBankSchema.safeParse({
      bankName: "National Bank of Kuwait",
      bankIbanCode: "KW123456789012345678901",
      bankSwiftCode: "NBOKKWKW",
      bankCodeAbk: 1234,
      bankAddress: "Kuwait City, Abdullah Al-Mubarak St",
      bankTransferType: "LOC",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.bankName).toBe("National Bank of Kuwait");
      expect(r.data.bankSwiftCode).toBe("NBOKKWKW");
      expect(r.data.bankIbanCode).toBe("KW123456789012345678901");
      expect(r.data.bankCodeAbk).toBe(1234);
    }
  });

  it("accepts minimal params (bankName and bankIbanCode required)", () => {
    const r = createBankSchema.safeParse({
      bankName: "Gulf Bank",
      bankIbanCode: "KW987654321098765432109",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.bankName).toBe("Gulf Bank");
      expect(r.data.bankIbanCode).toBe("KW987654321098765432109");
    }
  });

  it("rejects missing bankIbanCode", () => {
    const r = createBankSchema.safeParse({
      bankName: "Test Bank",
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty bankName", () => {
    const r = createBankSchema.safeParse({
      bankName: "",
      bankIbanCode: "KW000000000000000000000",
    });
    expect(r.success).toBe(false);
  });

  it("accepts null optional fields", () => {
    const r = createBankSchema.safeParse({
      bankName: "Test Bank",
      bankIbanCode: "KW111111111111111111111",
      bankSwiftCode: null,
      bankCodeAbk: null,
      bankAddress: null,
      bankTransferType: null,
    });
    expect(r.success).toBe(true);
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
