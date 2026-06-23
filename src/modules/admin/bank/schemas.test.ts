import { describe, it, expect } from "vitest";
import {
  bankRowOutputSchema,
  listBanksOutputSchema,
  bankObjectOutputSchema,
  bankDetailOutputSchema,
  bankMutationOutputSchema,
  bankItemSchema,
  listBanksResultSchema,
  bankOperationResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// bankRowOutputSchema
// ---------------------------------------------------------------------------
describe("bankRowOutputSchema", () => {
  const validRow = {
    bank_id: 1,
    bank_name: "National Bank of Kuwait",
    bank_iban_code: "KW00NBOK123456789",
    bank_swift_code: "NBOKKWKW",
    bank_code_abk: 123,
    bank_address: "Kuwait City",
    bank_transfer_type: "SW",
    candidate_count: 42,
    created_at: "2026-06-14T00:00:00Z",
  };

  it("accepts a valid bank row", () => {
    expect(bankRowOutputSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts null bank_name", () => {
    expect(bankRowOutputSchema.safeParse({ ...validRow, bank_name: null }).success).toBe(true);
  });

  it("accepts null bank_swift_code", () => {
    expect(bankRowOutputSchema.safeParse({ ...validRow, bank_swift_code: null }).success).toBe(true);
  });

  it("accepts null bank_code_abk", () => {
    expect(bankRowOutputSchema.safeParse({ ...validRow, bank_code_abk: null }).success).toBe(true);
  });

  it("accepts null bank_address", () => {
    expect(bankRowOutputSchema.safeParse({ ...validRow, bank_address: null }).success).toBe(true);
  });

  it("accepts null bank_transfer_type", () => {
    expect(bankRowOutputSchema.safeParse({ ...validRow, bank_transfer_type: null }).success).toBe(true);
  });

  it("accepts null created_at", () => {
    expect(bankRowOutputSchema.safeParse({ ...validRow, created_at: null }).success).toBe(true);
  });

  it("accepts zero candidate_count", () => {
    expect(bankRowOutputSchema.safeParse({ ...validRow, candidate_count: 0 }).success).toBe(true);
  });

  it("rejects missing bank_id", () => {
    const { bank_id: _, ...rest } = validRow;
    expect(bankRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing bank_iban_code", () => {
    const { bank_iban_code: _, ...rest } = validRow;
    expect(bankRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("allows empty bank_iban_code (schema has z.string() without min)", () => {
    expect(bankRowOutputSchema.safeParse({ ...validRow, bank_iban_code: "" }).success).toBe(true);
  });

  it("rejects negative candidate_count", () => {
    expect(bankRowOutputSchema.safeParse({ ...validRow, candidate_count: -1 }).success).toBe(false);
  });

  it("rejects non-integer bank_id", () => {
    expect(bankRowOutputSchema.safeParse({ ...validRow, bank_id: 1.5 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listBanksOutputSchema
// ---------------------------------------------------------------------------
describe("listBanksOutputSchema", () => {
  const validResponse = {
    items: [
      {
        bank_id: 1,
        bank_name: "NBK",
        bank_iban_code: "KW00NBOK123",
        bank_swift_code: "NBOKKWKW",
        bank_code_abk: 123,
        bank_address: "Kuwait City",
        bank_transfer_type: "SW",
        candidate_count: 10,
        created_at: "2026-06-14T00:00:00Z",
      },
    ],
    total: 50,
    page: 1,
    limit: 20,
    totalPages: 3,
  };

  it("accepts a valid list response", () => {
    expect(listBanksOutputSchema.safeParse(validResponse).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listBanksOutputSchema.safeParse({ ...validResponse, items: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResponse;
    expect(listBanksOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listBanksOutputSchema.safeParse({ ...validResponse, total: -1 }).success).toBe(false);
  });

  it("rejects page 0", () => {
    expect(listBanksOutputSchema.safeParse({ ...validResponse, page: 0 }).success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(
      listBanksOutputSchema.safeParse({ ...validResponse, totalPages: -1 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// bankObjectOutputSchema
// ---------------------------------------------------------------------------
describe("bankObjectOutputSchema", () => {
  const validObj = {
    bank_id: 1,
    bank_name: "NBK",
    bank_iban_code: "KW00NBOK123",
    bank_swift_code: "NBOKKWKW",
    bank_code_abk: 123,
    bank_address: "Kuwait City",
    bank_transfer_type: "SW",
  };

  it("accepts a valid bank object", () => {
    expect(bankObjectOutputSchema.safeParse(validObj).success).toBe(true);
  });

  it("accepts null bank_name", () => {
    expect(bankObjectOutputSchema.safeParse({ ...validObj, bank_name: null }).success).toBe(true);
  });

  it("accepts null fields", () => {
    expect(
      bankObjectOutputSchema.safeParse({
        bank_id: 1,
        bank_name: null,
        bank_iban_code: "KW00",
        bank_swift_code: null,
        bank_code_abk: null,
        bank_address: null,
        bank_transfer_type: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing bank_id", () => {
    const { bank_id: _, ...rest } = validObj;
    expect(bankObjectOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("allows empty bank_iban_code (schema has z.string() without min)", () => {
    expect(bankObjectOutputSchema.safeParse({ ...validObj, bank_iban_code: "" }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// bankDetailOutputSchema
// ---------------------------------------------------------------------------
describe("bankDetailOutputSchema", () => {
  const validDetail = {
    bank: {
      bank_id: 1,
      bank_name: "NBK",
      bank_iban_code: "KW00NBOK123",
      bank_swift_code: "NBOKKWKW",
      bank_code_abk: 123,
      bank_address: "Kuwait City",
      bank_transfer_type: "SW",
    },
    candidate_count: 10,
  };

  it("accepts a valid bank detail", () => {
    expect(bankDetailOutputSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null bank", () => {
    expect(bankDetailOutputSchema.safeParse({ ...validDetail, bank: null }).success).toBe(true);
  });

  it("accepts zero candidate_count", () => {
    expect(bankDetailOutputSchema.safeParse({ ...validDetail, candidate_count: 0 }).success).toBe(true);
  });

  it("rejects missing candidate_count", () => {
    const { candidate_count: _, ...rest } = validDetail;
    expect(bankDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative candidate_count", () => {
    expect(bankDetailOutputSchema.safeParse({ ...validDetail, candidate_count: -1 }).success).toBe(false);
  });

  it("rejects missing bank field", () => {
    const { bank: _, ...rest } = validDetail;
    expect(bankDetailOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// bankMutationOutputSchema
// ---------------------------------------------------------------------------
describe("bankMutationOutputSchema", () => {
  const validSuccess = {
    operation: "success" as const,
    message: "Bank created successfully",
  };

  it("accepts a successful mutation response", () => {
    expect(bankMutationOutputSchema.safeParse(validSuccess).success).toBe(true);
  });

  it("accepts a success response with data", () => {
    expect(
      bankMutationOutputSchema.safeParse({
        ...validSuccess,
        data: {
          bank_id: 1,
          bank_name: "NBK",
          bank_iban_code: "KW00NBOK123",
          bank_swift_code: "NBOKKWKW",
          bank_code_abk: 123,
          bank_address: "Kuwait City",
          bank_transfer_type: "SW",
        },
      }).success,
    ).toBe(true);
  });

  it("accepts an error mutation response", () => {
    expect(
      bankMutationOutputSchema.safeParse({
        operation: "error" as const,
        message: "Bank not found",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid operation value", () => {
    expect(
      bankMutationOutputSchema.safeParse({ operation: "invalid", message: "x" }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(bankMutationOutputSchema.safeParse({ operation: "success" }).success).toBe(false);
  });

  it("allows empty message (schema has z.string() without min)", () => {
    expect(
      bankMutationOutputSchema.safeParse({ operation: "success", message: "" }).success,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// bankItemSchema
// ---------------------------------------------------------------------------
describe("bankItemSchema", () => {
  const validItem = {
    bank_id: 1,
    bank_name: "NBK",
    bank_iban_code: "KW00NBOK123",
    bank_swift_code: "NBOKKWKW",
    bank_code_abk: 123,
    bank_address: "Kuwait City",
    bank_transfer_type: "SW",
  };

  it("accepts a valid bank item", () => {
    expect(bankItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("rejects bank_id 0", () => {
    expect(bankItemSchema.safeParse({ ...validItem, bank_id: 0 }).success).toBe(false);
  });

  it("rejects missing bank_iban_code", () => {
    const { bank_iban_code: _, ...rest } = validItem;
    expect(bankItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listBanksResultSchema
// ---------------------------------------------------------------------------
describe("listBanksResultSchema", () => {
  const validResult = {
    banks: [
      {
        bank_id: 1,
        bank_name: "NBK",
        bank_iban_code: "KW00NBOK123",
        bank_swift_code: "NBOKKWKW",
        bank_code_abk: 123,
        bank_address: "Kuwait City",
        bank_transfer_type: "SW",
      },
    ],
    total: 10,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid list banks result", () => {
    expect(listBanksResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty banks array", () => {
    expect(
      listBanksResultSchema.safeParse({ ...validResult, banks: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects negative total", () => {
    expect(listBanksResultSchema.safeParse({ ...validResult, total: -1 }).success).toBe(false);
  });

  it("rejects missing banks", () => {
    const { banks: _, ...rest } = validResult;
    expect(listBanksResultSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// bankOperationResultSchema
// ---------------------------------------------------------------------------
describe("bankOperationResultSchema", () => {
  it("accepts a valid operation result", () => {
    expect(bankOperationResultSchema.safeParse({ operation: "success", message: "Done" }).success).toBe(
      true,
    );
  });

  it("accepts any operation string", () => {
    expect(bankOperationResultSchema.safeParse({ operation: "created", message: "OK" }).success).toBe(
      true,
    );
  });

  it("rejects missing operation", () => {
    expect(bankOperationResultSchema.safeParse({ message: "Done" }).success).toBe(false);
  });

  it("rejects missing message", () => {
    expect(bankOperationResultSchema.safeParse({ operation: "success" }).success).toBe(false);
  });

  it("allows empty operation (schema has z.string() without min)", () => {
    expect(bankOperationResultSchema.safeParse({ operation: "", message: "Done" }).success).toBe(true);
  });
});
