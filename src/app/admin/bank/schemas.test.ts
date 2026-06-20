import { describe, it, expect } from "vitest";
import {
  bankRowOutputSchema,
  listBanksOutputSchema,
  bankObjectOutputSchema,
  bankDetailOutputSchema,
  bankMutationOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema validation tests
// ---------------------------------------------------------------------------

describe("bankRowOutputSchema", () => {
  const validRow = {
    bank_id: 1,
    bank_name: "National Bank",
    bank_iban_code: "KW61NBK000000000000123456",
    bank_swift_code: "NBKOKWKW",
    bank_code_abk: 123,
    bank_address: "Kuwait City",
    bank_transfer_type: "WIR",
    candidate_count: 5,
    created_at: "2026-06-15T10:00:00",
  };

  it("accepts a valid bank row", () => {
    expect(bankRowOutputSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts null nullable fields", () => {
    expect(
      bankRowOutputSchema.safeParse({
        ...validRow,
        bank_name: null,
        bank_swift_code: null,
        bank_code_abk: null,
        bank_address: null,
        bank_transfer_type: null,
        created_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing bank_id", () => {
    const { bank_id: _, ...rest } = validRow;
    expect(bankRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for bank_id", () => {
    expect(
      bankRowOutputSchema.safeParse({ ...validRow, bank_id: "1" }).success,
    ).toBe(false);
  });

  it("rejects negative candidate_count", () => {
    expect(
      bankRowOutputSchema.safeParse({ ...validRow, candidate_count: -1 })
        .success,
    ).toBe(false);
  });
});

describe("listBanksOutputSchema", () => {
  const validResult = {
    items: [
      {
        bank_id: 1,
        bank_name: "National Bank",
        bank_iban_code: "KW61NBK000000000000123456",
        bank_swift_code: "NBKOKWKW",
        bank_code_abk: 123,
        bank_address: "Kuwait City",
        bank_transfer_type: "WIR",
        candidate_count: 5,
        created_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid paginated result", () => {
    expect(listBanksOutputSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listBanksOutputSchema.safeParse({
        ...validResult,
        items: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResult;
    expect(listBanksOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listBanksOutputSchema.safeParse({ ...validResult, total: -1 }).success,
    ).toBe(false);
  });
});

describe("bankObjectOutputSchema", () => {
  const validObj = {
    bank_id: 1,
    bank_name: "National Bank",
    bank_iban_code: "KW61NBK000000000000123456",
    bank_swift_code: "NBKOKWKW",
    bank_code_abk: 123,
    bank_address: "Kuwait City",
    bank_transfer_type: "WIR",
  };

  it("accepts a valid bank object", () => {
    expect(bankObjectOutputSchema.safeParse(validObj).success).toBe(true);
  });

  it("accepts null nullable fields", () => {
    expect(
      bankObjectOutputSchema.safeParse({
        ...validObj,
        bank_name: null,
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
});

describe("bankDetailOutputSchema", () => {
  const validDetail = {
    bank: {
      bank_id: 1,
      bank_name: "National Bank",
      bank_iban_code: "KW61NBK000000000000123456",
      bank_swift_code: "NBKOKWKW",
      bank_code_abk: 123,
      bank_address: "Kuwait City",
      bank_transfer_type: "WIR",
    },
    candidate_count: 5,
  };

  it("accepts a valid bank detail", () => {
    expect(bankDetailOutputSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null bank", () => {
    expect(
      bankDetailOutputSchema.safeParse({ ...validDetail, bank: null }).success,
    ).toBe(true);
  });

  it("rejects missing candidate_count", () => {
    const { candidate_count: _, ...rest } = validDetail;
    expect(bankDetailOutputSchema.safeParse(rest).success).toBe(false);
  });
});

describe("bankMutationOutputSchema", () => {
  const validSuccess = {
    operation: "success",
    message: "Bank created successfully",
  };

  const validError = {
    operation: "error",
    message: "Bank not found",
  };

  it("accepts success without data", () => {
    expect(bankMutationOutputSchema.safeParse(validSuccess).success).toBe(true);
  });

  it("accepts error response", () => {
    expect(bankMutationOutputSchema.safeParse(validError).success).toBe(true);
  });

  it("accepts success with data", () => {
    expect(
      bankMutationOutputSchema.safeParse({
        ...validSuccess,
        data: {
          bank_id: 1,
          bank_name: "National Bank",
          bank_iban_code: "KW61NBK000000000000123456",
          bank_swift_code: null,
          bank_code_abk: null,
          bank_address: null,
          bank_transfer_type: null,
        },
      }).success,
    ).toBe(true);
  });

  it("rejects invalid operation value", () => {
    expect(
      bankMutationOutputSchema.safeParse({
        operation: "invalid",
        message: "Something",
      }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      bankMutationOutputSchema.safeParse({ operation: "success" }).success,
    ).toBe(false);
  });
});
