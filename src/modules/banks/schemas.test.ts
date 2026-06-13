import { describe, it, expect } from "vitest";
import {
  bankItemSchema,
  listBanksResultSchema,
  createBankResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validBankItem = () => ({
  bank_id: 1,
  bank_name: "National Bank of Kuwait",
  bank_iban_code: "KW00NBK0000000000000000000000",
  bank_swift_code: "NBOKKWKW",
  bank_code_abk: 100,
  bank_address: "Abdullah Al-Ahmed Street, Sharq, Kuwait City",
  bank_transfer_type: "W",
});

const validBankItemMinimal = () => ({
  bank_id: 5,
  bank_name: null,
  bank_iban_code: "KW00BBK0000000000000000000000",
  bank_swift_code: null,
  bank_code_abk: null,
  bank_address: null,
  bank_transfer_type: null,
});

// ---------------------------------------------------------------------------
// bankItemSchema
// ---------------------------------------------------------------------------

describe("bankItemSchema", () => {
  it("accepts a full bank item", () => {
    const r = bankItemSchema.safeParse(validBankItem());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal bank item (nullable fields set to null)", () => {
    const r = bankItemSchema.safeParse(validBankItemMinimal());
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = bankItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const r = bankItemSchema.safeParse({
      ...validBankItem(),
      bank_id: "not-a-number",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing bank_id", () => {
    const r = bankItemSchema.safeParse({
      ...validBankItem(),
      bank_id: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing bank_iban_code", () => {
    const r = bankItemSchema.safeParse({
      ...validBankItem(),
      bank_iban_code: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string bank_name when provided", () => {
    const r = bankItemSchema.safeParse({
      ...validBankItem(),
      bank_name: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number bank_code_abk when provided", () => {
    const r = bankItemSchema.safeParse({
      ...validBankItem(),
      bank_code_abk: "abc",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listBanksResultSchema
// ---------------------------------------------------------------------------

describe("listBanksResultSchema", () => {
  it("accepts a full paginated result", () => {
    const r = listBanksResultSchema.safeParse({
      banks: [validBankItem(), validBankItemMinimal()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty banks array", () => {
    const r = listBanksResultSchema.safeParse({
      banks: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listBanksResultSchema.safeParse({
      banks: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listBanksResultSchema.safeParse({
      banks: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const r = listBanksResultSchema.safeParse({
      banks: [],
      total: 0,
      page: 1,
      limit: 101,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const r = listBanksResultSchema.safeParse({ banks: [] });
    expect(r.success).toBe(false);
  });

  it("rejects invalid bank items in the array", () => {
    const r = listBanksResultSchema.safeParse({
      banks: [{ bank_id: "bad" }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createBankResultSchema
// ---------------------------------------------------------------------------

describe("createBankResultSchema", () => {
  it("accepts a valid create result", () => {
    const r = createBankResultSchema.safeParse({
      bank: validBankItem(),
    });
    expect(r.success).toBe(true);
  });

  it("accepts a minimal bank in create result", () => {
    const r = createBankResultSchema.safeParse({
      bank: validBankItemMinimal(),
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing bank key", () => {
    const r = createBankResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects invalid nested bank", () => {
    const r = createBankResultSchema.safeParse({
      bank: { bank_id: "not-a-number" },
    });
    expect(r.success).toBe(false);
  });

  it("rejects bank with missing iban_code", () => {
    const r = createBankResultSchema.safeParse({
      bank: { ...validBankItem(), bank_iban_code: undefined },
    });
    expect(r.success).toBe(false);
  });
});
