import { describe, it, expect } from "vitest";
import {
  bankListItemSchema,
  listBanksResultSchema,
  getBankResultSchema,
  createBankResultSchema,
  createBankSchema,
  getBankSchema,
  listBanksSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// bankListItemSchema
// ---------------------------------------------------------------------------
describe("bankListItemSchema", () => {
  const valid = {
    bank_id: 1,
    bank_name: "National Bank of Kuwait",
    bank_iban_code: "KW1234567890",
    bank_swift_code: "NBKOKWKW",
    bank_code_abk: 123,
    bank_address: "Kuwait City",
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
      bankListItemSchema.safeParse({ ...valid, bank_code_abk: "abc" }).success,
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
        bank_name: "NBK",
        bank_iban_code: "KW123",
        bank_swift_code: null,
        bank_code_abk: null,
        bank_address: null,
        bank_transfer_type: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listBanksResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty banks array", () => {
    expect(
      listBanksResultSchema.safeParse({ ...valid, banks: [], total: 0, totalPages: 0 }).success,
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

  it("rejects negative total", () => {
    expect(
      listBanksResultSchema.safeParse({ ...valid, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects non-array banks", () => {
    expect(
      listBanksResultSchema.safeParse({ ...valid, banks: "not-an-array" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getBankResultSchema (nullable)
// ---------------------------------------------------------------------------
describe("getBankResultSchema", () => {
  it("accepts a valid bank", () => {
    const result = getBankResultSchema.safeParse({
      bank_id: 1,
      bank_name: "NBK",
      bank_iban_code: "KW123",
      bank_swift_code: null,
      bank_code_abk: null,
      bank_address: null,
      bank_transfer_type: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts null", () => {
    expect(getBankResultSchema.safeParse(null).success).toBe(true);
  });

  it("rejects invalid data", () => {
    expect(getBankResultSchema.safeParse({ bank_id: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createBankResultSchema
// ---------------------------------------------------------------------------
describe("createBankResultSchema", () => {
  const valid = { operation: "createBank", message: "Bank created successfully" };

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

// ---------------------------------------------------------------------------
// createBankSchema (input)
// ---------------------------------------------------------------------------
describe("createBankSchema", () => {
  it("accepts valid input with all fields", () => {
    expect(
      createBankSchema.safeParse({
        name: "NBK",
        ibanCode: "KW1234567890",
        swiftCode: "NBKOKWKW",
        address: "Kuwait City",
        transferType: "wire",
        codeAbk: 123,
      }).success,
    ).toBe(true);
  });

  it("accepts input with only required fields", () => {
    expect(
      createBankSchema.safeParse({ name: "NBK", ibanCode: "KW123" }).success,
    ).toBe(true);
  });

  it("rejects empty name", () => {
    expect(createBankSchema.safeParse({ name: "", ibanCode: "KW123" }).success).toBe(false);
  });

  it("rejects empty ibanCode", () => {
    expect(createBankSchema.safeParse({ name: "NBK", ibanCode: "" }).success).toBe(false);
  });

  it("rejects missing name", () => {
    expect(createBankSchema.safeParse({ ibanCode: "KW123" }).success).toBe(false);
  });

  it("rejects missing ibanCode", () => {
    expect(createBankSchema.safeParse({ name: "NBK" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getBankSchema (input)
// ---------------------------------------------------------------------------
describe("getBankSchema", () => {
  it("accepts valid id", () => {
    expect(getBankSchema.safeParse({ id: 1 }).success).toBe(true);
  });

  it("rejects missing id", () => {
    expect(getBankSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-positive id", () => {
    expect(getBankSchema.safeParse({ id: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listBanksSchema (input)
// ---------------------------------------------------------------------------
describe("listBanksSchema", () => {
  it("accepts valid params", () => {
    expect(listBanksSchema.safeParse({ page: 1, limit: 20 }).success).toBe(true);
  });

  it("accepts empty object", () => {
    expect(listBanksSchema.safeParse({}).success).toBe(true);
  });
});
