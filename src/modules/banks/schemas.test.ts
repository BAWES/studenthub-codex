import { describe, it, expect } from "vitest";
import {
  bankListItemSchema,
  listBanksResultSchema,
  getBankResultSchema,
  createBankResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// bankListItemSchema
// ---------------------------------------------------------------------------
describe("bankListItemSchema", () => {
  const valid = {
    bank_id: 1,
    bank_name: "National Bank of Kuwait",
    bank_iban_code: "KW1234567890",
    bank_swift_code: "NBOKKWKW",
    bank_code_abk: 123,
    bank_address: "Kuwait City, Kuwait",
    bank_transfer_type: "wire",
  };

  it("accepts a valid bank list item", () => {
    expect(bankListItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable bank_name", () => {
    expect(
      bankListItemSchema.safeParse({ ...valid, bank_name: null }).success,
    ).toBe(true);
  });

  it("accepts nullable bank_swift_code", () => {
    expect(
      bankListItemSchema.safeParse({ ...valid, bank_swift_code: null }).success,
    ).toBe(true);
  });

  it("accepts nullable bank_code_abk", () => {
    expect(
      bankListItemSchema.safeParse({ ...valid, bank_code_abk: null }).success,
    ).toBe(true);
  });

  it("accepts nullable bank_address", () => {
    expect(
      bankListItemSchema.safeParse({ ...valid, bank_address: null }).success,
    ).toBe(true);
  });

  it("accepts nullable bank_transfer_type", () => {
    expect(
      bankListItemSchema.safeParse({ ...valid, bank_transfer_type: null }).success,
    ).toBe(true);
  });

  it("accepts all nullable fields simultaneously", () => {
    expect(
      bankListItemSchema.safeParse({
        bank_id: 1,
        bank_name: null,
        bank_iban_code: "KW1234567890",
        bank_swift_code: null,
        bank_code_abk: null,
        bank_address: null,
        bank_transfer_type: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing bank_id", () => {
    const { bank_id: _, ...rest } = valid;
    expect(bankListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing bank_iban_code", () => {
    const { bank_iban_code: _, ...rest } = valid;
    expect(bankListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for bank_id", () => {
    expect(
      bankListItemSchema.safeParse({ ...valid, bank_id: "not-a-number" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for bank_code_abk", () => {
    expect(
      bankListItemSchema.safeParse({ ...valid, bank_code_abk: "ABC" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listBanksResultSchema
// ---------------------------------------------------------------------------
describe("listBanksResultSchema", () => {
  const valid = {
    banks: [
      {
        bank_id: 1,
        bank_name: "National Bank of Kuwait",
        bank_iban_code: "KW1234567890",
        bank_swift_code: "NBOKKWKW",
        bank_code_abk: null,
        bank_address: null,
        bank_transfer_type: null,
      },
    ],
    total: 1,
    page: 0,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listBanksResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty banks array", () => {
    expect(
      listBanksResultSchema.safeParse({ ...valid, banks: [], total: 0, totalPages: 0 })
        .success,
    ).toBe(true);
  });

  it("rejects missing banks", () => {
    const { banks: _, ...rest } = valid;
    expect(listBanksResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = valid;
    expect(listBanksResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = valid;
    expect(listBanksResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-array banks", () => {
    expect(
      listBanksResultSchema.safeParse({ ...valid, banks: "not-an-array" }).success,
    ).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listBanksResultSchema.safeParse({ ...valid, total: -1 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getBankResultSchema (nullable)
// ---------------------------------------------------------------------------
describe("getBankResultSchema", () => {
  const valid = {
    bank_id: 1,
    bank_name: "National Bank of Kuwait",
    bank_iban_code: "KW1234567890",
    bank_swift_code: "NBOKKWKW",
    bank_code_abk: null,
    bank_address: null,
    bank_transfer_type: null,
  };

  it("accepts null", () => {
    expect(getBankResultSchema.safeParse(null).success).toBe(true);
  });

  it("accepts a valid bank list item", () => {
    expect(getBankResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    expect(
      getBankResultSchema.safeParse({
        bank_id: 1,
        bank_name: null,
        bank_iban_code: "KW1234567890",
        bank_swift_code: null,
        bank_code_abk: null,
        bank_address: null,
        bank_transfer_type: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing bank_id", () => {
    const { bank_id: _, ...rest } = valid;
    expect(getBankResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for bank_id", () => {
    expect(
      getBankResultSchema.safeParse({ ...valid, bank_id: "not-a-number" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createBankResultSchema
// ---------------------------------------------------------------------------
describe("createBankResultSchema", () => {
  const valid = {
    operation: "createBank",
    message: "Bank created successfully",
  };

  it("accepts a valid result", () => {
    expect(createBankResultSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing operation", () => {
    const { operation: _, ...rest } = valid;
    expect(createBankResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing message", () => {
    const { message: _, ...rest } = valid;
    expect(createBankResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for operation", () => {
    expect(
      createBankResultSchema.safeParse({ ...valid, operation: 123 }).success,
    ).toBe(false);
  });
});
